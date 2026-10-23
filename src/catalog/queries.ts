import { queryOptions } from '@tanstack/react-query'
import { catalog } from './catalog'
import type { RestaurantFilters, SuggestionFilters } from './types'

export const cuisineTypesQuery = () => queryOptions({
  queryKey: ['cuisines'], queryFn: () => catalog.cuisines(),
})
export const restaurantsQuery = (filters: RestaurantFilters = {}) => queryOptions({
  queryKey: ['restaurants', 'list', filters], queryFn: () => catalog.list(filters),
})
export const restaurantQuery = (id: string) => queryOptions({
  queryKey: ['restaurants', 'detail', id], queryFn: () => catalog.detail(id),
})
export const suggestionQuery = (filters: SuggestionFilters, nonce = 0) => queryOptions({
  queryKey: ['suggestions', filters, nonce], queryFn: () => catalog.suggest(filters),
  staleTime: Infinity, refetchOnWindowFocus: false,
})
