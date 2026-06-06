"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("drkamel17@gmail.com");
  const [password, setPassword] = useState("kamel2026");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const router = useRouter();

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Compte créé ! Tu peux maintenant te connecter.");
        setMode("login");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-96 bg-zinc-900 p-6 rounded-xl">
        <div className="flex mb-6">
          <button
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
            className={`flex-1 p-2 text-center rounded-l ${mode === "login" ? "bg-red-600" : "bg-zinc-800"}`}
          >
            Connexion
          </button>
          <button
            onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
            className={`flex-1 p-2 text-center rounded-r ${mode === "register" ? "bg-red-600" : "bg-zinc-800"}`}
          >
            Créer un compte
          </button>
        </div>

        <h1 className="text-2xl mb-4 font-bold">
          {mode === "login" ? "Connexion" : "Créer un compte"}
        </h1>

        {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
        {success && <p className="text-green-500 mb-3 text-sm">{success}</p>}

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
          onClick={handleSubmit}
          className="w-full bg-red-600 p-3 rounded font-semibold hover:bg-red-700"
        >
          {mode === "login" ? "Se connecter" : "S'inscrire"}
        </button>
      </div>
    </div>
  );
}
