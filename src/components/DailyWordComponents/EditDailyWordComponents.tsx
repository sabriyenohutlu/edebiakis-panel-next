// src/components/DailyWordComponents/EditDailyWordComponents.tsx
"use client";

import PostEditLoader from "@/components/content/PostEditLoader";
import type { Post } from "@/types/post";
import { DailyWordFormLayout } from "./DailyWordForm";
import { DAILY_WORD_ROUTES, useDailyWordForm } from "./useDailyWordForm";

function EditForm({ post }: { post: Post }) {
  const form = useDailyWordForm({ post });
  return <DailyWordFormLayout form={form} />;
}

export default function EditDailyWordComponents() {
  return (
    <PostEditLoader postType="dailyword" listUrl={DAILY_WORD_ROUTES.list} notFoundText="Söz bulunamadı.">
      {(post) => <EditForm key={post.id} post={post} />}
    </PostEditLoader>
  );
}