"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur inattendue</h1>
          <button onClick={reset} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
