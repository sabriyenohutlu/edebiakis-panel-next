import { BlogStatus } from "@/apilib/mockData/blog.data";

export const statusConfig: Record<BlogStatus, { label: string; color: string }> = {
  published: { label: "Yayında",   color: "green"  },
  draft:     { label: "Taslak",    color: "gray"   },
  pending:   { label: "Beklemede", color: "yellow" },
};
export const avatarColors: Record<string, string> = {
  ES: "bg-violet-100 text-violet-700",
  CB: "bg-amber-100 text-amber-700",
  AY: "bg-emerald-100 text-emerald-700",
  ZK: "bg-pink-100 text-pink-700",
  MD: "bg-blue-100 text-blue-700",
  SA: "bg-orange-100 text-orange-700",
  DK: "bg-teal-100 text-teal-700",
};