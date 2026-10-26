export type RestaurantStatus = 'ACTIVE' | 'ARCHIVED'
export type WishlistPriority = 'LOW' | 'NORMAL' | 'HIGH'
export interface RestaurantFilters {
  status?: RestaurantStatus
  search?: string
  cuisineTypeIds?: string[]
  tagIds?: string[]
  city?: string
  neighborhood?: string
  onlyWouldReturn?: boolean
  onlyNotVisited?: boolean
}
export interface SuggestionFilters extends RestaurantFilters {
  strategy?: 'RANKED' | 'RANDOM'
  limit?: number
}
export interface CuisineType {
  id: string
  name: string
}

export interface Tag {
  id: string
  name: string
}

export interface Visit {
  id: string
  restaurantId: string
  visitedAt: string
  rating: number
  notes: string | null
}

/** Restaurante normalizado a partir do JSON. */
export interface Restaurant {
  instagram?: string | null
  id: string
  name: string
  cuisineTypes: CuisineType[]
  tags: Tag[]
  status: RestaurantStatus
  wishlistPriority: WishlistPriority
  address: string | null
  neighborhood: string | null
  city: string | null
  notes: string | null
  wouldReturn: boolean | null
}

/** Restaurante com resumo calculado do histórico. */
export interface RestaurantWithSummary extends Restaurant {
  visited: boolean
  visitCount: number
  averageRating: number | null
  lastVisitedAt: string | null
}

/** Detalhe com histórico completo. */
export interface RestaurantDetail extends RestaurantWithSummary {
  visits: Visit[]
}

/** Sugestão com pontuação e motivos. */
export interface Suggestion extends RestaurantWithSummary {
  score: number
  reasons: string[]
}
