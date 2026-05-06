import { useState } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { api } from "./lib/api";

const AuthAndApiDemo = () => {
  const { user, loading, signUp, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [result, setResult] = useState("");

  const run = async (fn) => {
    try {
      const response = await fn();
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(error.message);
    }
  };

  if (loading) return <p>Loading auth...</p>;

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 680, margin: "40px auto" }}>
      <h1>Supabase Auth + API Starter</h1>
      <p>Current user: {user?.email ?? "Not signed in"}</p>

      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          placeholder="Full name (for profile API)"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => run(() => signUp(email, password))}>Sign up</button>
        <button onClick={() => run(() => signIn(email, password))}>Sign in</button>
        <button onClick={() => run(() => signOut())}>Sign out</button>
        <button onClick={() => run(() => api.me())}>Call /api/auth/me</button>
        <button onClick={() => run(() => api.protected())}>Call /api/protected</button>
        <button onClick={() => run(() => api.getProfile())}>Call GET /api/profile</button>
        <button onClick={() => run(() => api.updateProfile(fullName))}>Call PUT /api/profile</button>
      </div>

      <pre style={{ marginTop: 16, background: "#f4f4f4", padding: 12, borderRadius: 8 }}>
        {result}
      </pre>
    </main>
  );
};

export const App = () => (
  <AuthProvider>
    <AuthAndApiDemo />
  </AuthProvider>
);
