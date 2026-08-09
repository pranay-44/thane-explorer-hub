import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Compass, Train, Landmark, Waves, UserPlus } from "lucide-react";

import { PostCard } from "@/components/PostCard";
import { listPosts } from "@/lib/posts.functions";

const featuredQuery = queryOptions({
  queryKey: ["posts", "featured"],
  queryFn: () => listPosts({ data: { page: 1, limit: 6 } }),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(featuredQuery),
  head: () => ({
    meta: [
      { title: "Thane Connect — Discover Thane Through Student Eyes" },
      {
        name: "description",
        content:
          "Explore Thane's best food spots, lakes, temples, parks and historical sites, reviewed by SP College students.",
      },
      { property: "og:title", content: "Thane Connect — Discover Thane Through Student Eyes" },
      {
        property: "og:description",
        content:
          "A student-curated guide to food, nature, heritage and attractions across Thane City.",
      },
    ],
  }),
  component: Home,
  errorComponent: () => (
    <p className="mx-auto max-w-2xl p-10 text-center text-muted-foreground">
      Something went wrong. Please try again.
    </p>
  ),
});

const TIMELINE = [
  {
    icon: Landmark,
    year: "Ancient era",
    title: "Shreesthanak roots",
    text: "Thane appears in early records as Shreesthanak, a thriving port town on the Ulhas creek.",
  },
  {
    icon: Compass,
    year: "1739",
    title: "Maratha capture of Thane Fort",
    text: "The Marathas took the Portuguese fort, reshaping the city's story and skyline.",
  },
  {
    icon: Train,
    year: "16 April 1853",
    title: "India's first passenger train",
    text: "The country's first passenger service ran from Bori Bunder to Thane terminus.",
  },
  {
    icon: Waves,
    year: "Today",
    title: "City of lakes",
    text: "Upvan, Masunda and dozens more lakes give Thane its green, waterside character.",
  },
];

function Home() {
  const { data } = useSuspenseQuery(featuredQuery);

  return (
    <>
      <section className="relative isolate">
        <img
          src="/images/hero-thane.jpg"
          alt="Sunset over a Thane lake with the city skyline and green hills"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:py-40">
          <p className="rounded-full bg-background/15 px-4 py-1.5 text-xs font-semibold tracking-widest text-primary-foreground uppercase ring-1 ring-primary-foreground/30">
            SP College · Thane City
          </p>
          <h1 className="mt-6 font-display text-4xl leading-tight font-bold text-primary-foreground sm:text-5xl lg:text-6xl">
            Discover Thane Through Student Eyes
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
            Thane Connect is where SP College students share the food stalls, lakes,
            temples, parks and historical corners that make this city worth exploring.
          </p>
          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/explore"
              className="tap-target inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lift hover:opacity-90"
            >
              <Compass className="size-4" aria-hidden="true" /> Explore Spots
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="tap-target inline-flex items-center justify-center gap-2 rounded-xl bg-background/10 px-6 py-3 text-sm font-semibold text-primary-foreground ring-1 ring-primary-foreground/40 backdrop-blur hover:bg-background/20"
            >
              <UserPlus className="size-4" aria-hidden="true" /> Join the Community
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase">
            Cultural legacy
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">A city with deep roots</h2>
        </header>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIMELINE.map((item) => (
            <li key={item.year} className="surface-panel card-lift p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-4 text-xs font-semibold tracking-wider text-accent uppercase">
                {item.year}
              </p>
              <h3 className="mt-1 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-surface py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest text-accent uppercase">
                Featured
              </p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Latest student picks</h2>
            </div>
            <Link
              to="/explore"
              className="tap-target inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              View all places
            </Link>
          </header>

          {data.posts.length === 0 ? (
            <p className="mt-10 text-muted-foreground">
              No places yet. Be the first to publish one!
            </p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.posts.map((post, index) => (
                <PostCard key={post.id} post={post} eager={index < 3} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
