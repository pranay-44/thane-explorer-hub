import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { CATEGORIES, PAGE_SIZE } from "./categories";
import type { Database } from "@/integrations/supabase/types";

export type PostRow = Database["public"]["Tables"]["posts"]["Row"];

const POST_COLUMNS =
  "id, title, category, location_url, image_url, description, author_id, author_name, author_college, author_department, created_at";

function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

const listSchema = z.object({
  search: z.string().max(120).optional(),
  category: z.enum(CATEGORIES).optional(),
  page: z.number().int().min(1).max(500).default(1),
  limit: z.number().int().min(1).max(24).default(PAGE_SIZE),
});

export const listPosts = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => listSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const from = (data.page - 1) * data.limit;

    let query = supabase
      .from("posts")
      .select(POST_COLUMNS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + data.limit - 1);

    if (data.category) query = query.eq("category", data.category);
    if (data.search?.trim()) {
      const term = data.search.trim().replace(/[%,()]/g, " ");
      query = query.or(
        `title.ilike.%${term}%,description.ilike.%${term}%,author_name.ilike.%${term}%`,
      );
    }

    const { data: rows, count, error } = await query;
    if (error) {
      console.error("listPosts failed", error);
      throw new Error("Could not load places");
    }

    return {
      posts: (rows ?? []) as PostRow[],
      total: count ?? 0,
      page: data.page,
      pageCount: Math.max(1, Math.ceil((count ?? 0) / data.limit)),
    };
  });

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("posts")
      .select(POST_COLUMNS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) {
      console.error("getPost failed", error);
      throw new Error("Could not load this place");
    }
    return (row as PostRow | null) ?? null;
  });
