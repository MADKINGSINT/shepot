const compactNumberFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 1,
  notation: 'compact',
})

const relativeFormatter = new Intl.RelativeTimeFormat('ru', {
  numeric: 'auto',
})

const minute = 60 * 1000
const hour = 60 * minute
const day = 24 * hour

export function formatCompactNumber(value) {
  return compactNumberFormatter.format(value)
}

export function formatModerationStatus(status) {
  const dictionary = {
    approved: 'Проверено',
    pending: 'На модерации',
    rejected: 'Отклонено',
  }

  return dictionary[status] ?? 'Статус'
}

export function formatRelativeDate(value) {
  const timestamp = new Date(value).getTime()
  const diff = timestamp - Date.now()
  const absoluteDiff = Math.abs(diff)

  if (absoluteDiff < hour) {
    return relativeFormatter.format(Math.round(diff / minute), 'minute')
  }

  if (absoluteDiff < day) {
    return relativeFormatter.format(Math.round(diff / hour), 'hour')
  }

  if (absoluteDiff < day * 7) {
    return relativeFormatter.format(Math.round(diff / day), 'day')
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(value))
}

export function getInitials(name) {
  return String(name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
