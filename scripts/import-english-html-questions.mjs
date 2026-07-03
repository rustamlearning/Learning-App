import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import { schoolMaterials } from '../src/data/englishMaterials.js'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = join(projectRoot, 'src/data/htmlQuestionBank.js')
const optionLetters = ['A', 'B', 'C', 'D', 'E']
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

function decodeHtml(value = '') {
  const named = {
    amp: '&', apos: "'", gt: '>', hellip: '…', laquo: '«', ldquo: '“', lsquo: '‘', lt: '<',
    mdash: '—', nbsp: ' ', ndash: '–', quot: '"', raquo: '»', rdquo: '”', rsquo: '’',
  }
  return String(value).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === '#') {
      const hexadecimal = entity[1]?.toLowerCase() === 'x'
      const number = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10)
      return Number.isFinite(number) ? String.fromCodePoint(number) : match
    }
    return named[entity.toLowerCase()] ?? match
  })
}

function normalizeText(value = '') {
  return decodeHtml(value).replace(/\s+/g, ' ').trim()
}

function parseAttributes(source = '') {
  const attributes = {}
  const pattern = /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let match
  while ((match = pattern.exec(source))) {
    attributes[match[1].toLowerCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? '')
  }
  return attributes
}

function parseHtml(source = '') {
  const cleanSource = source
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<!--([\s\S]*?)-->/g, '')
  const root = { tag: 'root', attrs: {}, children: [], parent: null }
  const stack = [root]
  const tokens = cleanSource.match(/<\/?[a-zA-Z][^>]*>|[^<]+/g) || []

  tokens.forEach((token) => {
    if (!token.startsWith('<')) {
      stack.at(-1).children.push({ tag: '#text', text: token, attrs: {}, children: [], parent: stack.at(-1) })
      return
    }
    if (/^<\//.test(token)) {
      const closingTag = token.match(/^<\/\s*([\w-]+)/)?.[1]?.toLowerCase()
      if (!closingTag) return
      for (let index = stack.length - 1; index > 0; index -= 1) {
        if (stack[index].tag === closingTag) {
          stack.length = index
          return
        }
      }
      return
    }

    const opening = token.match(/^<\s*([\w-]+)([\s\S]*?)\/?\s*>$/)
    if (!opening) return
    const tag = opening[1].toLowerCase()
    const node = { tag, attrs: parseAttributes(opening[2]), children: [], parent: stack.at(-1) }
    stack.at(-1).children.push(node)
    if (!voidTags.has(tag) && !/\/\s*>$/.test(token)) stack.push(node)
  })

  return root
}

function classTokens(node) {
  return String(node?.attrs?.class || '').split(/\s+/).filter(Boolean)
}

function hasClass(node, className) {
  return classTokens(node).includes(className)
}

function hasOptionClass(node) {
  return classTokens(node).some((token) => /(?:^|-)(?:option|opt|choice|answer)s?$/.test(token))
}

function descendants(node, predicate, rows = []) {
  for (const child of node?.children || []) {
    if (child.tag !== '#text' && predicate(child)) rows.push(child)
    descendants(child, predicate, rows)
  }
  return rows
}

function nodeText(node) {
  if (!node) return ''
  if (node.tag === '#text') return normalizeText(node.text)
  return normalizeText((node.children || []).map(nodeText).filter(Boolean).join(' '))
}

function isInsideOption(node, boundary) {
  for (let current = node?.parent; current && current !== boundary; current = current.parent) {
    if (current.tag === 'button' || current.tag === 'label' || hasClass(current, 'options') || hasClass(current, 'opts')) return true
  }
  return false
}

function cleanOptionText(value = '') {
  return normalizeText(value).replace(/^\s*[A-E](?:\s*[.)]|\s+)\s*/i, '').trim()
}

function getHtmlOptions(card) {
  const optionNodes = descendants(card, (node) => {
    if (!['button', 'label'].includes(node.tag)) return false
    if (node.tag === 'button' && (
      hasOptionClass(node)
      || node.attrs['data-correct'] !== undefined
      || node.attrs['data-answer'] !== undefined
      || hasOptionClass(node.parent)
    )) return true
    if (node.tag === 'label' && descendants(node, (child) => child.tag === 'input' && child.attrs.type === 'radio').length) return true
    return false
  })

  return optionNodes.map((node) => ({
    node,
    text: cleanOptionText(nodeText(node)),
  })).filter((item) => item.text)
}

function isQuestionMetadata(value = '') {
  return /^(?:(?:LOTS|MOTS|HOTS)\s*)?(?:(?:Soal|Formatif|Sumatif)\s*)?\d+$/i.test(normalizeText(value))
}

function getHtmlQuestionText(card) {
  const preferredClasses = ['quiz-question', 'quiz-q', 'q-text', 'qtext', 'q-title', 'question-text', 'question-title', 'quiz-title', 'prompt', 'stem']
  for (const className of preferredClasses) {
    const node = descendants(card, (item) => hasClass(item, className))[0]
    const text = nodeText(node)
    if (text && !isQuestionMetadata(text)) return text.replace(/^\d+[.)]\s*/, '')
  }

  const paragraphs = descendants(card, (node) => node.tag === 'p' && !hasClass(node, 'feedback') && !hasClass(node, 'q-feedback'))
    .filter((node) => !isInsideOption(node, card))
  const paragraph = paragraphs.find((node) => nodeText(node).length > 15)
  if (paragraph) return nodeText(paragraph).replace(/^\d+[.)]\s*/, '')

  const strong = descendants(card, (node) => ['strong', 'b'].includes(node.tag))
    .find((node) => (
      !isInsideOption(node, card)
      && nodeText(node).length > 15
      && !isQuestionMetadata(nodeText(node))
    ))
  if (strong) return nodeText(strong).replace(/^\d+[.)]\s*/, '')

  const heading = descendants(card, (node) => ['h3', 'h4', 'h5'].includes(node.tag))
    .find((node) => !isInsideOption(node, card) && nodeText(node).length > 8 && !isQuestionMetadata(nodeText(node)))
  return nodeText(heading).replace(/^\d+[.)]\s*/, '')
}

function difficultyFromLevel(value = '') {
  const level = normalizeText(value).toUpperCase()
  if (level.includes('HOTS')) return 'Sulit'
  if (level.includes('MOTS')) return 'Sedang'
  return 'Mudah'
}

function getHtmlDifficulty(card) {
  if (card.attrs['data-level']) return difficultyFromLevel(card.attrs['data-level'])
  const levelNode = descendants(card, (node) => classTokens(node).some((token) => ['level', 'badge', 'q-meta', 'q-top', 'qtop'].includes(token)))
    .find((node) => /\b(?:LOTS|MOTS|HOTS)\b/i.test(nodeText(node)))
  return difficultyFromLevel(nodeText(levelNode))
}

function getOptionInput(optionRow) {
  return descendants(optionRow?.node, (node) => node.tag === 'input')[0]
}

function getExternalCardAnswer(card, optionRows, answerSources) {
  const input = optionRows.map(getOptionInput).find(Boolean)
  const firstOptionNode = optionRows[0]?.node
  const name = String(input?.attrs?.name || card?.attrs?.id || '')
  if (name && Object.prototype.hasOwnProperty.call(answerSources.byName, name)) return answerSources.byName[name]
  const dataQuestionIndex = Number(firstOptionNode?.attrs?.['data-q'])
  if (Number.isInteger(dataQuestionIndex) && dataQuestionIndex >= 0 && dataQuestionIndex < answerSources.byIndex.length) {
    return answerSources.byIndex[dataQuestionIndex]
  }
  const number = Number(name.match(/(\d+)$/)?.[1] || 0)
  if (number > 0 && number <= answerSources.byIndex.length) return answerSources.byIndex[number - 1]
  return undefined
}

function getHtmlCorrectIndex(card, optionRows, answerSources) {
  const externalAnswer = getExternalCardAnswer(card, optionRows, answerSources)
  const cardAnswer = card.attrs['data-answer'] || card.attrs['data-correct'] || card.attrs['data-practice']
  const rawAnswer = String(cardAnswer || cardAnswer === 0 ? cardAnswer : externalAnswer ?? '').trim()
  if (/^[A-E]$/i.test(rawAnswer)) return rawAnswer.toUpperCase().charCodeAt(0) - 65
  if (/^\d+$/.test(rawAnswer)) {
    const matchingInputIndex = optionRows.findIndex(({ node }) => descendants(node, (child) => child.tag === 'input' && child.attrs.value === rawAnswer).length > 0)
    if (matchingInputIndex >= 0) return matchingInputIndex
    const numericIndex = Number(rawAnswer)
    if (numericIndex >= 0 && numericIndex < optionRows.length) return numericIndex
  }
  if (rawAnswer) {
    const textIndex = optionRows.findIndex((item) => normalizeQuestionKey(item.text) === normalizeQuestionKey(rawAnswer))
    if (textIndex >= 0) return textIndex
  }
  return optionRows.findIndex(({ node }) => (
    ['true', '1', 'correct', 'benar'].includes(String(node.attrs['data-correct'] || node.attrs['data-answer'] || '').toLowerCase())
    || descendants(node, (child) => ['true', '1', 'correct', 'benar'].includes(String(child.attrs['data-correct'] || child.attrs['data-answer'] || '').toLowerCase())).length > 0
  ))
}

function extractHtmlQuestions(html) {
  const tree = parseHtml(html)
  const answerSources = extractAnswerSources(html)
  const candidates = descendants(tree, (node) => {
    const classes = classTokens(node)
    const optionRows = getHtmlOptions(node)
    if (optionRows.length < 3) return false
    const hasCorrectMarker = descendants(node, (child) => child.attrs['data-correct'] !== undefined || child.attrs['data-answer'] !== undefined).length > 0
    const knownQuestionClass = classes.some((item) => ['quiz-card', 'question-card', 'q-card', 'qcard', 'quiz-item', 'question-item', 'soal-card', 'mcq', 'q'].includes(item))
    const hasExternalAnswer = getExternalCardAnswer(node, optionRows, answerSources) !== undefined
    return Boolean(node.attrs['data-answer'] || node.attrs['data-correct'] || node.attrs['data-practice'])
      || (knownQuestionClass && hasCorrectMarker)
      || (knownQuestionClass && hasExternalAnswer)
      || (node.tag === 'article' && hasCorrectMarker)
      || (node.tag === 'article' && hasExternalAnswer)
  })

  return candidates.map((card) => {
    const optionRows = getHtmlOptions(card)
    const correctIndex = getHtmlCorrectIndex(card, optionRows, answerSources)
    const feedback = descendants(card, (node) => hasClass(node, 'feedback') || hasClass(node, 'q-feedback'))[0]
    return {
      questionText: getHtmlQuestionText(card),
      options: optionRows.map((item) => item.text),
      correctIndex,
      explanation: normalizeText(card.attrs['data-exp'] || card.attrs['data-explain'] || feedback?.attrs?.['data-exp'] || nodeText(feedback)),
      difficulty: getHtmlDifficulty(card),
    }
  }).filter((row) => row.questionText && row.options.length >= 3 && row.correctIndex >= 0 && row.correctIndex < row.options.length)
}

function extractArrayLiteral(source, startIndex) {
  return extractBalancedLiteral(source, startIndex, '[', ']')
}

function extractBalancedLiteral(source, startIndex, openCharacter, closeCharacter) {
  let depth = 0
  let quote = ''
  let escaped = false
  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index]
    if (quote) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) quote = ''
      continue
    }
    if (['"', "'", '`'].includes(char)) {
      quote = char
      continue
    }
    if (char === openCharacter) depth += 1
    if (char === closeCharacter) {
      depth -= 1
      if (depth === 0) return source.slice(startIndex, index + 1)
    }
  }
  return ''
}

function extractAnswerSources(html) {
  const byName = {}
  let byIndex = []
  const pattern = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([\[{])/gi
  let match
  while ((match = pattern.exec(html))) {
    if (!/(?:answer|key|correct|ans)/i.test(match[1])) continue
    const openCharacter = match[2]
    const closeCharacter = openCharacter === '[' ? ']' : '}'
    const startIndex = html.indexOf(openCharacter, match.index)
    const literal = extractBalancedLiteral(html, startIndex, openCharacter, closeCharacter)
    if (!literal) continue
    try {
      const value = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 })
      if (Array.isArray(value) && value.length > byIndex.length && value.every((item) => ['string', 'number'].includes(typeof item))) {
        byIndex = value
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.entries(value).forEach(([key, answer]) => {
          if (['string', 'number'].includes(typeof answer)) byName[key] = answer
        })
      }
    } catch {
      // Ignore answer helpers that depend on browser variables.
    }
    pattern.lastIndex = startIndex + literal.length
  }
  return { byName, byIndex }
}

function normalizeArrayQuestion(row) {
  if (row && !Array.isArray(row) && typeof row === 'object') {
    const rawOptions = row.options || row.opts || row.o || row.pilihan || row.choices || row.answers || (Array.isArray(row.a) ? row.a : [])
    const options = Array.isArray(rawOptions)
      ? rawOptions
      : rawOptions && typeof rawOptions === 'object' ? Object.values(rawOptions) : []
    const answer = row.answer
      ?? row.ans
      ?? (!Array.isArray(row.a) ? row.a : undefined)
      ?? row.correct
      ?? row.correctAnswer
      ?? row.c
      ?? row.k
      ?? row.key
      ?? row.kunci
      ?? row.jawaban
    const correctIndex = typeof answer === 'number'
      ? answer
      : /^[A-E]$/i.test(String(answer || '')) ? String(answer).toUpperCase().charCodeAt(0) - 65 : options.indexOf(answer)
    return {
      questionText: row.q || row.question || row.questionText || row.soal || row.prompt || row.stem || row.text || '',
      options,
      correctIndex,
      explanation: row.exp || row.ex || row.e || row.explain || row.explanation || row.pembahasan || row.alasan || '',
      difficulty: difficultyFromLevel(row.level || row.difficulty || row.tingkat || ''),
    }
  }

  if (!Array.isArray(row)) return null
  let level = ''
  let questionText = ''
  let options = []
  let answer
  let explanation = ''
  if (typeof row[1] === 'number' && Array.isArray(row[3])) {
    [level, , questionText, options, answer, explanation] = row
  } else if (Array.isArray(row[2])) {
    [level, questionText, options, answer, explanation] = row
  } else if (Array.isArray(row[1])) {
    [questionText, options, answer, explanation] = row
  }
  const correctIndex = typeof answer === 'number'
    ? answer
    : /^[A-E]$/i.test(String(answer || '')) ? String(answer).toUpperCase().charCodeAt(0) - 65 : options.indexOf(answer)
  return { questionText, options, correctIndex, explanation, difficulty: difficultyFromLevel(level) }
}

function extractScriptQuestions(html) {
  const rows = []
  const pattern = /\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*\[/g
  let match
  while ((match = pattern.exec(html))) {
    const startIndex = html.indexOf('[', match.index)
    const literal = extractArrayLiteral(html, startIndex)
    if (!literal) continue
    try {
      const data = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 })
      if (Array.isArray(data)) rows.push(...data.map(normalizeArrayQuestion).filter(Boolean))
    } catch {
      // Ignore UI/config arrays that depend on browser variables.
    }
    pattern.lastIndex = startIndex + literal.length
  }
  const nestedPattern = /\b[A-Za-z_$][\w$]*\s*:\s*\[/g
  while ((match = nestedPattern.exec(html))) {
    const startIndex = html.indexOf('[', match.index)
    const literal = extractArrayLiteral(html, startIndex)
    if (!literal) continue
    try {
      const data = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 })
      if (Array.isArray(data)) rows.push(...data.map(normalizeArrayQuestion).filter(Boolean))
    } catch {
      // Ignore nested UI/config arrays that depend on browser variables.
    }
    nestedPattern.lastIndex = startIndex + literal.length
  }
  return rows.filter((row) => row.questionText && Array.isArray(row.options) && row.options.length >= 3 && row.correctIndex >= 0 && row.correctIndex < row.options.length)
}

function slugify(value = '') {
  return String(value).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function chapterNumber(material) {
  const match = `${material.title} ${material.topic} ${material.content}`.match(/\b(?:chapter|bab)\s*[-.:]?\s*(\d{1,2})\b/i)
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY
}

function gradeNumber(className = '') {
  if (/\bXII\b/i.test(className)) return 12
  if (/\bXI\b/i.test(className)) return 11
  return 10
}

function normalizeQuestionKey(value = '') {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function questionDifficulty(row) {
  if (['Mudah', 'Sedang', 'Sulit'].includes(row.difficulty)) return row.difficulty
  return 'Mudah'
}

const materials = schoolMaterials
  .filter((item) => item.type === 'HTML')
  .sort((left, right) => gradeNumber(left.className) - gradeNumber(right.className)
    || left.subject.localeCompare(right.subject, 'id-ID', { numeric: true })
    || chapterNumber(left) - chapterNumber(right)
    || left.title.localeCompare(right.title, 'id-ID', { numeric: true }))

const questions = []
const summary = []

for (const [materialIndex, material] of materials.entries()) {
  const html = await readFile(join(projectRoot, 'public', material.content), 'utf8')
  const extractedRows = [...extractHtmlQuestions(html), ...extractScriptQuestions(html)]
  const seen = new Set()
  const uniqueRows = extractedRows.filter((row) => {
    const key = normalizeQuestionKey(row.questionText)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

  const questionStartIndex = questions.length
  uniqueRows.forEach((row, questionIndex) => {
    const options = row.options.map(normalizeText).filter(Boolean).slice(0, optionLetters.length)
    const correctAnswer = options[row.correctIndex]
    if (!correctAnswer) return
    questions.push({
      id: `school-html-question-${slugify(material.id.replace(/^school-/, ''))}-${String(questionIndex + 1).padStart(3, '0')}`,
      questionText: normalizeText(row.questionText),
      options,
      correctAnswer,
      explanation: normalizeText(row.explanation) || 'Pembahasan mengikuti materi HTML sumber.',
      subject: material.subject,
      className: material.className,
      topic: `${material.className} · ${material.title}`,
      difficulty: questionDifficulty(row),
      type: 'Pilihan ganda',
      media: [],
      source: 'school-content',
      sourceMaterialId: material.id,
      sourceMaterialTitle: material.title,
      sourceMaterialPath: material.content,
      sourceMaterialOrder: materialIndex + 1,
      sourceQuestionOrder: questionIndex + 1,
    })
  })

  summary.push({
    subject: material.subject,
    className: material.className,
    materialId: material.id,
    materialTitle: material.title,
    chapter: chapterNumber(material),
    questionCount: questions.length - questionStartIndex,
  })
}

const output = `// Generated by scripts/import-english-html-questions.mjs. Do not edit manually.\n`
  + `export const htmlQuestionSummary = ${JSON.stringify(summary, null, 2)}\n\n`
  + `export const htmlQuestionBank = ${JSON.stringify(questions, null, 2)}\n`

await writeFile(outputPath, output)

console.log(`Imported ${questions.length} multiple-choice questions from ${materials.length} HTML materials.`)
const subjectCounts = questions.reduce((counts, question) => {
  counts[question.subject] = (counts[question.subject] || 0) + 1
  return counts
}, {})
Object.entries(subjectCounts).forEach(([subject, count]) => console.log(`${subject}\t${count}`))
const emptyMaterials = summary.filter((item) => item.questionCount === 0)
console.log(`Materials without extracted questions: ${emptyMaterials.length}`)
emptyMaterials.forEach((item) => console.log(`EMPTY\t${item.className}\t${item.materialTitle}\t${item.materialId}`))
