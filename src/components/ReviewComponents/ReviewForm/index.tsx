// src/components/ReviewComponents/ReviewForm/index.tsx
"use client";

import ReviewFormHeader from "./ReviewFormHeader";
import ReviewBookCard from "./ReviewBookCard";
import ReviewContentSection from "./ReviewContentSection";
import ReviewSidebar from "./ReviewSidebar";
import { useReviewForm, type ReviewForm } from "./useReviewForm";
import { BOOK_CONFIGS, type BookKind } from "../bookPostConfig";

export function ReviewFormLayout({ form }: { form: ReviewForm }) {
  return (
    <div className="flex flex-col gap-5">
      <ReviewFormHeader form={form} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div className="flex flex-col gap-5 min-w-0">
          <ReviewBookCard form={form} />
          <ReviewContentSection form={form} />
        </div>
        <ReviewSidebar form={form} />
      </div>
    </div>
  );
}

const AddBookPostComponents = ({ kind }: { kind: BookKind }) => {
  const form = useReviewForm({ config: BOOK_CONFIGS[kind] });
  return <ReviewFormLayout form={form} />;
};

export default AddBookPostComponents;