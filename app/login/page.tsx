"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit() {
    setError("");
    const login = email.includes("@") ? email : `${email}@example.com`;
    const { error } = await signIn(login, password);
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
          className="w-full p-3 mb-3 rounded bg-white text-black"
          placeholder="Email ou nom d'utilisateur"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-3 mb-3 rounded bg-white text-black"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-red-600 p-3 rounded font-semibold hover:bg-red-700"
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}
