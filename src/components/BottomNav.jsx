import { motion as Motion } from 'framer-motion'
import { Home, PlusSquare, ShieldCheck, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const baseItems = [
  {
    href: '/',
    icon: Home,
    label: 'Лента',
  },
  {
    href: '/compose',
    icon: PlusSquare,
    label: 'Создать',
  },
  {
    href: '/profile',
    icon: UserRound,
    label: 'Профиль',
  },
]

export function BottomNav({ isAdmin }) {
  const items = isAdmin
    ? [
        ...baseItems,
        {
          href: '/admin',
          icon: ShieldCheck,
          label: 'Админ',
        },
      ]
    : baseItems

  return (
    <nav className="glass fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-[30rem] -translate-x-1/2 items-center justify-between rounded-[2rem] px-2 py-2 sm:max-w-[34rem]">
      {items.map(({ href, icon: Icon, label }) => (
        <NavLink key={href} to={href} className="relative flex flex-1 justify-center">
          {({ isActive }) => (
            <Motion.div
              whileTap={{ scale: 0.96 }}
              className={`relative flex w-full max-w-[6.5rem] flex-col items-center gap-1 rounded-[1.4rem] px-3 py-2 text-xs font-semibold transition ${
                isActive ? 'text-white' : 'text-slate-400'
              }`}
            >
              {isActive ? (
                <Motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-[1.4rem] bg-white/10"
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
              ) : null}
              <span className="relative z-10">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="relative z-10">{label}</span>
            </Motion.div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
