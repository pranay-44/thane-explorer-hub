import { useEffect, useRef, useState } from "react";
import { z } from "zod";

import { CATEGORIES, postImageSrc } from "@/lib/categories";
import type { Category } from "@/lib/categories";
import { cn } from "@/lib/utils";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be 100 characters or fewer"),
  category: z.enum(CATEGORIES, { message: "Choose a category" }),
  location_url: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        /^https:\/\/([a-z0-9-]+\.)*(google\.[a-z.]+\/maps|goo\.gl\/maps|maps\.app\.goo\.gl)/i.test(
          value,
        ),
      "Enter a valid Google Maps link (https://www.google.com/maps/...)",
    ),
  description: z
    .string()
    .trim()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must be 2000 characters or fewer"),
});

export type PostFormValues = z.infer<typeof postSchema>;

export type StudentInfo = {
  display_name: string;
  college_name: string;
  department_name: string;
};

/** Validates magic bytes so a renamed script can't pass as an image. */
async function hasImageSignature(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const isPng =
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;
  return isPng || isJpeg || isWebp;
}

/** Resizes and re-encodes to WebP in the browser to keep covers small. */
export async function optimizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.8),
  );
  return blob ?? file;
}

type Props = {
  student: StudentInfo;
  initial?: PostFormValues & { image_url: string | null };
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: PostFormValues, imageFile: File | null) => void;
};

export function PostForm({ student, initial, submitLabel, submitting, onSubmit }: Props) {
  const [values, setValues] = useState<PostFormValues>(
    initial ?? { title: "", category: "" as Category, location_url: "", description: "" },
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initial ? postImageSrc(initial.image_url, initial.category) : null,
  );
  const previewUrl = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    },
    [],
  );

  const parsed = postSchema.safeParse(values);
  const fieldErrors: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
  }
  const imageRequired = !initial && !file;
  const isValid = parsed.success && !imageRequired && !errors["image"];

  function update<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFile(selected: File | undefined) {
    setErrors((prev) => ({ ...prev, image: undefined }));
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setErrors((prev) => ({ ...prev, image: "Use a PNG, JPEG or WebP image" }));
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({ ...prev, image: "Image must be 5 MB or smaller" }));
      return;
    }
    if (!(await hasImageSignature(selected))) {
      setErrors((prev) => ({ ...prev, image: "That file isn't a valid image" }));
      return;
    }

    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    const url = URL.createObjectURL(selected);
    previewUrl.current = url;
    setPreview(url);
    setFile(selected);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched({
      title: true,
      category: true,
      location_url: true,
      description: true,
      image: true,
    });
    if (!parsed.success || imageRequired) return;
    onSubmit(parsed.data, file);
  }

  const show = (key: string) => (touched[key] ? fieldErrors[key] : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Field
          label="Title"
          htmlFor="title"
          error={show("title")}
          hint={`${values.title.length}/100`}
        >
          <input
            id="title"
            value={values.title}
            maxLength={100}
            onChange={(event) => update("title", event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
            className={inputClass(show("title"))}
            aria-invalid={Boolean(show("title"))}
          />
        </Field>

        <Field label="Category" htmlFor="category" error={show("category")}>
          <select
            id="category"
            value={values.category}
            onChange={(event) => update("category", event.target.value as Category)}
            onBlur={() => setTouched((prev) => ({ ...prev, category: true }))}
            className={inputClass(show("category"))}
            aria-invalid={Boolean(show("category"))}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Google Maps URL"
          htmlFor="location_url"
          error={show("location_url")}
          hint="Optional but recommended"
        >
          <input
            id="location_url"
            type="url"
            inputMode="url"
            placeholder="https://www.google.com/maps/place/..."
            value={values.location_url}
            onChange={(event) => update("location_url", event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, location_url: true }))}
            className={inputClass(show("location_url"))}
            aria-invalid={Boolean(show("location_url"))}
          />
        </Field>

        <Field
          label="Description"
          htmlFor="description"
          error={show("description")}
          hint={`${values.description.length}/2000 · **bold**, *italic*, [links](https://...)`}
        >
          <textarea
            id="description"
            rows={10}
            maxLength={2000}
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
            className={inputClass(show("description"))}
            aria-invalid={Boolean(show("description"))}
          />
        </Field>
      </div>

      <div className="space-y-6">
        <Field
          label="Cover image"
          htmlFor="image"
          error={touched["image"] || errors["image"] ? (errors["image"] ?? (imageRequired ? "Add a cover image" : undefined)) : errors["image"]}
          hint="PNG, JPEG or WebP · max 5 MB"
        >
          <input
            id="image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => handleFile(event.target.files?.[0])}
            className="tap-target w-full rounded-xl border border-input bg-card px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
        </Field>

        {preview && (
          <img
            src={preview}
            alt="Cover image preview"
            className="aspect-16/10 w-full rounded-xl object-cover shadow-card"
          />
        )}

        <div className="surface-panel space-y-3 p-5">
          <h2 className="text-sm font-semibold">Student information</h2>
          <ReadOnly label="Student name" value={student.display_name} />
          <ReadOnly label="College" value={student.college_name} />
          <ReadOnly label="Department" value={student.department_name} />
          <p className="text-xs text-muted-foreground">
            These come from your account and can't be edited here.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || !isValid}
          className="tap-target w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Publishing..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function inputClass(error?: string) {
  return cn(
    "tap-target w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none focus:border-accent",
    error ? "border-destructive" : "border-input",
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
