"use client";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Erreur</h1>
        <p className="text-zinc-400 mb-4">{error.message}</p>
        <button onClick={reset} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
          Réessayer
        </button>
      </div>
    </div>
  );
}
