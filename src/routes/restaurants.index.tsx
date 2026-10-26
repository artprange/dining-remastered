import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { errorMessage } from '@/catalog/errors';
import { restaurantsQuery } from '@/catalog/queries';
import { RestaurantCard } from '@/components/RestaurantCard';
import { Input } from '@/components/form';
import { EmptyState, ErrorState, Screen, Spinner } from '@/components/ui';
import type { RestaurantWithSummary } from '@/catalog/types';

export const Route = createFileRoute('/restaurants/')({
	component: RestaurantListScreen,
});

function RestaurantListScreen() {
	const [term, setTerm] = useState('');
	const search = useDebounced(term, 300);

	const restaurants = useQuery(restaurantsQuery(search ? { search } : {}));
	const groups = new Map<string, RestaurantWithSummary[]>();

	for (const restaurant of restaurants.data ?? []) {
		const categories = restaurant.cuisineTypes.length
			? [...new Set(restaurant.cuisineTypes.map((cuisine) => cuisine.name))]
			: ['Sem culinária'];

		for (const category of categories) {
			const items = groups.get(category) ?? [];
			items.push(restaurant);
			groups.set(category, items);
		}
	}

	const compareNames = (a: string, b: string) =>
		a.localeCompare(b, 'pt-BR', {
			sensitivity: 'base',
			numeric: true,
		});

	const categories = [...groups.entries()]
		.sort(([a], [b]) => compareNames(a, b))
		.map(([name, items]) => ({
			name,
			restaurants: items.sort((a, b) => compareNames(a.name, b.name)),
		}));

	return (
		<Screen
			title="Lugares"
			subtitle={
				restaurants.data
					? `${restaurants.data.length} lugar(es) na lista`
					: 'Carregando...'
			}
		>
			<div className="mb-4">
				<Input
					type="search"
					value={term}
					placeholder="Buscar pelo nome"
					onChange={(event) => setTerm(event.target.value)}
				/>
			</div>

			{restaurants.isError ? (
				<ErrorState
					message={errorMessage(restaurants.error)}
					onRetry={() => void restaurants.refetch()}
				/>
			) : restaurants.isPending ? (
				<Spinner />
			) : restaurants.data.length === 0 ? (
				<EmptyState
					title={search ? 'Nada com esse nome' : 'A lista está vazia'}
					description={
						search
							? 'Tenta outro pedaço do nome.'
							: 'Os lugares aparecerão aqui quando o catálogo for atualizado.'
					}
				/>
			) : (
				<div className="space-y-6">
					{categories.map((category) => (
						<section
							key={category.name}
							className="space-y-3"
						>
							<h2 className="px-1 text-xl font-bold text-ink">
								{category.name}
								<span className="ml-2 text-sm font-normal text-muted">
									({category.restaurants.length})
								</span>
							</h2>

							{category.restaurants.map((restaurant) => (
								<RestaurantCard
									key={restaurant.id}
									restaurant={restaurant}
								/>
							))}
						</section>
					))}
				</div>
			)}
		</Screen>
	);
}

function useDebounced<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);

		return () => clearTimeout(timer);
	}, [value, delay]);

	return debounced;
}
