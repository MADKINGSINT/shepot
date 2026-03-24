import { AnimatePresence, motion as Motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ImageLightbox({ images, initialIndex, onClose }) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length)
  }

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % images.length)
  }

  const handleDragEnd = (_event, info) => {
    if (info.offset.x <= -80) {
      showNext()
      return
    }

    if (info.offset.x >= 80) {
      showPrevious()
    }
  }

  return (
    <AnimatePresence>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/92 px-4 py-6 backdrop-blur-xl"
        onClick={onClose}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-white/8 p-3 text-white transition hover:bg-white/14"
        >
          <X className="h-5 w-5" />
        </button>

        {images.length > 1 ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              showPrevious()
            }}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-white/8 p-3 text-white transition hover:bg-white/14"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}

        <div
          className="relative flex h-full w-full max-w-5xl items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            <Motion.img
              key={`${images[activeIndex].id}-${activeIndex}`}
              src={images[activeIndex].imageUrl}
              alt="Полноэкранное фото"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              drag={images.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.14}
              onDragEnd={handleDragEnd}
              className="max-h-full max-w-full rounded-[2rem] object-contain shadow-2xl shadow-black/40"
            />
          </AnimatePresence>
        </div>

        {images.length > 1 ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              showNext()
            }}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-white/8 p-3 text-white transition hover:bg-white/14"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : null}

        {images.length > 1 ? (
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-semibold text-white">
            <span>
              {activeIndex + 1} / {images.length}
            </span>
            <div className="flex gap-1">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    setActiveIndex(index)
                  }}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    index === activeIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </Motion.div>
    </AnimatePresence>
  )
}
