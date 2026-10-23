import { Link, useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const items = [
  {
    to: '/',
    label: 'Vamos aonde?',
    isActive: (path: string) => path === '/',
    icon: (
      <Icon>
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
        <circle cx="12" cy="12" r="4" />
      </Icon>
    ),
  },
  {
    to: '/restaurants',
    label: 'Lista',
    isActive: (path: string) =>
      path === '/restaurants' || path.startsWith('/restaurants/'),
    icon: (
      <Icon>
        <path d="M4 6h16M4 12h16M4 18h10" />
      </Icon>
    ),
  },
] as const

export function BottomNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <nav className="bottom-nav fixed inset-x-3 z-10 mx-auto max-w-[32rem] rounded-[1.5rem] border border-white/20 bg-brand-deep p-2 shadow-[0_8px_32px_rgba(49,25,78,0.25)]">
      <ul className="flex gap-2">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <Link
              to={item.to}
              aria-current={item.isActive(pathname) ? 'page' : undefined}
              className={
                'flex min-h-14 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs font-bold transition ' +
                (item.isActive(pathname) ? 'bg-accent text-ink' : 'text-white/85 hover:bg-white/10')
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
