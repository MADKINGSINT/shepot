export function SetupBanner() {
  return (
    <div className="glass mt-5 rounded-[1.7rem] border border-amber-300/20 px-4 py-4 text-sm text-slate-200">
      <p className="font-semibold text-white">Подключите Supabase для живых данных</p>
      <p className="mt-2 leading-6 text-slate-300">
        Пока приложение показывает демо-ленту. Чтобы включить регистрацию, загрузку
        фото и модерацию, заполните `.env` по примеру из `.env.example` и выполните
        SQL-скрипт из `supabase/schema.sql`.
      </p>
    </div>
  )
}
