import { cn } from "@/apilib/utils";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";

const goals = [
  { label: "Blog", current: 4, target: 6, color: "bg-violet-500" },
  { label: "Şiir", current: 8, target: 10, color: "bg-emerald-500" },
  { label: "İnceleme", current: 2, target: 4, color: "bg-blue-500" },
  { label: "Öneri", current: 3, target: 3, color: "bg-emerald-500" },
];

const drafts = [
  {
    title: "Sessiz Ev İncelemesi",
    category: "Roman",
    ago: "3 gün önce",
    href: "/icerik-yonetimi/roman/inceleme",
  },
  {
    title: "Distopik Romanlar",
    category: "Blog",
    ago: "5 gün önce",
    href: "/icerik-yonetimi/edebiyat-yazilari/tum-yazilar",
  },
  {
    title: "Kış Şiirleri",
    category: "Şiir",
    ago: "1 hafta önce",
    href: "/icerik-yonetimi/siirler",
  },
];

const totalCurrent = goals.reduce((a, g) => a + g.current, 0);
const totalTarget = goals.reduce((a, g) => a + g.target, 0);
const percent = Math.round((totalCurrent / totalTarget) * 100);
const circumference = 2 * Math.PI * 28;
const offset = circumference - (percent / 100) * circumference;

const LeftPanel = () => {
  return (
    <Card className="w-full flex flex-col gap-5 p-4 overflow-y-auto sticky top-14 h-[calc(100vh-56px)]">
      <CardContent className="flex flex-col gap-4">
        {/* Aylık ilerleme */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-3">
            Bu Ayın Hedefleri
          </p>
          <div className="flex flex-col items-center gap-1 py-1">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r="28"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="6"
              />
              <circle
                cx="36"
                cy="36"
                r="28"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
              />
            </svg>
            <div className="flex flex-col items-center -mt-[52px] mb-[52px]">
              <span className="text-xl font-semibold tabular-nums">
                {percent}%
              </span>
              <span className="text-[10px] text-muted-foreground">
                tamamlandı
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Yazı hedefleri */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-3">
            Yazı Hedefleri
          </p>
          <div className="flex flex-col gap-3">
            {goals.map((g) => (
              <div key={g.label} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{g.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {g.current} / {g.target}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      g.color,
                    )}
                    style={{
                      width: `${Math.round((g.current / g.target) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Taslaklar */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-3">
            Taslaklar
          </p>
          <div className="flex flex-col gap-1.5">
            {drafts.map((d) => (
              <Link
                key={d.title}
                href={d.href}
                className="flex flex-col gap-0.5 px-2.5 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-xs font-medium truncate">{d.title}</span>
                <span className="text-[10px] text-muted-foreground">
                  {d.category} · {d.ago}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default LeftPanel;
