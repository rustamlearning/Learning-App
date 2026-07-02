import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import { schoolMaterials } from '../src/data/englishMaterials.js'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = join(projectRoot, 'src/data/englishQuestionBank.js')
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
    if (node.tag === 'button' && hasClass(node, 'option')) return true
    if (node.tag === 'label' && descendants(node, (child) => child.tag === 'input' && child.attrs.type === 'radio').length) return true
    return false
  })

  return optionNodes.map((node) => ({
    node,
    text: cleanOptionText(nodeText(node)),
  })).filter((item) => item.text)
}

function getHtmlQuestionText(card) {
  const preferredClasses = ['quiz-q', 'q-text', 'question-text', 'prompt', 'stem']
  for (const className of preferredClasses) {
    const node = descendants(card, (item) => hasClass(item, className))[0]
    if (nodeText(node)) return nodeText(node).replace(/^\d+[.)]\s*/, '')
  }

  const paragraphs = descendants(card, (node) => node.tag === 'p' && !hasClass(node, 'feedback') && !hasClass(node, 'q-feedback'))
    .filter((node) => !isInsideOption(node, card))
  const paragraph = paragraphs.find((node) => nodeText(node).length > 15)
  if (paragraph) return nodeText(paragraph).replace(/^\d+[.)]\s*/, '')

  const strong = descendants(card, (node) => node.tag === 'strong')
    .find((node) => !isInsideOption(node, card) && nodeText(node).length > 15)
  if (strong) return nodeText(strong).replace(/^\d+[.)]\s*/, '')

  const heading = descendants(card, (node) => ['h3', 'h4', 'h5'].includes(node.tag))
    .find((node) => !isInsideOption(node, card) && nodeText(node).length > 8)
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

function getHtmlCorrectIndex(card, optionRows) {
  const rawAnswer = String(card.attrs['data-answer'] || card.attrs['data-practice'] || '').trim()
  if (/^[A-E]$/i.test(rawAnswer)) return rawAnswer.toUpperCase().charCodeAt(0) - 65
  if (/^\d+$/.test(rawAnswer)) {
    const matchingInputIndex = optionRows.findIndex(({ node }) => descendants(node, (child) => child.tag === 'input' && child.attrs.value === rawAnswer).length > 0)
    if (matchingInputIndex >= 0) return matchingInputIndex
    const numericIndex = Number(rawAnswer)
    if (numericIndex >= 0 && numericIndex < optionRows.length) return numericIndex
  }
  return optionRows.findIndex(({ node }) => node.attrs['data-correct'] === 'true' || descendants(node, (child) => child.attrs['data-correct'] === 'true').length > 0)
}

function extractHtmlQuestions(html) {
  const tree = parseHtml(html)
  const candidates = descendants(tree, (node) => {
    const classes = classTokens(node)
    return Boolean(node.attrs['data-answer'] || node.attrs['data-practice'])
      || (classes.some((item) => ['quiz-card', 'question-card', 'q-card', 'q'].includes(item))
        && descendants(node, (child) => child.attrs['data-correct'] === 'true').length > 0)
  })

  return candidates.map((card) => {
    const optionRows = getHtmlOptions(card)
    const correctIndex = getHtmlCorrectIndex(card, optionRows)
    const feedback = descendants(card, (node) => hasClass(node, 'feedback') || hasClass(node, 'q-feedback'))[0]
    return {
      questionText: getHtmlQuestionText(card),
      options: optionRows.map((item) => item.text),
      correctIndex,
      explanation: normalizeText(card.attrs['data-exp'] || card.attrs['data-explain'] || feedback?.attrs?.['data-exp'] || nodeText(feedback)),
      difficulty: getHtmlDifficulty(card),
    }
  }).filter((row) => row.questionText && row.options.length >= 2 && row.correctIndex >= 0 && row.correctIndex < row.options.length)
}

function extractArrayLiteral(source, startIndex) {
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
    if (char === '[') depth += 1
    if (char === ']') {
      depth -= 1
      if (depth === 0) return source.slice(startIndex, index + 1)
    }
  }
  return ''
}

function normalizeArrayQuestion(row) {
  if (row && !Array.isArray(row) && typeof row === 'object') {
    const options = row.options || row.opts || []
    const answer = row.answer ?? row.ans ?? row.a
    const correctIndex = typeof answer === 'number'
      ? answer
      : /^[A-E]$/i.test(String(answer || '')) ? String(answer).toUpperCase().charCodeAt(0) - 65 : options.indexOf(answer)
    return {
      questionText: row.q || row.question || row.questionText || '',
      options,
      correctIndex,
      explanation: row.exp || row.ex || row.explain || row.explanation || '',
      difficulty: difficultyFromLevel(row.level || ''),
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
  const pattern = /\b(?:const|let|var)\s+(?:quizData|quiz|QUIZ)\s*=\s*\[/g
  let match
  while ((match = pattern.exec(html))) {
    const startIndex = html.indexOf('[', match.index)
    const literal = extractArrayLiteral(html, startIndex)
    if (!literal) continue
    const data = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 })
    if (Array.isArray(data)) rows.push(...data.map(normalizeArrayQuestion).filter(Boolean))
    pattern.lastIndex = startIndex + literal.length
  }
  return rows.filter((row) => row.questionText && Array.isArray(row.options) && row.options.length >= 2 && row.correctIndex >= 0 && row.correctIndex < row.options.length)
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
  .filter((item) => item.subject === 'Bahasa Inggris' && item.type === 'HTML')
  .sort((left, right) => gradeNumber(left.className) - gradeNumber(right.className)
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

  uniqueRows.forEach((row, questionIndex) => {
    const options = row.options.map(normalizeText).filter(Boolean).slice(0, optionLetters.length)
    const correctAnswer = options[row.correctIndex]
    if (!correctAnswer) return
    questions.push({
      id: `english-html-${slugify(material.id.replace(/^school-bahasa-inggris-/, ''))}-${String(questionIndex + 1).padStart(3, '0')}`,
      questionText: normalizeText(row.questionText),
      options,
      correctAnswer,
      explanation: normalizeText(row.explanation) || 'Pembahasan mengikuti materi HTML sumber.',
      subject: 'Bahasa Inggris',
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
    className: material.className,
    materialId: material.id,
    materialTitle: material.title,
    chapter: chapterNumber(material),
    questionCount: uniqueRows.length,
  })
}

const output = `// Generated by scripts/import-english-html-questions.mjs. Do not edit manually.\n`
  + `export const englishHtmlQuestionSummary = ${JSON.stringify(summary, null, 2)}\n\n`
  + `export const englishHtmlQuestionBank = ${JSON.stringify(questions, null, 2)}\n`

await writeFile(outputPath, output)

console.log(`Imported ${questions.length} English multiple-choice questions from ${materials.length} HTML materials.`)
summary.forEach((item) => console.log(`${item.className}\tChapter ${item.chapter}\t${item.questionCount}\t${item.materialTitle}`))
