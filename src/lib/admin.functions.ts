import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { studentIdToEmail } from "./auth-constants";

const genSchema = z.object({
  count: z.number().int().min(1).max(300),
  prefix: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z]{2,12}$/, "Prefix must be 2-12 lowercase letters"),
});

/** Cryptographically random password, no ambiguous characters (0/O, 1/l/I). */
function randomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => chars[n % chars.length]).join("");
}

/**
 * Admin-only. Creates N new student accounts directly via the Supabase Admin API
 * (bypassing the self-signup flow entirely) and returns the plaintext passwords
 * ONCE — Supabase never stores or shows them again after this.
 */
export const generateStudentIds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => genSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Confirm the caller is actually an admin (bypass-RLS client, so this check
    // is the only thing standing between "anyone with a token" and account creation).
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      throw new Error("Only admins can generate student accounts");
    }

    // Find the highest existing number for this prefix so new IDs never collide
    // with ones generated in an earlier batch.
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .ilike("username", `${data.prefix}%`);

    let maxNumber = 0;
    const pattern = new RegExp(`^${data.prefix}(\\d+)$`, "i");
    for (const row of existing ?? []) {
      const match = row.username.match(pattern);
      if (match) maxNumber = Math.max(maxNumber, parseInt(match[1], 10));
    }

    const created: { studentId: string; password: string }[] = [];
    const failed: string[] = [];

    for (let i = 1; i <= data.count; i++) {
      const number = String(maxNumber + i).padStart(3, "0");
      const studentId = `${data.prefix}${number}`;
      const password = randomPassword();

      const { error } = await supabaseAdmin.auth.admin.createUser({
        email: studentIdToEmail(studentId),
        password,
        email_confirm: true,
        user_metadata: {
          username: studentId,
          display_name: studentId,
          college_name: "SP College",
          department_name: "General",
        },
      });

      if (error) {
        failed.push(`${studentId}: ${error.message}`);
        continue;
      }
      created.push({ studentId, password });
    }

    return { created, failed };
  });