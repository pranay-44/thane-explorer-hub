import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CategoryBadge } from "@/components/CategoryBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, postImageSrc } from "@/lib/categories";
import { useSession } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Places | Thane Connect" },
      { name: "description", content: "Manage the places you have shared on Thane Connect." },
      { property: "og:title", content: "My Places | Thane Connect" },
      { property: "og:description", content: "Edit or remove your Thane Connect contributions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["my-posts", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function handleDelete(id: string, imagePath: string | null) {
    setDeletingId(id);
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      setDeletingId(null);
      toast.error("Could not delete this post.");
      return;
    }
    if (imagePath) await supabase.storage.from("post-images").remove([imagePath]);
    await queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    setDeletingId(null);
    toast.success("Post deleted");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">My places</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {posts?.length ?? 0} published {posts?.length === 1 ? "place" : "places"}
          </p>
        </div>
        <Link
          to="/create"
          className="tap-target inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden="true" /> New place
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading your posts…</p>
      ) : !posts || posts.length === 0 ? (
        <div className="surface-panel mt-10 p-10 text-center">
          <p className="font-semibold">You haven't shared a place yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start with the spot you'd recommend to a first-year student.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="surface-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
            >
              <img
                src={postImageSrc(post.image_url, post.category)}
                alt={`Cover of ${post.title}`}
                className="h-24 w-full rounded-lg object-cover sm:w-36"
              />
              <div className="min-w-0 flex-1">
                <CategoryBadge category={post.category} />
                <h2 className="mt-2 truncate text-base font-semibold">
                  <Link to="/posts/$id" params={{ id: post.id }} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Published {formatDate(post.created_at)}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/posts/$id/edit"
                  params={{ id: post.id }}
                  className="tap-target inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary"
                >
                  <Pencil className="size-4" aria-hidden="true" /> Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(post.id, post.image_url)}
                  disabled={deletingId === post.id}
                  className="tap-target inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  <Trash2 className="size-4" aria-hidden="true" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
