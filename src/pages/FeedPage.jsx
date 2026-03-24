import { motion as Motion } from 'framer-motion'
import { PlusSquare, RefreshCcw, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PostCard } from '../components/PostCard'
import { useAuth } from '../context/AuthContext'
import { addComment, getFeedPosts, toggleLike } from '../lib/api'

export function FeedPage() {
  const navigate = useNavigate()
  const { hasSupabaseEnv, user } = useAuth()
  const [commentingPostId, setCommentingPostId] = useState(null)
  const [error, setError] = useState('')
  const [likingPostId, setLikingPostId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const nextPosts = await getFeedPosts({ userId: user?.id })
      setPosts(nextPosts)
    } catch (loadError) {
      setError(loadError.message ?? 'Не удалось загрузить ленту.')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  const handleLike = async (postId) => {
    if (!user) {
      navigate('/profile')
      return
    }

    const currentPost = posts.find((item) => item.id === postId)

    if (!currentPost) {
      return
    }

    const nextLikedState = !currentPost.viewerHasLiked

    setLikingPostId(postId)
    setError('')
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likesCount: post.likesCount + (nextLikedState ? 1 : -1),
              viewerHasLiked: nextLikedState,
            }
          : post,
      ),
    )

    try {
      await toggleLike({
        isLiked: currentPost.viewerHasLiked,
        postId,
        userId: user.id,
      })
    } catch (toggleError) {
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: post.likesCount + (nextLikedState ? -1 : 1),
                viewerHasLiked: currentPost.viewerHasLiked,
              }
            : post,
        ),
      )
      setError(toggleError.message ?? 'Не удалось поставить лайк.')
    } finally {
      setLikingPostId(null)
    }
  }

  const handleComment = async (postId, content) => {
    if (!user) {
      navigate('/profile')
      return false
    }

    setCommentingPostId(postId)
    setError('')

    try {
      const comment = await addComment({
        authorId: user.id,
        content,
        postId,
      })

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...post.comments, comment],
                commentsCount: post.commentsCount + 1,
              }
            : post,
        ),
      )

      return true
    } catch (commentError) {
      setError(commentError.message ?? 'Не удалось отправить комментарий.')
      return false
    } finally {
      setCommentingPostId(null)
    }
  }

  return (
    <div className="space-y-4">
      <section className="glass overflow-hidden rounded-[2.2rem] px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-cyan-100">
            <Sparkles className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={() => navigate(user ? '/compose' : '/profile')}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <PlusSquare className="h-4.5 w-4.5" />
            Новый пост
          </button>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white">Лента</h2>
          {!hasSupabaseEnv ? (
            <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-100">
              Демо
            </span>
          ) : null}
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.6rem] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Посты</p>
        <button
          type="button"
          onClick={() => void loadPosts()}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
        >
          <RefreshCcw className="h-4 w-4" />
          Обновить
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="glass animate-pulse rounded-[2rem] px-5 py-6">
              <div className="h-5 w-32 rounded-full bg-white/10" />
              <div className="mt-3 h-5 w-3/4 rounded-full bg-white/10" />
              <div className="mt-4 h-36 rounded-[1.6rem] bg-white/6" />
            </div>
          ))}
        </div>
      ) : (
        <Motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="space-y-4"
        >
          {posts.map((post) => (
            <PostCard
              key={post.id}
              commenting={commentingPostId === post.id}
              liking={likingPostId === post.id}
              onComment={handleComment}
              onLike={handleLike}
              post={post}
            />
          ))}
        </Motion.div>
      )}
    </div>
  )
}
