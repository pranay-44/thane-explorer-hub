import { createFileRoute } from "@tanstack/react-router";

/**
 * Public proxy for cover images stored in the private post-images bucket.
 * Keeps uploads private-by-default while letting anyone view published covers.
 */
export const Route = createFileRoute("/api/public/post-image/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = params._splat ?? "";
        if (!key || key.includes("..") || key.startsWith("/")) {
          return new Response("Invalid path", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage
          .from("post-images")
          .download(key);

        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "image/webp",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
