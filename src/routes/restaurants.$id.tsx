import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { errorMessage } from '@/catalog/errors'
import { restaurantQuery } from '@/catalog/queries'
import type { RestaurantDetail } from '@/catalog/types'
import { Card, Chip, ErrorState, Screen, Spinner } from '@/components/ui'
import {
  WISHLIST_PRIORITY_LABELS,
} from '@/lib/format'

export const Route = createFileRoute('/restaurants/$id')({ component: RestaurantDetailScreen })

function RestaurantDetailScreen() {
  const { id } = Route.useParams()
  const restaurant = useQuery(restaurantQuery(id))

  if (restaurant.isError) {
    return (
      <Screen title="Lugar">
        <ErrorState
          message={errorMessage(restaurant.error)}
          onRetry={() => void restaurant.refetch()}
        />
      </Screen>
    )
  }

  if (restaurant.isPending) {
    return (
      <Screen title="Lugar">
        <Spinner />
      </Screen>
    )
  }

  return <Detail restaurant={restaurant.data} />
}

function Detail({ restaurant }: { restaurant: RestaurantDetail }) {
  const place = [restaurant.neighborhood, restaurant.city].filter(Boolean).join(', ')

  return (
    <Screen title={restaurant.name} subtitle={place || undefined}>
      <Card className="mb-4">
        <div className="flex flex-wrap gap-1.5">
          {restaurant.cuisineTypes.map((cuisine) => (
            <Chip key={cuisine.id} tone="brand">
              {cuisine.name}
            </Chip>
          ))}
          {restaurant.tags.map((tag) => (
            <Chip key={tag.id}>{tag.name}</Chip>
          ))}
          <Chip>vontade: {WISHLIST_PRIORITY_LABELS[restaurant.wishlistPriority]}</Chip>
        </div>

        {restaurant.address && (
          <p className="mt-4 border-t border-line pt-4 text-sm text-muted">{restaurant.address}</p>
        )}
        {restaurant.instagram && (
          <a href={restaurant.instagram} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand px-4 text-sm font-medium text-white">
            Ver no Instagram ↗
          </a>
        )}
        {restaurant.notes && <p className="mt-2 text-sm">{restaurant.notes}</p>}
      </Card>

    </Screen>
  )
}
