import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { PostCard } from "@/components/PostCard";
import { CATEGORIES, PAGE_SIZE } from "@/lib/categories";
import { listPosts } from "@/lib/posts.functions";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  q: z.string().max(120).optional(),
  category: z.enum(CATEGORIES).optional(),
  page: z.number().int().min(1).catch(1),
});

export const Route = createFileRoute("/explore")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Explore Thane — Food, Lakes, Temples & Heritage | Thane Connect" },
      {
        name: "description",
        content:
          "Search and filter student reviews of places across Thane: restaurants, lakes, temples, parks and historical sites.",
      },
      { property: "og:title", content: "Explore places in Thane | Thane Connect" },
      {
        property: "og:description",
        content: "Browse student-written guides to Thane by category or keyword.",
      },
    ],
  }),
  component: Explore,
});

function Explore() {
  const { q, category, page } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [term, setTerm] = useState(q ?? "");

  useEffect(() => {
    setTerm(q ?? "");
  }, [q]);

  const query = useQuery({
    queryKey: ["posts", "explore", q ?? "", category ?? "all", page],
    queryFn: () =>
      listPosts({
        data: { page, limit: PAGE_SIZE, search: q || undefined, category },
      }),
    placeholderData: keepPreviousData,
  });

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    navigate({ search: { q: term.trim() || undefined, category, page: 1 } });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Explore Thane</h1>
        <p className="mt-2 text-muted-foreground">
          Student-written guides to food, nature, heritage and everything in between.
        </p>
      </header>

      <form onSubmit={submitSearch} role="search" className="mt-6">
        <label htmlFor="explore-search" className="sr-only">
          Search places
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="explore-search"
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              maxLength={120}
              placeholder="Search places, food, lakes, heritage..."
              className="tap-target w-full rounded-xl border border-input bg-card pr-4 pl-9 text-sm shadow-card outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="tap-target rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Search
          </button>
        </div>
      </form>

      <nav
        aria-label="Filter by category"
        className="sticky top-[57px] z-30 -mx-4 mt-5 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6"
      >
        <ul className="flex gap-2 overflow-x-auto pb-1">
          <li>
            <FilterChip active={!category} to={{ q, page: 1 }} label="All" />
          </li>
          {CATEGORIES.map((item) => (
            <li key={item}>
              <FilterChip
                active={category === item}
                to={{ q, category: item, page: 1 }}
                label={item}
              />
            </li>
          ))}
        </ul>
      </nav>

      {query.isPending ? (
        <p className="py-16 text-center text-muted-foreground">Loading places...</p>
      ) : query.isError ? (
        <p className="py-16 text-center text-muted-foreground">
          Something went wrong. Please try again.
        </p>
      ) : query.data.posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg font-semibold">No places found.</p>
          <p className="mt-1 text-muted-foreground">
            Try another search or category.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
            {query.data.total} place{query.data.total === 1 ? "" : "s"} found
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {query.data.posts.map((post, index) => (
              <PostCard key={post.id} post={post} eager={index < 3} />
            ))}
          </div>

          {query.data.pageCount > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-10 flex items-center justify-center gap-2"
            >
              <PageLink
                disabled={page <= 1}
                to={{ q, category, page: page - 1 }}
                label="Previous"
              />
              <span className="px-2 text-sm text-muted-foreground">
                Page {page} of {query.data.pageCount}
              </span>
              <PageLink
                disabled={page >= query.data.pageCount}
                to={{ q, category, page: page + 1 }}
                label="Next"
              />
            </nav>
          )}
        </>
      )}
    </div>
  );
}

type SearchState = { q?: string; category?: (typeof CATEGORIES)[number]; page: number };

function FilterChip({
  active,
  to,
  label,
}: {
  active: boolean;
  to: SearchState;
  label: string;
}) {
  return (
    <Link
      to="/explore"
      search={to}
      aria-current={active ? "true" : undefined}
      className={cn(
        "tap-target inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function PageLink({
  disabled,
  to,
  label,
}: {
  disabled: boolean;
  to: SearchState;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="tap-target inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground opacity-50">
        {label}
      </span>
    );
  }
  return (
    <Link
      to="/explore"
      search={to}
      className="tap-target inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
    >
      {label}
    </Link>
  );
}
