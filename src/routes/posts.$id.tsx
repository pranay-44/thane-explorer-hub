import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { MapPin, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CategoryBadge } from "@/components/CategoryBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, postImageSrc } from "@/lib/categories";
import { renderBasicMarkdown, excerpt } from "@/lib/markdown";
import { getPost } from "@/lib/posts.functions";
import { useIsAdmin, useSession } from "@/lib/use-auth";

const postQuery = (id: string) =>
  queryOptions({
    queryKey: ["post", id],
    queryFn: async () => {
      const post = await getPost({ data: { id } });
      if (!post) throw notFound();
      return post;
    },
  });

export const Route = createFileRoute("/posts/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(postQuery(params.id)),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Place not found | Thane Connect" }, { name: "robots", content: "noindex" }],
      };
    }
    const description = excerpt(loaderData.description, 155);
    return {
      meta: [
        { title: `${loaderData.title} — ${loaderData.category} | Thane Connect` },
        { name: "description", content: description },
        { property: "og:title", content: `${loaderData.title} | Thane Connect` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: PostDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">This place doesn't exist</h1>
      <p className="mt-2 text-muted-foreground">It may have been removed by its author.</p>
      <Link
        to="/explore"
        className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Back to Explore
      </Link>
    </div>
  ),
  errorComponent: () => (
    <p className="mx-auto max-w-2xl p-10 text-center text-muted-foreground">
      Something went wrong. Please try again.
    </p>
  ),
});

function PostDetail() {
  const { id } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQuery(id));
  const { user } = useSession();
  const { data: isAdmin } = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.id === post.author_id;
  const canManage = isOwner || Boolean(isAdmin);

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    setDeleting(false);
    if (error) {
      toast.error("Could not delete this post. Please try again.");
      return;
    }
    toast.success("Post deleted");
    navigate({ to: "/explore", search: { page: 1 } });
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        to="/explore"
        search={{ page: 1 }}
        className="tap-target inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to Explore
      </Link>

      <img
        src={postImageSrc(post.image_url, post.category)}
        alt={`Cover photo of ${post.title}`}
        width={1200}
        height={750}
        className="mt-4 aspect-16/9 w-full rounded-2xl object-cover shadow-card"
      />

      <header className="mt-6">
        <CategoryBadge category={post.category} />
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          By <span className="font-semibold text-foreground">{post.author_name}</span> ·{" "}
          {post.author_college} · {post.author_department}
        </p>
        <p className="text-sm text-muted-foreground">
          Published {formatDate(post.created_at)}
        </p>
      </header>

      <div
        className="mt-8 space-y-4 border-t border-border pt-8 text-base leading-relaxed [&_p]:text-foreground/90"
        dangerouslySetInnerHTML={{ __html: renderBasicMarkdown(post.description) }}
      />

      <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-8">
        {post.location_url && (
          <a
            href={post.location_url}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-target inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            <MapPin className="size-4" aria-hidden="true" /> Open in Google Maps
          </a>
        )}

        {isOwner && (
          <Link
            to="/posts/$id/edit"
            params={{ id: post.id }}
            className="tap-target inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-secondary"
          >
            <Pencil className="size-4" aria-hidden="true" /> Edit Post
          </Link>
        )}

        {canManage && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="tap-target inline-flex items-center gap-2 rounded-xl border border-destructive/40 px-5 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-4" aria-hidden="true" /> Delete Post
          </button>
        )}
      </div>

      {confirming && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
        >
          <div className="surface-panel w-full max-w-sm p-6">
            <h2 id="delete-title" className="text-lg font-semibold">
              Delete this post?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This permanently removes “{post.title}” from Thane Connect.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="tap-target rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="tap-target rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete post"}
              </button>
            </div>
          </div>
        </div>
      )}

    </article>
  );
}
