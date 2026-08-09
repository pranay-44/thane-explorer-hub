import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PostForm, optimizeImage, type PostFormValues } from "@/components/PostForm";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({
    meta: [
      { title: "Share a Place | Thane Connect" },
      {
        name: "description",
        content: "Publish a new Thane City place with photos, description and a map link.",
      },
      { property: "og:title", content: "Share a Place | Thane Connect" },
      {
        property: "og:description",
        content: "Add your favourite Thane spot to the community portal.",
      },
    ],
  }),
  component: CreatePost,
});

export async function uploadCover(userId: string, file: File) {
  const optimized = await optimizeImage(file);
  const path = `${userId}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, optimized, { contentType: "image/webp", upsert: false });
  if (error) throw error;
  return path;
}

function CreatePost() {
  const { user } = useSession();
  const { data: profile, isLoading } = useProfile(user?.id);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (isLoading || !profile) {
    return <p className="mx-auto max-w-2xl p-10 text-muted-foreground">Loading your profile…</p>;
  }

  async function handleSubmit(values: PostFormValues, file: File | null) {
    if (!user || !file || !profile) return;
    setSubmitting(true);
    try {
      const imagePath = await uploadCover(user.id, file);
      const { data, error } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          title: values.title,
          category: values.category,
          description: values.description,
          location_url: values.location_url || null,
          image_url: imagePath,
          author_name: profile.display_name,
          author_college: profile.college_name,
          author_department: profile.department_name,
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("Your place is live!");
      navigate({ to: "/posts/$id", params: { id: data.id } });
    } catch {
      toast.error("Could not publish your post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Share a place in Thane</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell fellow students what makes this spot worth the trip.
      </p>
      <PostForm
        student={{
          display_name: profile.display_name,
          college_name: profile.college_name,
          department_name: profile.department_name,
        }}
        submitLabel="Publish place"
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
