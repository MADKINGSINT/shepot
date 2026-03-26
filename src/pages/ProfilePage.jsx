import { LogOut, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { AuthPanel } from '../components/AuthPanel'
import { EmptyState } from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import { getMyPosts } from '../lib/api'
import { formatModerationStatus, formatRelativeDate } from '../lib/formatters'

const statusStyles = {
  approved: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
  pending: 'border-amber-400/25 bg-amber-400/10 text-amber-100',
  rejected: 'border-rose-400/25 bg-rose-400/10 text-rose-100',
}

export function ProfilePage() {
  const { hasSupabaseEnv, profile, signOut, user } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState([])

  const loadMyPosts = useCallback(async () => {
    if (!user || !hasSupabaseEnv) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const nextPosts = await getMyPosts({ userId: user.id })
      setPosts(nextPosts)
    } catch (loadError) {
      setError(loadError.message ?? 'Не удалось загрузить ваши публикации.')
    } finally {
      setLoading(false)
    }
  }, [hasSupabaseEnv, user])

  useEffect(() => {
    void loadMyPosts()
  }, [loadMyPosts])

  if (!user) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={UserRound}
          title="Войдите или зарегистрируйтесь"
          description="После входа появится личный кабинет, список ваших публикаций и доступ к созданию постов."
        />
        <AuthPanel />
      </div>
    )
  }

  const approvedCount = posts.filter((post) => post.moderationStatus === 'approved').length
  const pendingCount = posts.filter((post) => post.moderationStatus === 'pending').length

  return (
    <div className="space-y-4">
      <section className="glass rounded-[2rem] px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-white via-cyan-200 to-fuchsia-200 text-lg font-black text-slate-950">
              {profile?.display_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {profile?.display_name ?? 'Пользователь'}
              </h2>
              <p className="text-sm text-slate-400">
                {profile?.username ? `@${profile.username}` : 'Без username'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white">
              {profile?.role === 'admin' ? 'Администратор' : 'Ученик'}
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatCard value={posts.length} label="Всего постов" />
          <StatCard value={approvedCount} label="Опубликовано" />
          <StatCard value={pendingCount} label="На проверке" />
        </div>

        {!hasSupabaseEnv ? (
          <div className="mt-4 rounded-[1.5rem] border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm text-amber-100">
            Живые данные появятся после подключения Supabase. Сейчас профиль открыт
            только в визуальном режиме.
          </div>
        ) : null}
      </section>

      <section className="glass rounded-[2rem] px-5 py-5">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
          {profile?.role === 'admin' ? (
            <ShieldCheck className="h-4.5 w-4.5 text-cyan-200" />
          ) : (
            <LockKeyhole className="h-4.5 w-4.5 text-cyan-200" />
          )}
          Мои публикации
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-300">
              Загружаем ваши посты...
            </div>
          ) : posts.length ? (
            posts.map((post) => (
              <article
                key={post.id}
                className="rounded-[1.6rem] border border-white/10 bg-white/5 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {formatRelativeDate(post.createdAt)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      {post.content}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold ${statusStyles[post.moderationStatus] ?? statusStyles.pending}`}
                  >
                    {formatModerationStatus(post.moderationStatus)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-[1.5rem] border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
              Вы еще не отправляли посты.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-3 py-4 text-center">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
    </div>
  )
}
