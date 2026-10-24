import data from '../data/restaurants.json'
import type { Restaurant, RestaurantDetail, RestaurantFilters, RestaurantStatus, SuggestionFilters, WishlistPriority } from './types'
import { applyFilters, rankSuggestions, withSummary } from './logic'

/** Formato de edição; os campos opcionais têm padrões para simplificar o cadastro. */
export interface CatalogEntry {
  instagram?: string | null
  id: string
  name: string
  cuisines?: string[]
  tags?: string[]
  status?: RestaurantStatus
  wishlistPriority?: WishlistPriority
  address?: string | null
  neighborhood?: string | null
  city?: string | null
  notes?: string | null
  wouldReturn?: boolean | null
  visits?: { date: string; rating: number; notes?: string | null }[]
}

export function createCatalog(entries: CatalogEntry[]) {
  const restaurants: RestaurantDetail[] = entries.map((entry) => {
    const visits = (entry.visits ?? []).map((visit, i) => ({
      id: `${entry.id}-${i}`,
      restaurantId: entry.id,
      visitedAt: visit.date,
      rating: visit.rating,
      notes: visit.notes ?? null,
    })).sort((a, b) => b.visitedAt.localeCompare(a.visitedAt))
    const restaurant: Restaurant = {
      instagram: entry.instagram ?? null,
      id: entry.id,
      name: entry.name,
      cuisineTypes: (entry.cuisines ?? []).map((name) => ({ id: name, name })),
      tags: (entry.tags ?? []).map((name) => ({ id: name, name })),
      status: entry.status ?? 'ACTIVE',
      wishlistPriority: entry.wishlistPriority ?? 'NORMAL',
      address: entry.address ?? null,
      neighborhood: entry.neighborhood ?? null,
      city: entry.city ?? null,
      notes: entry.notes ?? null,
      wouldReturn: entry.wouldReturn ?? null,
    }
    return { ...withSummary(restaurant, visits), visits }
  })

  return {
    list: (filters: RestaurantFilters = {}) => applyFilters(restaurants, filters),
    detail: (id: string) => {
      const restaurant = restaurants.find((item) => item.id === id)
      if (!restaurant) throw new Error('Este lugar não está no catálogo.')
      return restaurant
    },
    cuisines: () => [...new Set(restaurants.filter((item) => item.status === 'ACTIVE')
      .flatMap((item) => item.cuisineTypes.map((cuisine) => cuisine.name)))]
      .sort((a, b) => a.localeCompare(b, 'pt-BR')).map((name) => ({ id: name, name })),
    suggest: (filters: SuggestionFilters = {}) => rankSuggestions(
      applyFilters(restaurants, filters), filters.strategy ?? 'RANKED', filters.limit ?? 3,
    ),
  }
}

// A validação completa do JSON roda antes de cada build (validate:catalog).
export const catalog = createCatalog(data as CatalogEntry[])
