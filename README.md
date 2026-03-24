# Шепот ЦО2

Мобильное веб-приложение для школьной подслушки на React + Vite + Tailwind CSS + Supabase.

## Что уже реализовано

- регистрация и вход через Supabase Auth
- главная лента с лайками и комментариями
- создание постов с несколькими фотографиями
- очередь модерации для админов
- личный кабинет с историей своих постов
- mobile-first интерфейс и анимации на `framer-motion`

## Стек

- React 19
- Vite
- Tailwind CSS v4
- Supabase
- Framer Motion
- Lucide React

## Запуск

1. Установите зависимости:

```bash
npm install
```

2. Создайте `.env` на основе `.env.example` и вставьте:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

3. В Supabase SQL Editor выполните файл `supabase/schema.sql`.

4. Запустите приложение:

```bash
npm run dev
```

## Настройка админа

После регистрации пользователя обновите его роль в таблице `profiles`:

```sql
update public.profiles
set role = 'admin'
where username = 'нужный_username';
```

## Что важно в схеме

- посты создаются в статусе `pending`
- в общую ленту попадают только `approved`
- изображения хранятся в bucket `post-images`
- RLS-политики ограничивают создание, модерацию и доступ к контенту

## Файлы

- `src/` — интерфейс приложения
- `supabase/schema.sql` — схема базы, RLS и storage policies
- `.env.example` — пример переменных окружения
