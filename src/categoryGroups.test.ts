import { describe, expect, it } from 'vitest'
import { generateQuiz, parseCsv } from '@engine'
import { groupCategories } from '@engine/utils/categoryGroups'
import caribbeanCsv from './data/caribbean.csv?raw'
import { shapes } from './data/shapes'
import { appSpec } from './appSpec'

const rows = parseCsv(caribbeanCsv)
const dataset = appSpec.buildDataset(rows, null)
const quiz = generateQuiz(rows, dataset.schema, { seed: 'groups', shapes, mapTargets: dataset.map?.targets })

describe('regroupement des catégories de l’accueil', () => {
  const groups = dataset.categoryGroups!

  it('toutes les catégories du quiz sont rangées dans un groupe (aucune « Autres »)', () => {
    const views = groupCategories(quiz.categories, groups, 'fr')
    expect(views.find((view) => view.other)?.categories.map((c) => c.id) ?? []).toEqual([])
    expect(views.flatMap((view) => view.categories)).toHaveLength(quiz.categories.length)
  })

  it('aucun groupe ne cite une catégorie qui n’existe pas, ni deux fois la même', () => {
    const known = new Set(quiz.categories.map((category) => category.id))
    const cited = groups.flatMap((group) => group.categories)
    expect(cited.filter((id) => !known.has(id))).toEqual([])
    expect(new Set(cited).size).toBe(cited.length)
  })

  it.each(['fr', 'en', 'es', 'nl', 'ht'])('%s : chaque groupe a un intitulé', (locale) => {
    for (const group of groups) expect(group.labels[locale], group.id).toBeTruthy()
  })
})
