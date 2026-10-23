const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

import type {
  Restaurant,
  RestaurantFilters,
  RestaurantWithSummary,
  Suggestion,
  Visit,
} from './types'


/** Calcula o resumo a partir das visitas do próprio restaurante. */
export function withSummary(restaurant: Restaurant, visits: Visit[]): RestaurantWithSummary {

  const lastVisitedAt = visits.reduce<string | null>(
    (latest, visit) => (!latest || visit.visitedAt > latest ? visit.visitedAt : latest),
    null,
  )

  return {
    ...restaurant,
    visited: visits.length > 0,
    visitCount: visits.length,
    averageRating: visits.length
      ? visits.reduce((sum, visit) => sum + visit.rating, 0) / visits.length
      : null,
    lastVisitedAt,
  }
}

/** Aceita `a,b` ou o parâmetro repetido, como o DTO do back. */
function asList(value: string[] | undefined): string[] {
  if (!value) return []
  return value.flatMap((item) => item.split(',')).filter(Boolean)
}

export function applyFilters(
  list: RestaurantWithSummary[],
  filters: RestaurantFilters,
): RestaurantWithSummary[] {
  // Arquivados ficam de fora por padrão, só aparecem se forem pedidos.
  const status = filters.status ?? 'ACTIVE'
  let result = list.filter((item) => item.status === status)

  if (filters.search) {
    const term = normalize(filters.search.trim())
    result = result.filter((item) => normalize(item.name).includes(term))
  }

  const cuisineTypeIds = asList(filters.cuisineTypeIds)
  if (cuisineTypeIds.length) {
    result = result.filter((item) =>
      item.cuisineTypes.some((cuisine) => cuisineTypeIds.includes(cuisine.id)),
    )
  }

  const tagIds = asList(filters.tagIds)
  if (tagIds.length) {
    result = result.filter((item) => item.tags.some((tag) => tagIds.includes(tag.id)))
  }

  if (filters.city) {
    const city = filters.city.toLowerCase()
    result = result.filter((item) => item.city?.toLowerCase().includes(city))
  }

  if (filters.neighborhood) {
    const neighborhood = filters.neighborhood.toLowerCase()
    result = result.filter((item) =>
      item.neighborhood?.toLowerCase().includes(neighborhood),
    )
  }

  if (filters.onlyWouldReturn) result = result.filter((item) => item.wouldReturn === true)
  if (filters.onlyNotVisited) result = result.filter((item) => !item.visited)

  return result
}

const PRIORITY_WEIGHT = { HIGH: 30, NORMAL: 15, LOW: 5 } as const

function daysSince(iso: string | null): number | null {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).getTime()) / 86_400_000)
}

/** Pontua desejo, novidade, avaliações e tempo desde a última visita. */
export function score(item: RestaurantWithSummary): Suggestion {
  const reasons: string[] = []
  let total = PRIORITY_WEIGHT[item.wishlistPriority]

  if (item.wishlistPriority === 'HIGH') reasons.push('Está no topo da lista de desejos')

  if (!item.visited) {
    total += 25
    reasons.push('Vocês ainda não foram')
  }

  if (item.wouldReturn === true) {
    total += 20
    reasons.push('Vocês marcaram que voltariam')
  }

  if (item.averageRating !== null && item.averageRating >= 4) {
    total += Math.round((item.averageRating - 3) * 10)
    reasons.push(`Média ${item.averageRating.toFixed(1)} nas visitas`)
  }

  const days = daysSince(item.lastVisitedAt)
  if (days !== null && days > 60) {
    total += 15
    reasons.push(`Faz ${days} dias que vocês não vão`)
  }

  if (reasons.length === 0) reasons.push('Entrou pelos filtros escolhidos')

  return { ...item, score: total, reasons }
}

export function rankSuggestions(
  list: RestaurantWithSummary[],
  strategy: 'RANKED' | 'RANDOM',
  limit: number,
): Suggestion[] {
  const scored = list.map(score)

  if (strategy === 'RANDOM') {
    // Embaralha uma cópia: ordenar no lugar mexeria na lista do chamador.
    const shuffled = [...scored]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, limit)
  }

  return [...scored].sort((a, b) => b.score - a.score).slice(0, limit)
}
