import { ImagePlus, LockKeyhole, SendHorizontal, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import { createPost } from '../lib/api'
import { MAX_POST_IMAGES } from '../lib/supabase'

export function CreatePage() {
  const navigate = useNavigate()
  const { hasSupabaseEnv, user } = useAuth()
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [files, setFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const nextPreviewUrls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls(nextPreviewUrls)

    return () => {
      nextPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [files])

  if (!hasSupabaseEnv) {
    return (
      <EmptyState
        icon={LockKeyhole}
        title="Сначала подключите Supabase"
        description="После настройки .env и SQL-схемы здесь заработает отправка постов."
      />
    )
  }

  if (!user) {
    return (
      <EmptyState
        icon={LockKeyhole}
        title="Нужен вход"
        description="Создавать посты могут только авторизованные пользователи."
        action={
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
          >
            Войти
          </button>
        }
      />
    )
  }

  const handleFilesChange = (event) => {
    const nextFiles = Array.from(event.target.files ?? []).slice(0, MAX_POST_IMAGES)
    setFiles(nextFiles)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await createPost({
        authorId: user.id,
        content,
        files,
      })

      setContent('')
      setFiles([])
      setSuccess('Пост отправлен на модерацию.')
    } catch (submitError) {
      setError(submitError.message ?? 'Не удалось отправить пост.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <section className="glass rounded-[2rem] px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white">
            Новый пост
          </h2>
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-cyan-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="glass space-y-5 rounded-[2rem] px-5 py-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Текст</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={7}
            maxLength={1500}
            minLength={12}
            placeholder="Напишите пост..."
            className="w-full rounded-[1.6rem] border border-white/10 bg-slate-950/65 px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
          />
          <div className="mt-2 text-right text-xs text-slate-400">{content.length}/1500</div>
        </label>

        <div>
          <div className="mb-2 text-sm font-medium text-slate-200">Фотографии</div>

          <label className="flex cursor-pointer items-center justify-center gap-3 rounded-[1.6rem] border border-dashed border-white/15 bg-white/5 px-4 py-5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/6">
            <ImagePlus className="h-5 w-5 text-cyan-200" />
            Выбрать изображения
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesChange}
              className="hidden"
            />
          </label>

          {previewUrls.length ? (
            <div className="hide-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
              {previewUrls.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="Предпросмотр"
                  className="h-28 w-28 shrink-0 rounded-[1.3rem] object-cover"
                />
              ))}
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || content.trim().length < 12}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-65"
        >
          <SendHorizontal className="h-4.5 w-4.5" />
          {submitting ? 'Отправляем...' : 'Отправить'}
        </button>
      </form>
    </div>
  )
}
