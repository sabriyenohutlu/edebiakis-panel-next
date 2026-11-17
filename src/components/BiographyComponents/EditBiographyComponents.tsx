// src/components/BiographyComponents/EditBiographyComponents.tsx
"use client";

import PostEditLoader from "@/components/content/PostEditLoader";
import type { Post } from "@/types/post";
import { BiographyFormLayout } from "./BiographyForm";
import { BIOGRAPHY_ROUTES, useBiographyForm } from "./useBiographyForm";

function EditForm({ post }: { post: Post }) {
  const form = useBiographyForm({ post });
  return <BiographyFormLayout form={form} />;
}

export default function EditBiographyComponents() {
  return (
    <PostEditLoader postType="biography" listUrl={BIOGRAPHY_ROUTES.list} notFoundText="Biyografi bulunamadı.">
      {(post) => <EditForm key={post.id} post={post} />}
    </PostEditLoader>
  );
}