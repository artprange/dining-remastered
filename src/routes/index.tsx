import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { cuisineTypesQuery, suggestionQuery } from '@/catalog/queries'
import type { Suggestion, SuggestionFilters } from '@/catalog/types'
import { errorMessage } from '@/catalog/errors'
import { RestaurantCard } from '@/components/RestaurantCard'
import { Button, Card, EmptyState, ErrorState, Screen, Spinner } from '@/components/ui'
import { ChipSelect, Field } from '@/components/form'

export const Route = createFileRoute('/')({ component: SuggestionScreen })

interface Draft {
  cuisineTypeIds: string[]
}

const EMPTY_DRAFT: Draft = {
  cuisineTypeIds: [],
}

function SuggestionScreen() {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [asked, setAsked] = useState<{ filters: SuggestionFilters; nonce: number } | null>(null)

  const cuisineTypes = useQuery(cuisineTypesQuery())

  const suggestions = useQuery({
    ...suggestionQuery(asked?.filters ?? {}, asked?.nonce ?? 0),
    enabled: asked !== null,
  })

  function ask(strategy: 'RANKED' | 'RANDOM') {
    setAsked({
      filters: {
        strategy,
        limit: 3,
        // Filtro vazio inclui todas as opções.
        ...(draft.cuisineTypeIds.length > 0 && { cuisineTypeIds: draft.cuisineTypeIds }),
      },
      // Data como nonce: dois cliques seguidos nunca caem na mesma chave.
      nonce: Date.now(),
    })
  }

  return (
    <Screen title="Vamos aonde?" subtitle="Escolha a culinária e encontre um lugar para hoje.">
      <Card className="mb-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Qual é a vontade?</h2><span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-ink">Bora comer</span></div>
        <Field label="Culinária">
          <ChipSelect
            options={(cuisineTypes.data ?? []).map((cuisine) => ({
              value: cuisine.id,
              label: cuisine.name,
            }))}
            selected={draft.cuisineTypeIds}
            onChange={(cuisineTypeIds) => setDraft({ ...draft, cuisineTypeIds })}
            emptyLabel="Nenhuma culinária disponível ainda."
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-[1.5fr_1fr]">
          <Button block onClick={() => ask('RANKED')}>
            Ver 3 opções
          </Button>
          <Button variant="secondary" onClick={() => ask('RANDOM')}>
            Sortear
          </Button>
        </div>
      </Card>

      <Results
        asked={asked !== null}
        isPending={suggestions.isPending}
        error={suggestions.error}
        data={suggestions.data}
        onRetry={() => void suggestions.refetch()}
      />
    </Screen>
  )
}

function Results({
  asked,
  isPending,
  error,
  data,
  onRetry,
}: {
  asked: boolean
  isPending: boolean
  error: unknown
  data: Suggestion[] | undefined
  onRetry: () => void
}) {
  if (!asked) {
    return (
      <EmptyState
        title="O próximo favorito está por aí"
        description="Escolha o que combina com hoje. A gente ajuda com a decisão."
      />
    )
  }

  if (error) return <ErrorState message={errorMessage(error)} onRetry={onRetry} />

  if (isPending || !data) return <Spinner />

  if (data.length === 0) {
    return (
      <EmptyState
        title="Nenhum lugar passou no filtro"
        description="Tente outros filtros. Talvez o catálogo ainda esteja vazio."
      />
    )
  }

  return (
    <div className="space-y-3">
      {data.map((suggestion) => (
        <RestaurantCard key={suggestion.id} restaurant={suggestion} />
      ))}
    </div>
  )
}
