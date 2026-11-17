"use client";

import { useState } from "react";
import { Plus, Trash2, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/apilib/utils";
const editorData = {
  id: 1,
  name: "Elif Şahin",
  initials: "ES",
  email: "elif@edebiakis.com",
  role: "Editör",
  color: "bg-violet-100 text-violet-700",
  hedefler: [
    { id: 1, label: "Blog",      current: 4, target: 6,  color: "bg-violet-500" },
    { id: 2, label: "Şiir",      current: 8, target: 10, color: "bg-emerald-500" },
    { id: 3, label: "İnceleme",  current: 2, target: 4,  color: "bg-blue-500" },
  ],
  notlar: [
    { id: 1, text: "Pamuk incelemesi için kaynak bul",   tarih: "09 Nis 2025" },
    { id: 2, text: "Şiir kategorisine alt başlık ekle",  tarih: "08 Nis 2025" },
    { id: 3, text: "Editör toplantısı Cuma 14:00",       tarih: "07 Nis 2025" },
  ],
};

export default function EditorDetayPage() {
  const [hedefler, setHedefler] = useState(editorData.hedefler);
  const [notlar, setNotlar] = useState(editorData.notlar);
  const [hedefLabel, setHedefLabel] = useState("");
  const [hedefTarget, setHedefTarget] = useState("");
  const [notText, setNotText] = useState("");

  const addHedef = () => {
    if (!hedefLabel.trim() || !hedefTarget.trim()) return;
    setHedefler((prev) => [...prev, {
      id: Date.now(),
      label: hedefLabel.trim(),
      current: 0,
      target: parseInt(hedefTarget),
      color: "bg-violet-500",
    }]);
    setHedefLabel("");
    setHedefTarget("");
  };

  const removeHedef = (id: number) =>
    setHedefler((prev) => prev.filter((h) => h.id !== id));

  const addNot = () => {
    if (!notText.trim()) return;
    setNotlar((prev) => [...prev, {
      id: Date.now(),
      text: notText.trim(),
      tarih: new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" }),
    }]);
    setNotText("");
  };

  const removeNot = (id: number) =>
    setNotlar((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="flex flex-col gap-5">

      {/* Editör başlık */}
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-semibold", editorData.color)}>
          {editorData.initials}
        </div>
        <div>
          <h2 className="text-base font-semibold">{editorData.name}</h2>
          <p className="text-xs text-muted-foreground">{editorData.email}</p>
        </div>
        <Badge variant="outline" className="ml-auto text-xs">{editorData.role}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">

        {/* Hedefler */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Yazı Hedefleri
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">

            {/* Mevcut hedefler */}
            <div className="flex flex-col gap-3">
              {hedefler.map((h) => (
                <div key={h.id} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium">{h.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground tabular-nums">{h.current}/{h.target}</span>
                      <button
                        onClick={() => removeHedef(h.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", h.color)}
                      style={{ width: `${Math.round((h.current / h.target) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Yeni hedef ekle */}
            <div className="flex flex-col gap-2 pt-2 border-t">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Hedef Ekle
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Kategori adı"
                  value={hedefLabel}
                  onChange={(e) => setHedefLabel(e.target.value)}
                  className="h-8 text-xs flex-1"
                />
                <Input
                  placeholder="Hedef"
                  type="number"
                  value={hedefTarget}
                  onChange={(e) => setHedefTarget(e.target.value)}
                  className="h-8 text-xs w-20"
                />
                <Button size="sm" className="h-8 px-3" onClick={addHedef}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Notlar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Notlar</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">

            {/* Mevcut notlar */}
            <div className="flex flex-col divide-y">
              {notlar.map((n) => (
                <div key={n.id} className="flex items-start justify-between gap-2 py-2 first:pt-0">
                  <div>
                    <p className="text-xs leading-snug">{n.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{n.tarih}</p>
                  </div>
                  <button
                    onClick={() => removeNot(n.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Yeni not ekle */}
            <div className="flex gap-2 pt-2 border-t">
              <Input
                placeholder="Not ekle..."
                value={notText}
                onChange={(e) => setNotText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNot()}
                className="h-8 text-xs flex-1"
              />
              <Button size="sm" className="h-8 px-3" onClick={addNot}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}