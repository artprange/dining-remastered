import type { ButtonHTMLAttributes, ReactNode } from 'react'

function cx(...values: (string | false | undefined | null)[]): string {
  return values.filter(Boolean).join(' ')
}

export function Screen({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-5 sm:px-6 sm:pt-8">
      <header className="hero mb-5 flex items-start justify-between gap-3 overflow-hidden rounded-[2rem] px-6 py-7 sm:py-9">
        <div>
          <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.24em] text-accent">Dining <span className="text-white/60">/ nosso roteiro</span></p>
          <h1 className="relative text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{title}</h1>
          {subtitle && <p className="relative mt-3 max-w-xs text-sm leading-relaxed text-white/85">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </div>
  )
}

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cx(
        'rounded-[1.75rem] border border-line bg-card p-5 shadow-[0_8px_30px_-20px_rgba(57,24,109,0.25)] sm:p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  block?: boolean
}

export function Button({
  variant = 'primary',
  block = false,
  className,
  ...props
}: ButtonProps) {
  const styles = {
    primary: 'bg-brand text-white shadow-[0_5px_0_var(--color-brand-deep)] hover:bg-brand-deep active:translate-y-0.5 active:shadow-none',
    secondary: 'border border-transparent bg-accent text-ink hover:brightness-95',
    ghost: 'text-muted hover:text-ink',
    danger: 'border border-line bg-card text-red-600 hover:bg-red-50',
  }[variant]

  return (
    <button
      className={cx(
        // 44px de altura mínima: alvo de toque confortável no celular.
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
        styles,
        block && 'w-full',
        className,
      )}
      {...props}
    />
  )
}

export function Chip({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'brand' | 'positive' | 'negative'
}) {
  const tones = {
    neutral: 'border-transparent bg-surface text-muted',
    brand: 'border-transparent bg-brand-soft text-brand',
    positive: 'border-transparent bg-emerald-50 text-emerald-700',
    negative: 'border-transparent bg-red-50 text-red-700',
  }[tone]

  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        tones,
      )}
    >
      {children}
    </span>
  )
}

export function Spinner() {
  return (
    <div className="flex justify-center py-12" role="status" aria-label="Carregando">
      <div className="size-6 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-[1.75rem] border border-coral/30 bg-peach px-5 py-7 text-center">
      <div aria-hidden="true" className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-coral text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-7"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/><path d="M2 3v6m-1-6v3m2-3v3M2 9v12M22 3v18m0-18c-3 3-3 7 0 7"/></svg></div>
      <p className="text-lg font-bold">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="font-medium text-red-800">Não deu certo</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-red-700">{message}</p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={onRetry}>
            Tentar de novo
          </Button>
        </div>
      )}
    </div>
  )
}
