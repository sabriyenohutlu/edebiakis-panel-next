"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const notifications = [
  {
    text: "Distopik Romanlar onay bekliyor",
    time: "14:32",
    color: "bg-red-500",
  },
  { text: "Ayşe Yılmaz mesaj gönderdi", time: "11:05", color: "bg-amber-500" },
  {
    text: "Kafka İncelemesi yayına alındı",
    time: "09:41",
    color: "bg-emerald-500",
  },
  { text: "Yeni yorum: Şiir Antolojisi", time: "Dün", color: "bg-blue-500" },
];

const initialNotes = [
  { text: "Pamuk incelemesi için kaynak bul", color: "bg-violet-500" },
  { text: "Şiir kategorisine alt başlık ekle", color: "bg-violet-500" },
  { text: "Editör toplantısı Cuma 14:00", color: "bg-emerald-500" },
  { text: "Blog görselleri güncellenmeli", color: "bg-amber-500" },
];

const RightPanel = () => {
  const [notes, setNotes] = useState(initialNotes);
  const [input, setInput] = useState("");

  const addNote = () => {
    if (!input.trim()) return;
    setNotes((prev) => [
      ...prev,
      { text: input.trim(), color: "bg-violet-500" },
    ]);
    setInput("");
  };

  return (
    <Card className="w-full flex flex-col gap-5 p-4 overflow-y-auto sticky top-14 h-[calc(100vh-56px)]">
      <CardContent className="flex flex-col gap-4">
        {/* Bildirimler */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-3">
            Bildirimler
          </p>
          <div className="flex flex-col divide-y">
            {notifications.map((n, i) => (
              <div key={i} className="flex gap-2.5 py-2 first:pt-0 last:pb-0">
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.color}`}
                />
                <div>
                  <p className="text-xs leading-snug">{n.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {n.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Notlar */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-3">
            Notlarım
          </p>
          <div className="flex flex-col divide-y">
            {notes.map((n, i) => (
              <div key={i} className="flex gap-2 py-2 first:pt-0">
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.color}`}
                />
                <p className="text-xs leading-snug">{n.text}</p>
              </div>
            ))}
          </div>

          {/* Not ekle */}
          {/* <div className="flex gap-1.5 mt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
            placeholder="Not ekle..."
            className="flex-1 h-7 text-xs px-2 rounded-md bg-muted border border-border outline-none focus:border-foreground/30 transition-colors placeholder:text-muted-foreground"
          />
          <button
            onClick={addNote}
            className="w-7 h-7 rounded-md bg-muted border border-border flex items-center justify-center hover:bg-accent transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div> */}
        </div>
      </CardContent>
    </Card>
  );
};
export default RightPanel;
