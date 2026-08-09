import { Link } from "@tanstack/react-router";

import { CATEGORIES } from "@/lib/categories";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <h2 className="font-display text-lg font-bold">THANE CONNECT</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            A hyper-local discovery portal for Thane City, written and curated by SP
            College students.
          </p>
        </div>

        <nav aria-label="Footer categories">
          <h3 className="text-sm font-semibold">Categories</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  to="/explore"
                  search={{ category, page: 1 }}
                  className="hover:text-foreground"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer links">
          <h3 className="text-sm font-semibold">Community</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/explore" className="hover:text-foreground">
                Explore spots
              </Link>
            </li>
            <li>
              <Link to="/auth" search={{ mode: "signup" }} className="hover:text-foreground">
                Become a contributor
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-foreground">
                My posts
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Thane Connect · A student community project
      </div>
    </footer>
  );
}
