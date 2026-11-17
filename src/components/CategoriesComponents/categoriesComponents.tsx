import React from 'react'
import CategoryiesTable from './categoriesTable';
import { categoryData } from '@/apilib/mockData/category.data';
const stats = [
  {
    label: "Toplam Kategori",
    value: categoryData.length,
    sub: `${categoryData.filter((c) => !c.parent_id).length} ana · ${categoryData.filter((c) => c.parent_id).length} alt`,
  },
  {
    label: "Post Type",
    value: new Set(categoryData.map((c) => c.post_type)).size,
    sub: "novel, poetry, blog...",
  },
  {
    label: "İçerik Sayısı",
    value: categoryData.filter((c) => !c.parent_id).reduce((a, c) => a + c.contentCount, 0),
    sub: "tüm kategorilerde",
  },
];
const CategoriesComponents = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-muted/50 rounded-lg p-3.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">
              {s.label}
            </p>
            <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      <CategoryiesTable />
    </div>
  )
}

export default CategoriesComponents