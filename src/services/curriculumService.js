import { listRows } from './supabaseClient.js'

const EMPTY_CURRICULUM = {
  academicYears: [],
  semesters: [],
  subjects: [],
  phases: [],
  elements: [],
  outcomes: [],
  objectives: [],
  flows: [],
}

export async function fetchCurriculumOverview({ accessToken } = {}) {
  if (!accessToken) return EMPTY_CURRICULUM

  const [
    academicYears,
    semesters,
    subjects,
    phases,
    elements,
    outcomes,
    objectives,
    flows,
  ] = await Promise.all([
    listRows('academic_years', { select: '*', accessToken }),
    listRows('semesters', { select: '*', accessToken }),
    listRows('curriculum_subjects', { select: '*', accessToken }),
    listRows('curriculum_phases', { select: '*', accessToken }),
    listRows('curriculum_elements', { select: '*', accessToken }),
    listRows('learning_outcomes', { select: '*', accessToken }),
    listRows('learning_objectives', { select: '*', accessToken }),
    listRows('learning_objective_flow', { select: '*', accessToken }),
  ])

  const subjectMap = new Map(subjects.map((item) => [item.id, item]))
  const phaseMap = new Map(phases.map((item) => [item.id, item]))
  const elementMap = new Map(elements.map((item) => [item.id, item]))
  const outcomeMap = new Map(outcomes.map((item) => [item.id, item]))

  const enrichedOutcomes = outcomes.map((item) => ({
    ...item,
    subjectName: subjectMap.get(item.subject_id)?.name || 'Mata pelajaran',
    subjectCode: subjectMap.get(item.subject_id)?.code || '',
    phaseName: phaseMap.get(item.phase_id)?.name || 'Fase',
    elementName: elementMap.get(item.element_id)?.name || 'Elemen',
  }))

  const enrichedObjectives = objectives.map((item) => {
    const outcome = outcomeMap.get(item.learning_outcome_id)
    const subject = subjectMap.get(item.subject_id)
    const phase = phaseMap.get(item.phase_id)
    return {
      ...item,
      subjectName: subject?.name || 'Mata pelajaran',
      subjectCode: subject?.code || '',
      phaseName: phase?.name || 'Fase',
      outcomeCode: outcome?.code || '',
      outcomeStatement: outcome?.statement || '',
    }
  })

  const enrichedFlows = flows.map((item) => ({
    ...item,
    subjectName: subjectMap.get(item.subject_id)?.name || 'Mata pelajaran',
    phaseName: phaseMap.get(item.phase_id)?.name || 'Fase',
    objective: enrichedObjectives.find((objective) => objective.id === item.learning_objective_id),
  }))

  return {
    academicYears,
    semesters,
    subjects: subjects.sort((a, b) => String(a.name).localeCompare(String(b.name))),
    phases,
    elements,
    outcomes: enrichedOutcomes,
    objectives: enrichedObjectives.sort((a, b) => String(a.code).localeCompare(String(b.code))),
    flows: enrichedFlows.sort((a, b) => (a.grade || 0) - (b.grade || 0) || (a.semester || 0) - (b.semester || 0) || (a.sequence_number || 0) - (b.sequence_number || 0)),
  }
}

export function emptyCurriculumOverview() {
  return EMPTY_CURRICULUM
}


export async function fetchCurriculumContentAudit({ accessToken } = {}) {
  if (!accessToken) {
    return {
      totals: { total: 0, linked: 0, unlinked: 0, percentage: 0 },
      summary: [],
      unlinkedItems: [],
    }
  }

  const [materials, assignments, questions, quizzes] = await Promise.all([
    listRows('materials', {
      select: 'id,title,status,topic,learning_objective_id,created_at,subjects(name),classes(name),users_profile(name)',
      accessToken,
    }),
    listRows('assignments', {
      select: 'id,title,status,deadline,learning_objective_id,created_at,subjects(name),classes(name),users_profile(name)',
      accessToken,
    }),
    listRows('questions', {
      select: 'id,question_text,topic,difficulty,learning_objective_id,created_at,subjects(name),classes(name),users_profile(name)',
      accessToken,
    }),
    listRows('quizzes', {
      select: 'id,title,status,duration,learning_objective_id,created_at,subjects(name),classes(name),users_profile(name)',
      accessToken,
    }),
  ])

  const groups = [
    { id: 'materials', label: 'Materi', rows: materials, titleKey: 'title', type: 'Materi' },
    { id: 'assignments', label: 'Tugas', rows: assignments, titleKey: 'title', type: 'Tugas' },
    { id: 'questions', label: 'Bank Soal', rows: questions, titleKey: 'question_text', type: 'Soal' },
    { id: 'quizzes', label: 'Kuis', rows: quizzes, titleKey: 'title', type: 'Kuis' },
  ]

  const summary = groups.map((group) => {
    const total = group.rows.length
    const linked = group.rows.filter((item) => item.learning_objective_id).length
    const unlinked = total - linked
    const percentage = total ? Math.round((linked / total) * 100) : 0

    return {
      id: group.id,
      label: group.label,
      total,
      linked,
      unlinked,
      percentage,
    }
  })

  const unlinkedItems = groups.flatMap((group) => (
    group.rows
      .filter((item) => !item.learning_objective_id)
      .map((item) => ({
        id: item.id,
        type: group.type,
        title: item[group.titleKey] || 'Tanpa judul',
        status: item.status || item.difficulty || '-',
        subject: item.subjects?.name || 'Mata pelajaran',
        className: item.classes?.name || 'Kelas umum',
        teacher: item.users_profile?.name || 'Guru',
        createdAt: item.created_at,
      }))
  ))

  const total = summary.reduce((sum, item) => sum + item.total, 0)
  const linked = summary.reduce((sum, item) => sum + item.linked, 0)
  const unlinked = summary.reduce((sum, item) => sum + item.unlinked, 0)

  return {
    totals: {
      total,
      linked,
      unlinked,
      percentage: total ? Math.round((linked / total) * 100) : 0,
    },
    summary,
    unlinkedItems,
  }
}
