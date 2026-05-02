import {
  activities,
  assignments,
  badges,
  classes,
  flashcardDecks,
  leaderboard,
  materials,
  questions,
  quizzes,
  remedials,
  students,
  subjects,
  teachers,
} from '../data/dummyData.js'

const collections = {
  activities,
  assignments,
  badges,
  classes,
  flashcardDecks,
  leaderboard,
  materials,
  questions,
  quizzes,
  remedials,
  students,
  subjects,
  teachers,
}

export async function list(collectionName) {
  await wait(120)
  return collections[collectionName] || []
}

export async function create(collectionName, payload) {
  await wait(160)
  const item = { id: `${collectionName}-${Date.now()}`, ...payload }
  collections[collectionName] = [item, ...(collections[collectionName] || [])]
  return item
}

export async function update(collectionName, id, payload) {
  await wait(160)
  collections[collectionName] = (collections[collectionName] || []).map((item) => (item.id === id ? { ...item, ...payload } : item))
  return collections[collectionName].find((item) => item.id === id)
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
