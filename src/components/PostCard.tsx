import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { CategoryBadge } from "./CategoryBadge";
import { formatDate, postImageSrc } from "@/lib/categories";
import { excerpt } from "@/lib/markdown";
import type { PostRow } from "@/lib/posts.functions";

export function PostCard({ post, eager = false }: { post: PostRow; eager?: boolean }) {
  return (
    <article className="surface-panel card-lift flex flex-col overflow-hidden">
      <Link
        to="/posts/$id"
        params={{ id: post.id }}
        className="block aspect-16/10 overflow-hidden bg-muted"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={postImageSrc(post.image_url, post.category)}
          alt=""
          width={1200}
          height={750}
          loading={eager ? "eager" : "lazy"}
          className="size-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <CategoryBadge category={post.category} className="self-start" />
        <h3 className="text-lg leading-snug font-semibold">
          <Link to="/posts/$id" params={{ id: post.id }} className="hover:text-accent">
            {post.title}
          </Link>
        </h3>
        <p className="text-xs text-muted-foreground">
          By {post.author_name} · {formatDate(post.created_at)}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {excerpt(post.description, 130)}
        </p>
        <Link
          to="/posts/$id"
          params={{ id: post.id }}
          className="tap-target mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:gap-2.5"
        >
          Read more <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
