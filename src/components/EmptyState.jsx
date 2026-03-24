import { motion as Motion } from 'framer-motion'

export function EmptyState({ action, description, icon: Icon, title }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-[2rem] px-5 py-6 text-center"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-200">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Motion.div>
  )
}
