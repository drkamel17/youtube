import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-zinc-400 mb-6">Page introuvable</p>
        <Link href="/dashboard" className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
