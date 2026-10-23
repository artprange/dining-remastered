import type { WishlistPriority } from '@/catalog/types'

export const WISHLIST_PRIORITY_LABELS: Record<WishlistPriority, string> = {
  LOW: 'Baixa',
  NORMAL: 'Normal',
  HIGH: 'Alta',
}

export const WISHLIST_PRIORITIES = Object.keys(
  WISHLIST_PRIORITY_LABELS,
) as WishlistPriority[]

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatDate(iso: string | null): string {
  if (!iso) return '—'

  return dateFormatter.format(new Date(iso.length === 10 ? `${iso}T12:00:00` : iso))
}

export function formatRating(rating: number | null): string {
  if (rating === null) return '—'

  return rating.toFixed(1).replace('.', ',')
}

/** "há 12 dias", para dar a noção de "faz tempo que a gente não vai". */
export function formatSince(iso: string | null): string {
  if (!iso) return 'nunca'

  const days = Math.floor((Date.now() - new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).getTime()) / 86_400_000)

  if (days <= 0) return 'hoje'
  if (days === 1) return 'ontem'
  if (days < 30) return `há ${days} dias`
  if (days < 365) return `há ${Math.floor(days / 30)} meses`

  return `há ${Math.floor(days / 365)} ano(s)`
}
