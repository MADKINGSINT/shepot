import { demoPosts } from './demo-data'
import { POST_IMAGE_BUCKET, supabase } from './supabase'

const commentSelect = `
  id,
  post_id,
  content,
  created_at,
  author_id,
  author:profiles!comments_author_id_fkey(display_name, username)
`

function ensureSupabase() {
  if (!supabase) {
    throw new Error('Сначала подключите Supabase в .env, чтобы включить живые данные.')
  }
}

function normalizeComment(comment) {
  return {
    authorName: comment.author?.display_name ?? 'Ученик',
    authorUsername: comment.author?.username ?? null,
    content: comment.content,
    createdAt: comment.created_at,
    id: comment.id,
    postId: comment.post_id,
  }
}

function normalizePost(row, likedPostIds, commentsByPostId) {
  const comments = commentsByPostId.get(row.id) ?? []
  const images = Array.isArray(row.images)
    ? row.images
        .map((image) => ({
          id: image.id ?? `${row.id}-${image.sort_order ?? 0}`,
          imageUrl: image.imageUrl ?? image.image_url,
          sortOrder: image.sortOrder ?? image.sort_order ?? 0,
        }))
        .sort((left, right) => left.sortOrder - right.sortOrder)
    : []

  return {
    authorId: row.author_id,
    authorName: row.author_name ?? 'Ученик',
    authorUsername: row.author_username ?? null,
    comments,
    commentsCount: row.comments_count ?? comments.length,
    content: row.content,
    createdAt: row.created_at,
    id: row.id,
    images,
    likesCount: row.likes_count ?? 0,
    moderationStatus: row.moderation_status,
    viewerHasLiked: likedPostIds.has(row.id),
  }
}

async function fetchComments(postIds) {
  if (!postIds.length || !supabase) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('comments')
    .select(commentSelect)
    .in('post_id', postIds)
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  const commentsByPostId = new Map()

  for (const comment of data ?? []) {
    const normalizedComment = normalizeComment(comment)
    const currentComments = commentsByPostId.get(comment.post_id) ?? []
    currentComments.push(normalizedComment)
    commentsByPostId.set(comment.post_id, currentComments)
  }

  return commentsByPostId
}

async function fetchLikedPostIds(postIds, userId) {
  if (!postIds.length || !supabase || !userId) {
    return new Set()
  }

  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds)

  if (error) {
    throw error
  }

  return new Set((data ?? []).map((item) => item.post_id))
}

async function hydratePosts(rows, userId) {
  const postIds = rows.map((row) => row.id)

  const [commentsByPostId, likedPostIds] = await Promise.all([
    fetchComments(postIds),
    fetchLikedPostIds(postIds, userId),
  ])

  return rows.map((row) => normalizePost(row, likedPostIds, commentsByPostId))
}

export async function addComment({ authorId, content, postId }) {
  ensureSupabase()

  const trimmedContent = content.trim()

  if (trimmedContent.length < 2) {
    throw new Error('Комментарий должен быть хотя бы из 2 символов.')
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      author_id: authorId,
      content: trimmedContent,
      post_id: postId,
    })
    .select(commentSelect)
    .single()

  if (error) {
    throw error
  }

  return normalizeComment(data)
}

export async function createPost({ authorId, content, files }) {
  ensureSupabase()

  const trimmedContent = content.trim()

  if (trimmedContent.length < 12) {
    throw new Error('Пост должен содержать минимум 12 символов текста.')
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      author_id: authorId,
      content: trimmedContent,
    })
    .select('id')
    .single()

  if (error) {
    throw error
  }

  const uploadedPaths = []

  try {
    const imageRows = []

    for (const [index, file] of files.entries()) {
      const extension = file.name.split('.').pop() || 'jpg'
      const path = `${authorId}/${post.id}/${crypto.randomUUID()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from(POST_IMAGE_BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      uploadedPaths.push(path)

      const {
        data: { publicUrl },
      } = supabase.storage.from(POST_IMAGE_BUCKET).getPublicUrl(path)

      imageRows.push({
        image_url: publicUrl,
        post_id: post.id,
        sort_order: index,
        storage_path: path,
      })
    }

    if (imageRows.length) {
      const { error: imagesError } = await supabase.from('post_images').insert(imageRows)

      if (imagesError) {
        throw imagesError
      }
    }

    return post.id
  } catch (submitError) {
    if (uploadedPaths.length) {
      await Promise.all(
        uploadedPaths.map((path) => supabase.storage.from(POST_IMAGE_BUCKET).remove([path])),
      )
    }

    await supabase.from('posts').delete().eq('id', post.id)
    throw submitError
  }
}

export async function getFeedPosts({ userId } = {}) {
  if (!supabase) {
    return demoPosts
  }

  const { data, error } = await supabase
    .from('posts_feed')
    .select('*')
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return hydratePosts(data ?? [], userId)
}

export async function getMyPosts({ userId }) {
  ensureSupabase()

  const { data, error } = await supabase
    .from('posts_feed')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return hydratePosts(data ?? [], userId)
}

export async function getPendingPosts() {
  ensureSupabase()

  const { data, error } = await supabase
    .from('posts_feed')
    .select('*')
    .eq('moderation_status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return hydratePosts(data ?? [], null)
}

export async function toggleLike({ isLiked, postId, userId }) {
  ensureSupabase()

  if (isLiked) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .match({ post_id: postId, user_id: userId })

    if (error) {
      throw error
    }

    return false
  }

  const { error } = await supabase.from('post_likes').insert({
    post_id: postId,
    user_id: userId,
  })

  if (error) {
    throw error
  }

  return true
}

export async function updatePostModeration({ moderatorId, postId, status }) {
  ensureSupabase()

  const { error } = await supabase
    .from('posts')
    .update({
      moderated_at: new Date().toISOString(),
      moderated_by: moderatorId,
      moderation_status: status,
    })
    .eq('id', postId)

  if (error) {
    throw error
  }

  return status
}
