import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { CategoryBadge } from "@/components/CategoryBadge";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, formatDate } from "@/lib/categories";
import { useIsAdmin, useSession } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Thane Connect" },
      { name: "description", content: "Moderate posts and student accounts on Thane Connect." },
      { property: "og:title", content: "Admin Dashboard | Thane Connect" },
      { property: "og:description", content: "Thane Connect moderation and analytics." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user } = useSession();
  const { data: isAdmin, isLoading: checkingRole } = useIsAdmin(user?.id);
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: posts } = useQuery({
    queryKey: ["admin-posts"],
    enabled: Boolean(isAdmin),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: students } = useQuery({
    queryKey: ["admin-students"],
    enabled: Boolean(isAdmin),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (checkingRole) {
    return <p className="mx-auto max-w-2xl p-10 text-muted-foreground">Checking permissions…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl p-10 text-center">
        <h1 className="text-2xl font-bold">Admins only</h1>
        <p className="mt-2 text-muted-foreground">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  const totals = CATEGORIES.map((category) => ({
    category,
    count: posts?.filter((post) => post.category === category).length ?? 0,
  }));
  const maxCount = Math.max(1, ...totals.map((item) => item.count));

  async function deletePost(id: string, imagePath: string | null) {
    setBusyId(id);
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      setBusyId(null);
      toast.error("Could not delete this post.");
      return;
    }
    if (imagePath) await supabase.storage.from("post-images").remove([imagePath]);
    await queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    setBusyId(null);
    toast.success("Post deleted");
  }

  async function toggleStudent(id: string, isActive: boolean) {
    setBusyId(id);
    const { error } = await supabase.from("profiles").update({ is_active: !isActive }).eq("id", id);
    setBusyId(null);
    if (error) {
      toast.error("Could not update this account.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    toast.success(isActive ? "Account disabled" : "Account enabled");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Admin dashboard</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Total posts" value={posts?.length ?? 0} />
        <Stat label="Registered students" value={students?.length ?? 0} />
        <Stat
          label="Disabled accounts"
          value={students?.filter((student) => !student.is_active).length ?? 0}
        />
      </div>

      <section className="surface-panel mt-8 p-6">
        <h2 className="text-lg font-semibold">Posts per category</h2>
        <ul className="mt-4 space-y-3">
          {totals.map((item) => (
            <li key={item.category} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm">{item.category}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm font-semibold tabular-nums">
                {item.count}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">All posts</h2>
        <ul className="mt-4 space-y-3">
          {posts?.map((post) => (
            <li
              key={post.id}
              className="surface-panel flex flex-wrap items-center gap-3 p-4 text-sm"
            >
              <CategoryBadge category={post.category} />
              <Link
                to="/posts/$id"
                params={{ id: post.id }}
                className="min-w-0 flex-1 truncate font-semibold hover:underline"
              >
                {post.title}
              </Link>
              <span className="text-xs text-muted-foreground">
                {post.author_name} · {formatDate(post.created_at)}
              </span>
              <button
                type="button"
                onClick={() => deletePost(post.id, post.image_url)}
                disabled={busyId === post.id}
                className="tap-target rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Student accounts</h2>
        <ul className="mt-4 space-y-3">
          {students?.map((student) => (
            <li
              key={student.id}
              className="surface-panel flex flex-wrap items-center gap-3 p-4 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {student.display_name}{" "}
                  <span className="font-normal text-muted-foreground">@{student.username}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {student.college_name} · {student.department_name}
                </p>
              </div>
              <span
                className={
                  student.is_active
                    ? "rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent"
                    : "rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive"
                }
              >
                {student.is_active ? "Active" : "Disabled"}
              </span>
              <button
                type="button"
                onClick={() => toggleStudent(student.id, student.is_active)}
                disabled={busyId === student.id}
                className="tap-target rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary disabled:opacity-50"
              >
                {student.is_active ? "Disable" : "Enable"}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-panel p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}
