import type { InputHTMLAttributes, ReactNode } from 'react'

const controlStyles =
  'w-full rounded-xl border border-line bg-card px-3 py-2.5 text-base outline-none transition placeholder:text-muted focus:border-brand'

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div role="group" aria-label={label} className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={controlStyles} />
}

export interface Option {
  value: string
  label: string
}

/**
 * Lista de pílulas que liga e desliga. Num celular isso é muito mais rápido
 * que um `<select multiple>`, que praticamente não funciona no toque.
 */
export function ChipSelect({
  options,
  selected,
  onChange,
  emptyLabel = 'Nada cadastrado ainda.',
}: {
  options: Option[]
  selected: string[]
  onChange: (next: string[]) => void
  emptyLabel?: string
}) {
  if (options.length === 0) {
    return <p className="text-sm text-muted">{emptyLabel}</p>
  }

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isOn = selected.includes(option.value)

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isOn}
            onClick={() => toggle(option.value)}
            className={
              'min-h-11 rounded-full border px-4 text-sm font-medium transition ' +
              (isOn
                ? 'border-transparent bg-brand text-white'
                : 'border-line bg-card text-ink hover:bg-brand-soft')
            }
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 [&+label]:mt-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 shrink-0 accent-[var(--color-brand)]"
      />
      <span className="text-sm">{label}</span>
    </label>
  )
}
