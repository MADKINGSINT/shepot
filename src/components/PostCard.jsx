import { AnimatePresence, motion as Motion } from 'framer-motion'
import {
  Ban,
  Clock3,
  Heart,
  MessageCircle,
  SendHorizontal,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  formatCompactNumber,
  formatModerationStatus,
  formatRelativeDate,
  getInitials,
} from '../lib/formatters'
import { ImageLightbox } from './ImageLightbox'

const statusIconMap = {
  approved: ShieldCheck,
  pending: Clock3,
  rejected: Ban,
}

const statusToneMap = {
  approved: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  pending: 'border-amber-400/30 bg-amber-400/10 text-amber-100',
  rejected: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
}

export function PostCard({ commenting, footer, liking, onComment, onLike, post }) {
  const [commentText, setCommentText] = useState('')
  const [commentsOpen, setCommentsOpen] = useState(Boolean(post.comments?.length))
  const [likeBurst, setLikeBurst] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const likeBurstTimerRef = useRef(null)

  const StatusIcon = statusIconMap[post.moderationStatus] ?? ShieldCheck
  const statusTone = statusToneMap[post.moderationStatus] ?? statusToneMap.pending

  useEffect(() => {
    return () => {
      if (likeBurstTimerRef.current) {
        window.clearTimeout(likeBurstTimerRef.current)
      }
    }
  }, [])

  const handleLikeClick = () => {
    if (!onLike || liking) {
      return
    }

    setLikeBurst(true)

    if (likeBurstTimerRef.current) {
      window.clearTimeout(likeBurstTimerRef.current)
    }

    likeBurstTimerRef.current = window.setTimeout(() => {
      setLikeBurst(false)
    }, 460)

    onLike(post.id)
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault()

    if (!commentText.trim() || !onComment) {
      return
    }

    const isSuccessful = await onComment(post.id, commentText.trim())

    if (isSuccessful !== false) {
      setCommentText('')
      setCommentsOpen(true)
    }
  }

  return (
    <Motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="glass overflow-hidden rounded-[2rem] px-4 py-4 shadow-2xl shadow-slate-950/25"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-400 to-fuchsia-400 text-sm font-bold text-slate-950">
            {getInitials(post.authorName)}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{post.authorName}</p>
            <p className="text-xs text-slate-400">
              {post.authorUsername ? `@${post.authorUsername}` : 'school feed'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold ${statusTone}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {formatModerationStatus(post.moderationStatus)}
          </div>
          <p className="mt-2 text-[0.72rem] text-slate-400">
            {formatRelativeDate(post.createdAt)}
          </p>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-line text-[0.95rem] leading-7 text-slate-100">
        {post.content}
      </p>

      {post.images.length ? (
        <div className="hide-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
          {post.images.map((image, index) => (
            <Motion.button
              key={image.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              whileTap={{ scale: 0.97 }}
              className="group relative h-72 w-[82%] shrink-0 snap-center overflow-hidden rounded-[1.7rem]"
            >
              <img
                src={image.imageUrl}
                alt="Фото к посту"
                className="h-full w-full object-cover shadow-lg shadow-slate-950/30 transition duration-300 group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            </Motion.button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-2">
        <Motion.button
          type="button"
          onClick={handleLikeClick}
          disabled={!onLike || liking}
          animate={likeBurst ? { scale: [1, 0.96, 1.04, 1] } : { scale: 1 }}
          transition={{ duration: 0.34 }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
            post.viewerHasLiked
              ? 'border-rose-400/30 bg-rose-400/10 text-rose-100'
              : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
          } disabled:cursor-not-allowed disabled:opacity-70`}
        >
          <Motion.span
            animate={
              likeBurst
                ? { rotate: [0, -12, 12, -8, 0], scale: [1, 1.55, 1] }
                : { rotate: 0, scale: 1 }
            }
            transition={{ duration: 0.36 }}
            className="relative"
          >
            <Heart className={`h-4.5 w-4.5 ${post.viewerHasLiked ? 'fill-current' : ''}`} />
            <AnimatePresence>
              {likeBurst ? (
                <Motion.span
                  initial={{ opacity: 0.45, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 1.9 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 rounded-full border border-rose-300/60"
                />
              ) : null}
            </AnimatePresence>
          </Motion.span>
          {formatCompactNumber(post.likesCount)}
        </Motion.button>

        <Motion.button
          type="button"
          onClick={() => setCommentsOpen((current) => !current)}
          animate={commentsOpen ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ duration: 0.24 }}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
        >
          <Motion.span
            animate={
              commentsOpen
                ? { rotate: [0, -8, 8, 0], scale: [1, 1.18, 1] }
                : { rotate: 0, scale: 1 }
            }
            transition={{ duration: 0.28 }}
          >
            <MessageCircle className="h-4.5 w-4.5" />
          </Motion.span>
          {formatCompactNumber(post.commentsCount)}
        </Motion.button>
      </div>

      <AnimatePresence initial={false}>
        {commentsOpen ? (
          <Motion.div
            key="comments"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 rounded-[1.6rem] border border-white/10 bg-black/15 p-3">
              {post.comments.length ? (
                <AnimatePresence initial={false}>
                  {post.comments.map((comment) => (
                    <Motion.div
                      layout
                      key={comment.id}
                      initial={{ opacity: 0, y: 14, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          {comment.authorName}
                        </p>
                        <p className="text-[0.7rem] text-slate-400">
                          {formatRelativeDate(comment.createdAt)}
                        </p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        {comment.content}
                      </p>
                    </Motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-center text-sm text-slate-400">
                  Комментариев пока нет.
                </p>
              )}

              {onComment ? (
                <Motion.form layout onSubmit={handleCommentSubmit} className="space-y-3">
                  <textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    rows={3}
                    maxLength={280}
                    placeholder="Оставить комментарий..."
                    className="w-full rounded-[1.3rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
                  />
                  <Motion.button
                    type="submit"
                    disabled={commenting || commentText.trim().length < 2}
                    animate={commenting ? { scale: [1, 0.98, 1.02, 1] } : { scale: 1 }}
                    transition={{
                      duration: 0.42,
                      repeat: commenting ? Number.POSITIVE_INFINITY : 0,
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Motion.span
                      animate={commenting ? { x: [0, 4, 0] } : { x: 0 }}
                      transition={{
                        duration: 0.42,
                        repeat: commenting ? Number.POSITIVE_INFINITY : 0,
                      }}
                    >
                      <SendHorizontal className="h-4.5 w-4.5" />
                    </Motion.span>
                    {commenting ? 'Отправляем...' : 'Отправить'}
                  </Motion.button>
                </Motion.form>
              ) : null}
            </div>
          </Motion.div>
        ) : null}
      </AnimatePresence>

      {footer ? <div className="mt-4">{footer}</div> : null}

      {lightboxIndex !== null ? (
        <ImageLightbox
          images={post.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </Motion.article>
  )
}
