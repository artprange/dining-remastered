import { describe, expect, it, vi, afterEach } from 'vitest'
import { createCatalog, type CatalogEntry } from './catalog'
import { formatDate } from '../lib/format'

const entries: CatalogEntry[] = [
  { id: 'cafe', name: 'Café da Praça', cuisines: ['Brasileira'], wouldReturn: true,
    visits: [{ date: '2026-09-01', rating: 3 }, { date: '2026-10-20', rating: 5 }] },
  { id: 'massa', name: 'Massa', cuisines: ['Italiana'], wishlistPriority: 'HIGH' },
  { id: 'arquivo', name: 'Antigo', status: 'ARCHIVED', cuisines: ['Outra'] },
]

afterEach(() => vi.useRealTimers())

describe('catálogo de consulta', () => {
  it('aceita catálogo vazio e cadastro mínimo sem inventar visitas', () => {
    expect(createCatalog([]).suggest()).toEqual([])
    const item = createCatalog([{ id: 'novo', name: 'Novo' }]).detail('novo')
    expect(item).toMatchObject({ visited: false, averageRating: null, visits: [], wouldReturn: null })
  })
  it('calcula médias e ordena histórico sem alterar a origem', () => {
    const before = structuredClone(entries)
    expect(createCatalog(entries).detail('cafe')).toMatchObject({
      visitCount: 2, averageRating: 4, lastVisitedAt: '2026-10-20',
    })
    expect(createCatalog(entries).detail('cafe').visits[0]?.rating).toBe(5)
    expect(entries).toEqual(before)
  })
  it('combina filtros, ignora acentos na busca e exclui arquivados', () => {
    const catalog = createCatalog(entries)
    expect(catalog.list({ search: ' cafe ', onlyWouldReturn: true }).map(x => x.id)).toEqual(['cafe'])
    expect(catalog.list({ cuisineTypeIds: ['Italiana'], onlyNotVisited: true }).map(x => x.id)).toEqual(['massa'])
    expect(catalog.list({ onlyNotVisited: true, onlyWouldReturn: true })).toEqual([])
    expect(catalog.cuisines().map(x => x.name)).toEqual(['Brasileira', 'Italiana'])
    expect(catalog.list({ status: 'ARCHIVED' }).map(x => x.id)).toEqual(['arquivo'])
  })
  it('ranqueia e sorteia somente candidatos válidos, sem duplicar nem alterar o catálogo', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-23T12:00:00Z'))
    const catalog = createCatalog(entries)
    expect(catalog.suggest({ limit: 1 })[0]?.id).toBe('massa')
    expect(catalog.suggest({ onlyNotVisited: true, strategy: 'RANDOM' }).map(x => x.id)).toEqual(['massa'])
    const ids = catalog.suggest({ strategy: 'RANDOM', limit: 10 }).map(x => x.id)
    expect(new Set(ids).size).toBe(2)
    expect(catalog.list().map(x => x.id)).toEqual(['cafe', 'massa'])
  })
  it('informa quando um link aponta para lugar inexistente', () => {
    expect(() => createCatalog(entries).detail('inexistente')).toThrow('não está no catálogo')
  })
  it('mostra a data de visita sem deslocá-la para o dia anterior', () => {
    expect(formatDate('2026-10-20')).toContain('20')
  })
})
