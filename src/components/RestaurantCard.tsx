import { Instagram } from 'lucide-react'
import type { RestaurantWithSummary } from '@/catalog/types'
import { Card, Chip } from './ui'

export function RestaurantCard({ restaurant }: { restaurant: RestaurantWithSummary }) {
  const place = [restaurant.neighborhood, restaurant.city].filter(Boolean).join(', ')

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="break-words text-lg font-bold">{restaurant.name}</h2>
          <p className="mt-1 text-sm text-muted">
            {restaurant.cuisineTypes.map((cuisine) => cuisine.name).join(' · ') ||
              'Sem culinária'}
            {place && ` — ${place}`}
          </p>
          {restaurant.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {restaurant.tags.map((tag) => (
                <Chip key={tag.id}>{tag.name}</Chip>
              ))}
            </div>
          )}
        </div>
        {restaurant.instagram && (
          <a
            href={restaurant.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram de ${restaurant.name} (abre em nova aba)`}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-brand transition hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Instagram className="size-6" aria-hidden="true" />
          </a>
        )}
      </div>
    </Card>
  )
}
