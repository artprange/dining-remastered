import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
	cuisineTypesQuery,
	restaurantsQuery,
	suggestionQuery,
} from '@/catalog/queries';
import type { SuggestionFilters } from '@/catalog/types';
import { errorMessage } from '@/catalog/errors';
import { RestaurantCard } from '@/components/RestaurantCard';
import {
	Button,
	Card,
	EmptyState,
	ErrorState,
	Screen,
	Spinner,
} from '@/components/ui';
import { ChipSelect, Field } from '@/components/form';

export const Route = createFileRoute('/')({
	component: SuggestionScreen,
});

function SuggestionScreen() {
	const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
	const [mode, setMode] = useState<'INITIAL' | 'ALL' | 'RANKED' | 'RANDOM'>(
		'INITIAL',
	);
	const [nonce, setNonce] = useState(0);

	const cuisineTypes = useQuery(cuisineTypesQuery());

	const filters = {
		cuisineTypeIds: selectedCuisines,
	};

	const restaurants = useQuery({
		...restaurantsQuery(filters),
		enabled: mode === 'ALL',
	});

	const suggestionFilters: SuggestionFilters = {
		...filters,
		strategy: mode === 'RANDOM' ? 'RANDOM' : 'RANKED',
		limit: mode === 'RANDOM' ? 1 : 3,
	};

	const suggestions = useQuery({
		...suggestionQuery(suggestionFilters, nonce),
		enabled: mode === 'RANKED' || mode === 'RANDOM',
	});

	const results = mode === 'ALL' ? restaurants : suggestions;

	function selectCuisines(next: string[]) {
		setSelectedCuisines(next);
		setMode('ALL');
	}

	function ask(strategy: 'RANKED' | 'RANDOM') {
		setMode(strategy);
		setNonce((value) => value + 1);
	}

	return (
		<Screen
			title="Vamos aonde?"
			subtitle="Escolha a culinária e encontre um lugar para hoje."
		>
			<Card className="mb-5 space-y-5">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h2 className="text-lg font-bold">Qual é a vontade?</h2>
					<span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-ink">
						Bora comer
					</span>
				</div>

				<Field label="Culinária">
					<ChipSelect
						options={(cuisineTypes.data ?? []).map((cuisine) => ({
							value: cuisine.id,
							label: cuisine.name,
						}))}
						selected={selectedCuisines}
						onChange={selectCuisines}
						emptyLabel="Nenhuma culinária disponível ainda."
					/>
				</Field>

				<div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-[1.5fr_1fr]">
					<Button
						block
						onClick={() => ask('RANKED')}
					>
						Ver 3 opções
					</Button>
					<Button
						variant="secondary"
						onClick={() => ask('RANDOM')}
					>
						Sortear
					</Button>
				</div>
			</Card>

			{mode === 'INITIAL' ? (
				<EmptyState
					title="O próximo favorito está por aí"
					description="Escolha uma culinária para ver os lugares ou use os botões."
				/>
			) : results.isError ? (
				<ErrorState
					message={errorMessage(results.error)}
					onRetry={() => void results.refetch()}
				/>
			) : results.isPending ? (
				<Spinner />
			) : results.data.length === 0 ? (
				<EmptyState
					title="Nenhum lugar passou no filtro"
					description="Tente outra culinária."
				/>
			) : (
				<div className="space-y-3">
					{results.data.map((restaurant) => (
						<RestaurantCard
							key={restaurant.id}
							restaurant={restaurant}
						/>
					))}
				</div>
			)}
		</Screen>
	);
}
