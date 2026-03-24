import { RefreshCcw, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { PostCard } from '../components/PostCard'
import { useAuth } from '../context/AuthContext'
import { getPendingPosts, updatePostModeration } from '../lib/api'

export function AdminPage() {
  const { hasSupabaseEnv, isAdmin, user } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [moderatingId, setModeratingId] = useState(null)
  const [posts, setPosts] = useState([])

  const loadPendingPosts = useCallback(async () => {
    if (!isAdmin || !hasSupabaseEnv) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const nextPosts = await getPendingPosts()
      setPosts(nextPosts)
    } catch (loadError) {
      setError(loadError.message ?? 'Не удалось загрузить очередь модерации.')
    } finally {
      setLoading(false)
    }
  }, [hasSupabaseEnv, isAdmin])

  useEffect(() => {
    void loadPendingPosts()
  }, [loadPendingPosts])

  if (!hasSupabaseEnv) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Админка включится после настройки Supabase"
        description="Очередь модерации завязана на роли профилей, RLS-политики и таблицу постов в Supabase."
      />
    )
  }

  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Доступ только для админов"
        description="Назначьте пользователю роль `admin` в таблице `profiles`, и вкладка модерации станет рабочей."
      />
    )
  }

  const handleModeration = async (postId, status) => {
    if (!user) {
      return
    }

    setModeratingId(postId)
    setError('')

    try {
      await updatePostModeration({
        moderatorId: user.id,
        postId,
        status,
      })
      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId))
    } catch (moderationError) {
      setError(moderationError.message ?? 'Не удалось изменить статус поста.')
    } finally {
      setModeratingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <section className="glass rounded-[2rem] px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              Admin Queue
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
              Модерация постов
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Здесь администраторы подтверждают или отклоняют новые записи перед
              публикацией в общей ленте.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadPendingPosts()}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
          >
            <RefreshCcw className="h-4 w-4" />
            Обновить
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.6rem] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="glass rounded-[2rem] px-5 py-6 text-sm text-slate-300">
          Загружаем очередь модерации...
        </div>
      ) : posts.length ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              footer={
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={moderatingId === post.id}
                    onClick={() => void handleModeration(post.id, 'approved')}
                    className="flex-1 rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Опубликовать
                  </button>
                  <button
                    type="button"
                    disabled={moderatingId === post.id}
                    onClick={() => void handleModeration(post.id, 'rejected')}
                    className="flex-1 rounded-2xl border border-rose-300/30 bg-rose-300/10 px-4 py-3 text-sm font-bold text-rose-100 transition hover:bg-rose-300/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Отклонить
                  </button>
                </div>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title="Очередь пустая"
          description="Сейчас нет новых постов на проверке. Как только пользователи отправят материалы, они появятся здесь."
        />
      )}
    </div>
  )
}
