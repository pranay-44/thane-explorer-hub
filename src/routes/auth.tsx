import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { studentIdToEmail } from "@/lib/auth-constants";
import { useSession } from "@/lib/use-auth";

// Kept lenient (rather than removed) so existing `navigate({ to: "/auth", search: { mode: "login" } })`
// calls elsewhere in the app (e.g. the protected-route redirect) still type-check and work.
const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).catch("login"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Login | Thane Connect" },
      {
        name: "description",
        content: "Log in to your Thane Connect student account to publish places around Thane City.",
      },
      { property: "og:title", content: "Login | Thane Connect" },
      {
        property: "og:description",
        content: "Log in with the Student ID issued to you by your college admin.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useSession();

  useEffect(() => {
    if (user) navigate({ to: "/explore", search: { page: 1 }, replace: true });
  }, [user, navigate]);

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <LoginForm />
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedId = studentId.trim();
    if (!trimmedId) {
      setError("Enter your Student ID.");
      return;
    }

    setBusy(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: studentIdToEmail(trimmedId),
      password,
    });
    if (signInError) {
      setBusy(false);
      setError("Invalid Student ID or password.");
      return;
    }

    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_active")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile && !profile.is_active) {
        await supabase.auth.signOut();
        setBusy(false);
        setError("This account has been disabled. Please contact an admin.");
        return;
      }
    }

    setBusy(false);
    toast.success("Welcome back!");
    navigate({ to: "/explore", search: { page: 1 } });
  }

  return (
    <form onSubmit={handleSubmit} className="surface-panel mt-6 space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-bold">Student login</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the Student ID and password issued to you by your college admin.
        </p>
      </div>

      <div>
        <label htmlFor="login-student-id" className="text-sm font-semibold">
          Student ID
        </label>
        <input
          id="login-student-id"
          type="text"
          required
          autoComplete="username"
          value={studentId}
          onChange={(event) => setStudentId(event.target.value)}
          className="tap-target mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="text-sm font-semibold">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="tap-target mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="tap-target w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Signing in..." : "Login"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Don't have a Student ID? Contact your admin — accounts aren't self-registered.
      </p>
    </form>
  );
}