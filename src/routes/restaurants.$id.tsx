import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { errorMessage } from '@/catalog/errors'
import { restaurantQuery } from '@/catalog/queries'
import type { RestaurantDetail } from '@/catalog/types'
import { Card, Chip, ErrorState, Screen, Spinner } from '@/components/ui'
import {
  WISHLIST_PRIORITY_LABELS,
  formatDate,
  formatRating,
  formatSince,
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

        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
          <div>
            <dt className="text-xs text-muted">Nota média</dt>
            <dd className="text-lg font-semibold">{formatRating(restaurant.averageRating)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Visitas</dt>
            <dd className="text-lg font-semibold">{restaurant.visitCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Última</dt>
            <dd className="text-lg font-semibold">{formatSince(restaurant.lastVisitedAt)}</dd>
          </div>
        </dl>

        {restaurant.address && (
          <p className="mt-4 border-t border-line pt-4 text-sm text-muted">{restaurant.address}</p>
        )}
        {restaurant.notes && <p className="mt-2 text-sm">{restaurant.notes}</p>}
      </Card>

      <Card className="mb-4">
        <p className="text-sm font-medium">Vocês voltariam?</p>
        <p className="mt-2 text-sm text-muted">
          {restaurant.wouldReturn === null ? 'Ainda não decidido' : restaurant.wouldReturn ? 'Sim, voltaríamos' : 'Não voltaríamos'}
        </p>
      </Card>

      <section className="mt-4">
        <h2 className="mb-2 text-sm font-medium">Histórico</h2>
        {restaurant.visits.length === 0 ? (
          <p className="text-sm text-muted">Vocês ainda não registraram nenhuma visita.</p>
        ) : (
          <ul className="space-y-2">
            {restaurant.visits.map((visit) => (
              <li key={visit.id}>
                <Card>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium">{formatDate(visit.visitedAt)}</span>
                    <span className="text-sm">{'★'.repeat(visit.rating)}</span>
                  </div>
                  {visit.notes && <p className="mt-1 text-sm text-muted">{visit.notes}</p>}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

    </Screen>
  )
}
