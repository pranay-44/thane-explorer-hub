import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).catch("login"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Login or Sign Up | Thane Connect" },
      {
        name: "description",
        content:
          "Sign in or create a Thane Connect student account to publish places around Thane City.",
      },
      { property: "og:title", content: "Join Thane Connect" },
      {
        property: "og:description",
        content: "Create a student contributor account and start publishing Thane spots.",
      },
    ],
  }),
  component: AuthPage,
});

const usernameRule = /^[a-zA-Z0-9]{4,20}$/;

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useSession();

  if (user) {
    navigate({ to: "/explore", search: { page: 1 }, replace: true });
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="flex gap-1 rounded-xl bg-secondary p-1">
        <TabButton active={mode === "login"} onClick={() => navigate({ to: "/auth", search: { mode: "login" } })}>
          Login
        </TabButton>
        <TabButton active={mode === "signup"} onClick={() => navigate({ to: "/auth", search: { mode: "signup" } })}>
          Sign Up
        </TabButton>
      </div>

      {mode === "signup" ? <SignupForm /> : <LoginForm />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "tap-target flex-1 rounded-lg text-sm font-semibold",
        active ? "bg-card shadow-card" : "text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      setBusy(false);
      setError("Invalid email or password.");
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
      <h1 className="text-2xl font-bold">Welcome back</h1>

      <div>
        <label htmlFor="login-email" className="text-sm font-semibold">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
    </form>
  );
}

type SignupState = {
  username: string;
  email: string;
  password: string;
  confirm: string;
  display_name: string;
  college_name: string;
  department_name: string;
};

function SignupForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<SignupState>({
    username: "",
    email: "",
    password: "",
    confirm: "",
    display_name: "",
    college_name: "SP College",
    department_name: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const errors: Partial<Record<keyof SignupState, string>> = {};
  if (!usernameRule.test(values.username))
    errors.username = "4–20 letters and numbers only";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address";
  if (values.password.length < 8) errors.password = "At least 8 characters";
  else if (!/[A-Z]/.test(values.password)) errors.password = "Add 1 uppercase letter";
  else if (!/[0-9]/.test(values.password)) errors.password = "Add 1 number";
  if (values.confirm !== values.password) errors.confirm = "Passwords do not match";
  if (values.display_name.trim().length < 2) errors.display_name = "Enter your name";
  if (values.college_name.trim().length < 2) errors.college_name = "Enter your college";
  if (values.department_name.trim().length < 2)
    errors.department_name = "Enter your department";

  const isValid = Object.keys(errors).length === 0;

  function update<K extends keyof SignupState>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(
      Object.fromEntries(Object.keys(values).map((key) => [key, true])) as Record<string, boolean>,
    );
    if (!isValid) return;

    setBusy(true);
    setServerError(null);

    const { data: existing } = await supabase
      .from("profiles")
      .select("username")
      .ilike("username", values.username)
      .maybeSingle();
    if (existing) {
      setBusy(false);
      setServerError("That username is already taken.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          username: values.username,
          display_name: values.display_name.trim(),
          college_name: values.college_name.trim(),
          department_name: values.department_name.trim(),
        },
      },
    });

    setBusy(false);

    if (error) {
      setServerError(
        error.message.toLowerCase().includes("already")
          ? "An account with this email already exists."
          : "Sign up failed. Please try again.",
      );
      return;
    }

    await supabase.auth.signOut();
    toast.success("Sign up successful! Please log in with your credentials.");
    navigate({ to: "/auth", search: { mode: "login" } });
  }

  const show = (key: keyof SignupState) => (touched[key] ? errors[key] : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate className="surface-panel mt-6 space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-bold">Become a contributor</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Publish your favourite Thane spots for the whole city to read.
        </p>
      </div>

      <SignupField
        id="username"
        label="Username"
        value={values.username}
        error={show("username")}
        onChange={(value) => update("username", value)}
        onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
        autoComplete="username"
      />
      <SignupField
        id="email"
        label="Email"
        type="email"
        value={values.email}
        error={show("email")}
        onChange={(value) => update("email", value)}
        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
        autoComplete="email"
      />
      <SignupField
        id="password"
        label="Password"
        type="password"
        value={values.password}
        error={show("password")}
        hint="Min 8 characters, 1 uppercase letter and 1 number"
        onChange={(value) => update("password", value)}
        onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
        autoComplete="new-password"
      />
      <SignupField
        id="confirm"
        label="Confirm Password"
        type="password"
        value={values.confirm}
        error={show("confirm")}
        onChange={(value) => update("confirm", value)}
        onBlur={() => setTouched((prev) => ({ ...prev, confirm: true }))}
        autoComplete="new-password"
      />
      <SignupField
        id="display_name"
        label="Display Name"
        value={values.display_name}
        error={show("display_name")}
        onChange={(value) => update("display_name", value)}
        onBlur={() => setTouched((prev) => ({ ...prev, display_name: true }))}
        autoComplete="name"
      />
      <SignupField
        id="college_name"
        label="College Name"
        value={values.college_name}
        error={show("college_name")}
        onChange={(value) => update("college_name", value)}
        onBlur={() => setTouched((prev) => ({ ...prev, college_name: true }))}
      />
      <SignupField
        id="department_name"
        label="Department"
        value={values.department_name}
        error={show("department_name")}
        onChange={(value) => update("department_name", value)}
        onBlur={() => setTouched((prev) => ({ ...prev, department_name: true }))}
      />

      {serverError && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !isValid}
        className="tap-target w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

function SignupField({
  id,
  label,
  value,
  error,
  hint,
  type = "text",
  autoComplete,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  error?: string | undefined;
  hint?: string | undefined;
  type?: string | undefined;
  autoComplete?: string | undefined;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className={cn(
          "tap-target mt-1.5 w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none focus:border-accent",
          error ? "border-destructive" : "border-input",
        )}
      />
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
