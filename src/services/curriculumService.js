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
