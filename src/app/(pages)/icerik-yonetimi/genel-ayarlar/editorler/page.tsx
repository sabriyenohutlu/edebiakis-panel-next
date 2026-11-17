import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/apilib/utils";

const editorler = [
  { id: 1, name: "Elif Şahin",   initials: "ES", email: "elif@edebiakis.com",  role: "Editör",       color: "bg-violet-100 text-violet-700", hedefTamamlanan: 4, hedefToplam: 6,  yaziSayisi: 12 },
  { id: 2, name: "Can Bulut",    initials: "CB", email: "can@edebiakis.com",   role: "Editör",       color: "bg-amber-100 text-amber-700",   hedefTamamlanan: 2, hedefToplam: 5,  yaziSayisi: 8  },
  { id: 3, name: "Ahmet Yılmaz", initials: "AY", email: "ahmet@edebiakis.com", role: "Kıdemli Editör", color: "bg-emerald-100 text-emerald-700", hedefTamamlanan: 6, hedefToplam: 6, yaziSayisi: 24 },
  { id: 4, name: "Zeynep Kaya",  initials: "ZK", email: "zeynep@edebiakis.com", role: "Editör",      color: "bg-pink-100 text-pink-700",     hedefTamamlanan: 1, hedefToplam: 4,  yaziSayisi: 6  },
  { id: 5, name: "Mehmet Demir", initials: "MD", email: "mehmet@edebiakis.com", role: "Stajyer",     color: "bg-blue-100 text-blue-700",     hedefTamamlanan: 0, hedefToplam: 2,  yaziSayisi: 2  },
];

const EditorsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-lg p-3.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">Toplam Editör</p>
          <p className="text-2xl font-semibold">5</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">Aktif Hedef</p>
          <p className="text-2xl font-semibold">23</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">Bu Ay Yazı</p>
          <p className="text-2xl font-semibold">52</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {editorler.map((editor) => {
          const percent = Math.round((editor.hedefTamamlanan / editor.hedefToplam) * 100);
          return (
            <Link key={editor.id} href={`/icerik-yonetimi/genel-ayarlar/editorler/${editor.id}`}>
              <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">

                    {/* Sol — avatar + bilgi */}
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
                        editor.color
                      )}>
                        {editor.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{editor.name}</p>
                        <p className="text-xs text-muted-foreground">{editor.email}</p>
                      </div>
                    </div>

                    {/* Orta — hedef ilerleme */}
                    <div className="flex-1 max-w-xs">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Hedef İlerlemesi</span>
                        <span className="font-medium tabular-nums">
                          {editor.hedefTamamlanan}/{editor.hedefToplam}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Sağ */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">{editor.yaziSayisi}</p>
                        <p className="text-[10px] text-muted-foreground">yazı</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{editor.role}</Badge>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default EditorsPage