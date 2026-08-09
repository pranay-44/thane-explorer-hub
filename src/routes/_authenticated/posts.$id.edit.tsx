import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PostForm, type PostFormValues } from "@/components/PostForm";
import { supabase } from "@/integrations/supabase/client";
import { uploadCover } from "@/routes/_authenticated/create";
import type { Category } from "@/lib/categories";
import { useProfile, useSession } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/posts/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Place | Thane Connect" },
      { name: "description", content: "Update the details of a place you shared on Thane Connect." },
      { property: "og:title", content: "Edit Place | Thane Connect" },
      { property: "og:description", content: "Update your published Thane Connect place." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditPost,
});

function EditPost() {
  const { id } = Route.useParams();
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ["post-edit", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !profile) {
    return <p className="mx-auto max-w-2xl p-10 text-muted-foreground">Loading…</p>;
  }

  if (!post || post.author_id !== user?.id) {
    return (
      <p className="mx-auto max-w-2xl p-10 text-center text-muted-foreground">
        You can only edit posts you created.
      </p>
    );
  }

  async function handleSubmit(values: PostFormValues, file: File | null) {
    if (!user || !post) return;
    setSubmitting(true);
    try {
      let imagePath = post.image_url;
      if (file) imagePath = await uploadCover(user.id, file);

      const { error } = await supabase
        .from("posts")
        .update({
          title: values.title,
          category: values.category,
          description: values.description,
          location_url: values.location_url || null,
          image_url: imagePath,
        })
        .eq("id", post.id);
      if (error) throw error;

      if (file && post.image_url && post.image_url !== imagePath) {
        await supabase.storage.from("post-images").remove([post.image_url]);
      }

      toast.success("Post updated");
      navigate({ to: "/posts/$id", params: { id: post.id } });
    } catch {
      toast.error("Could not save your changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Edit place</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Leave the image field empty to keep the current cover photo.
      </p>
      <PostForm
        student={{
          display_name: profile.display_name,
          college_name: profile.college_name,
          department_name: profile.department_name,
        }}
        initial={{
          title: post.title,
          category: post.category as Category,
          description: post.description,
          location_url: post.location_url ?? "",
          image_url: post.image_url,
        }}
        submitLabel="Save changes"
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
