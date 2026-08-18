"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard, inputStyle, btnStyle, OK } from "../auth-ui";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <AuthCard title="Create account">
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password (min 8 characters)"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ ...inputStyle, marginTop: 10 }}
        />
        {error && <p style={{ color: "#e74c3c", fontSize: 13, marginTop: 10 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ ...btnStyle(OK), width: "100%", marginTop: 16 }}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p style={{ fontSize: 13, color: "#888", marginTop: 16, textAlign: "center" }}>
        Already have an account? <Link href="/login" style={{ color: OK }}>Log in</Link>
      </p>
    </AuthCard>
  );
}
