export const demoPosts = [
  {
    id: 'demo-1',
    authorName: 'Редакция Шепот ЦО2',
    authorUsername: 'campus_team',
    comments: [
      {
        id: 'demo-comment-1',
        authorName: 'Саша 9А',
        authorUsername: 'sasha_9a',
        content: 'Очень хочется больше подобных фотоисторий со школьной жизнью.',
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
    ],
    commentsCount: 1,
    content:
      'Запускаем новую школьную ленту: делитесь историями, событиями, анонсами и важными моментами. Каждый пост сначала проходит модерацию, поэтому в ленте будет меньше хаоса и больше нормального контента.',
    createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    images: [
      {
        id: 'demo-image-1',
        imageUrl:
          'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 'demo-image-2',
        imageUrl:
          'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    likesCount: 31,
    moderationStatus: 'approved',
    viewerHasLiked: false,
  },
  {
    id: 'demo-2',
    authorName: 'Полина 10Б',
    authorUsername: 'polly10b',
    comments: [
      {
        id: 'demo-comment-2',
        authorName: 'Илья 10Б',
        authorUsername: 'ilya10b',
        content: 'Если запустите рубрику с мемами недели, я точно подпишусь.',
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      },
      {
        id: 'demo-comment-3',
        authorName: 'Редакция Шепот ЦО2',
        authorUsername: 'campus_team',
        content: 'Рубрика уже в планах. Можно предлагать идеи в комментариях.',
        createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      },
    ],
    commentsCount: 2,
    content:
      'Очень нужен формат, где можно публиковать идеи для школьных мероприятий. Концерты, турниры, тематические дни, обмен книгами. Такое приложение как раз подходит.',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    images: [],
    likesCount: 18,
    moderationStatus: 'approved',
    viewerHasLiked: true,
  },
  {
    id: 'demo-3',
    authorName: 'Артем 11А',
    authorUsername: 'art11',
    comments: [],
    commentsCount: 0,
    content:
      'Сделайте, пожалуйста, чтобы админы быстро пропускали новости про олимпиады и кружки. Это реально полезно и помогает не пропускать дедлайны.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    images: [
      {
        id: 'demo-image-3',
        imageUrl:
          'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    likesCount: 24,
    moderationStatus: 'approved',
    viewerHasLiked: false,
  },
]
