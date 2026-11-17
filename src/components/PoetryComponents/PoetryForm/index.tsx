// src/components/PoetryComponents/PoetryForm/index.tsx
"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostFormHeader from "@/components/content/PostFormHeader";
import PoetryContentSection from "./PoetryContentSection";
import PoetrySidebar from "./PoetrySidebar";
import { POETRY_ROUTES, usePoetryForm, type PoetryForm } from "./usePoetryForm";

export function PoetryFormLayout({ form }: { form: PoetryForm }) {
  const isEdit = form.mode === "edit";

  return (
    <div className="flex flex-col gap-5">
      <PostFormHeader
        breadcrumb={`Şiirler › ${isEdit ? "Düzenle" : "Yeni Şiir"}`}
        title={isEdit ? form.post?.title || "Şiiri Düzenle" : "Yeni Şiir"}
        status={form.post?.status}
        saving={form.saving}
        deleting={form.deleting}
        busy={form.busy}
        uploadProgress={form.uploadProgress}
        submitError={form.submitError}
        onSubmit={form.submit}
        onCancel={form.cancel}
        onDelete={isEdit ? form.remove : undefined}
        deleteTitle="Şiiri sil"
        deleteDescription={<><strong>{form.post?.title}</strong> kalıcı olarak silinecek.</>}
        extra={
          isEdit && (
            <Button variant="ghost" size="sm" className="gap-1.5" asChild>
              <Link href={POETRY_ROUTES.detail(form.postId)}>
                <Eye className="w-3.5 h-3.5" />
                Görüntüle
              </Link>
            </Button>
          )
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
        <PoetryContentSection form={form} />
        <PoetrySidebar form={form} />
      </div>
    </div>
  );
}

const AddPoetryComponents = () => {
  const form = usePoetryForm();
  return <PoetryFormLayout form={form} />;
};

export default AddPoetryComponents;