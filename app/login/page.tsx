"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin() {
    setError("");
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-96 bg-zinc-900 p-6 rounded-xl">
        <h1 className="text-2xl mb-4 font-bold">Connexion</h1>
        {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
        <input
          className="w-full p-3 mb-3 rounded bg-zinc-800"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-3 mb-3 rounded bg-zinc-800"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-red-600 p-3 rounded font-semibold hover:bg-red-700"
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}
