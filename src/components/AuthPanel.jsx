import { AnimatePresence, motion as Motion } from 'framer-motion'
import { LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const initialForm = {
  displayName: '',
  email: '',
  password: '',
  username: '',
}

export function AuthPanel() {
  const { hasSupabaseEnv, signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState(initialForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!hasSupabaseEnv) {
      setError('Сначала подключите Supabase, иначе авторизация не заработает.')
      return
    }

    setBusy(true)
    setError('')
    setNotice('')

    try {
      if (mode === 'signup') {
        await signUp({
          displayName: form.displayName,
          email: form.email,
          password: form.password,
          username: form.username,
        })

        setNotice(
          'Аккаунт создан, проверьте email.',
        )
        setMode('signin')
        setForm((current) => ({
          ...current,
          password: '',
        }))
      } else {
        await signIn({
          email: form.email,
          password: form.password,
        })
      }
    } catch (submitError) {
      setError(submitError.message ?? 'Не удалось выполнить вход.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="glass rounded-[2rem] px-5 py-5">
      <div className="flex rounded-2xl border border-white/10 bg-black/10 p-1">
        {[
          { id: 'signin', label: 'Вход' },
          { id: 'signup', label: 'Регистрация' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={`flex-1 rounded-[1rem] px-3 py-2 text-sm font-semibold transition ${
              mode === tab.id ? 'bg-white/10 text-white' : 'text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <AnimatePresence initial={false}>
          {mode === 'signup' ? (
            <Motion.div
              key="signup-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <Field
                icon={UserRound}
                label="Имя в профиле"
                placeholder="Лучше не пишите свое настоящее имя"
                value={form.displayName}
                onChange={updateField('displayName')}
              />
              <Field
                icon={UserRound}
                label="Username"
                placeholder="Лучше не используйте свой обычный логин"
                value={form.username}
                onChange={updateField('username')}
              />
            </Motion.div>
          ) : null}
        </AnimatePresence>

        <Field
          icon={Mail}
          label="Email"
          placeholder="you@example.com"
          type="email"
          value={form.email}
          onChange={updateField('email')}
        />
        <Field
          icon={LockKeyhole}
          label="Пароль"
          placeholder="Минимум 6 символов"
          type="password"
          value={form.password}
          onChange={updateField('password')}
        />

        {error ? (
          <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}

        {notice ? (
          <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {busy
            ? 'Подождите...'
            : mode === 'signup'
              ? 'Создать аккаунт'
              : 'Войти в приложение'}
        </button>
      </form>
    </div>
  )
}

function Field({ icon: Icon, label, onChange, placeholder, type = 'text', value }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-slate-950/65 px-4 py-3 focus-within:border-cyan-300/60">
        <Icon className="h-4.5 w-4.5 text-slate-400" />
        <input
          value={value}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          required
          minLength={type === 'password' ? 6 : undefined}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>
    </label>
  )
}
