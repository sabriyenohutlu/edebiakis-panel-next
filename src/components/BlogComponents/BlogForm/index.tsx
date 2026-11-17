// src/components/BlogComponents/BlogForm/index.tsx
"use client";

import RelatedSocialCard from "@/components/content/RelatedSocialCard";
import BlogFormHeader from "./BlogFormHeader";
import BlogContentSection from "./BlogContentSection";
import BlogCoverCard from "./BlogCoverCard";
import BlogTaxonomyCard from "./BlogTaxonomyCard";
import BlogSettingsCard from "./BlogSettingsCard";
import { useBlogForm, type BlogForm } from "./useBlogForm";

export function BlogFormLayout({ form }: { form: BlogForm }) {
  return (
    <div className="flex flex-col gap-5">
      <BlogFormHeader form={form} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
        <BlogContentSection form={form} />

        <aside className="flex flex-col gap-5">
          <BlogCoverCard form={form} />
          <BlogTaxonomyCard form={form} />
          <RelatedSocialCard
            options={form.options.social}
            value={form.values.socialPostIds}
            onChange={(v) => form.setField("socialPostIds", v)}
            disabled={form.busy}
          />
          <BlogSettingsCard form={form} />
        </aside>
      </div>
    </div>
  );
}

const AddBlogComponents = () => {
  const form = useBlogForm();
  return <BlogFormLayout form={form} />;
};

export default AddBlogComponents;