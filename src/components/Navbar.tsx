import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useSession } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

type NavItem = { label: string; to: string };

export function Navbar() {
  const { user, loading } = useSession();
  const { data: isAdmin } = useIsAdmin(user?.id);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  const items: NavItem[] = [
    { label: "Home", to: "/" },
    { label: "Explore", to: "/explore" },
  ];
  if (user) {
    items.push({ label: "My Posts", to: "/dashboard" });
    items.push({ label: "Create Post", to: "/create" });
    if (isAdmin) items.push({ label: "Admin", to: "/admin" });
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await router.invalidate();
    toast.success("Signed out");
    navigate({ to: "/", replace: true });
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
      >
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-base font-bold tracking-tight sm:text-lg"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <MapPin className="size-4" aria-hidden="true" />
          </span>
          THANE CONNECT
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="tap-target inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "text-foreground bg-secondary" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="ml-2 flex items-center gap-2">
            {loading ? null : user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="tap-target rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/auth"
                  search={{ mode: "login" }}
                  className="tap-target inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold hover:bg-secondary"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="tap-target inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Sign Up
                </Link>
              </>
            )}
          </li>
        </ul>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="tap-target grid place-items-center rounded-lg border border-border md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <div
        id="mobile-nav"
        className={cn("border-t border-border md:hidden", open ? "block" : "hidden")}
      >
        <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
          {items.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={() => setOpen(false)}
                className="tap-target flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                activeProps={{ className: "bg-secondary" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="mt-2 flex gap-2">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="tap-target flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/auth"
                  search={{ mode: "login" }}
                  onClick={() => setOpen(false)}
                  className="tap-target flex flex-1 items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  onClick={() => setOpen(false)}
                  className="tap-target flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Sign Up
                </Link>
              </>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
}
