export function LoadingScreen() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="glass animate-pulse rounded-[2rem] px-5 py-6 shadow-lg shadow-slate-950/20"
        >
          <div className="h-4 w-28 rounded-full bg-white/10" />
          <div className="mt-4 h-6 w-3/4 rounded-full bg-white/10" />
          <div className="mt-3 h-24 rounded-[1.5rem] bg-white/6" />
          <div className="mt-4 flex gap-2">
            <div className="h-10 flex-1 rounded-2xl bg-white/10" />
            <div className="h-10 flex-1 rounded-2xl bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  )
}
