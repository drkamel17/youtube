export default function Loading() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <aside className="w-64 bg-zinc-900 min-h-screen p-4">
        <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse mb-6" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-zinc-800 rounded animate-pulse mb-2" />
        ))}
      </aside>
      <div className="flex-1 p-6">
        <div className="h-10 bg-zinc-800 rounded animate-pulse mb-4" />
        <div className="h-10 bg-zinc-800 rounded animate-pulse mb-4 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl overflow-hidden">
              <div className="aspect-video bg-zinc-800 animate-pulse" />
              <div className="p-3">
                <div className="h-4 bg-zinc-800 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
