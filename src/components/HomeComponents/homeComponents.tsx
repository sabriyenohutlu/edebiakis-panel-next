import { AlertCircle, BookOpen, Clock, Feather, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const stats = [
  { label: "Toplam İçerik", value: 237, sub: "+12 bu ay eklendi", trend: "up" },
  { label: "Yayınlanan", value: 189, sub: "+8 geçen haftaya göre", trend: "up" },
  { label: "Taslak", value: 31, sub: "-3 geçen haftaya göre", trend: "down" },
  { label: "Okunmamış Mesaj", value: 5, sub: "yanıt bekliyor", trend: "warn" },
];

const recentContent = [
  { title: "Kafka'nın Dönüşüm'ünde Yabancılaşma Teması", category: "Roman İncelemesi", author: "Ahmet Y.", status: "published" },
  { title: "Sessiz Ev — Orhan Pamuk İncelemesi", category: "Roman İncelemesi", author: "Zeynep K.", status: "draft" },
  { title: "Sonbahar Şiirleri Antolojisi", category: "Şiir", author: "Mehmet D.", status: "published" },
  { title: "2024'ün En İyi 10 Türk Romanı", category: "Blog", author: "Elif S.", status: "published" },
  { title: "Distopik Romanların Yükselişi", category: "Blog", author: "Can B.", status: "pending" },
];

const categories = [
  { name: "Şiir", count: 134, max: 134, color: "bg-emerald-500" },
  { name: "Roman İnceleme", count: 89, max: 134, color: "bg-violet-500" },
  { name: "Blog", count: 48, max: 134, color: "bg-blue-500" },
  { name: "Roman Öneri", count: 17, max: 134, color: "bg-amber-500" },
];

const messages = [
  { initials: "AY", name: "Ayşe Yılmaz", text: "İnceleme yazısında bir düzeltme yapabilir misiniz?", time: "14:32", color: "bg-blue-100 text-blue-700" },
  { initials: "MK", name: "Murat Kaya", text: "Yeni şiir serim için kategori açılabilir mi?", time: "11:05", color: "bg-pink-100 text-pink-700" },
  { initials: "ZD", name: "Zehra Demir", text: "Teşekkürler, yazı yayınlandı mı?", time: "Dün", color: "bg-emerald-100 text-emerald-700" },
];

const activities = [
  { text: "Kafka İncelemesi yayına alındı", time: "Bugün, 15:42", color: "bg-emerald-500" },
  { text: "Sonbahar Şiirleri kategoriye eklendi", time: "Bugün, 13:10", color: "bg-blue-500" },
  { text: "Distopik Romanlar taslağa alındı", time: "Dün, 18:55", color: "bg-amber-500" },
  { text: "Yeni kategori oluşturuldu: Deneme", time: "Dün, 11:20", color: "bg-violet-500" },
  { text: "3 mesaj okunmadı olarak işaretlendi", time: "2 gün önce", color: "bg-red-500" },
];

const quickLinks = [
  { label: "Blog Ekle", sub: "Yeni yazı", href: "/icerik-yonetimi/edebiyat-yazilari/tum-yazilar/yazi-ekle", icon: FileText, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
  { label: "Şiir Ekle", sub: "Yeni şiir", href: "/icerik-yonetimi/siirler/siir-ekle", icon: Feather, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { label: "İnceleme Ekle", sub: "Roman inceleme", href: "/icerik-yonetimi/roman/inceleme/inceleme-ekle", icon: BookOpen, iconBg: "bg-orange-50", iconColor: "text-orange-600" },
  { label: "Mesajlar", sub: "5 okunmamış", href: "/icerik-yonetimi/mesajlar", icon: MessageSquare, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
];

// ——— Helpers ———

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  published: { label: "Yayında", variant: "default" },
  draft:     { label: "Taslak",  variant: "secondary" },
  pending:   { label: "Beklemede", variant: "destructive" },
};

const HomeComponents = () => {
   return (
    <div className="flex flex-col gap-4">

      {/* Metrik kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {s.label}
              </p>
              <p className="text-3xl font-semibold tabular-nums">{s.value}</p>
              <p className={`text-xs mt-1.5 flex items-center gap-1 ${
                s.trend === "up" ? "text-emerald-600" :
                s.trend === "down" ? "text-red-500" :
                "text-amber-600"
              }`}>
                {s.trend === "warn" && <AlertCircle className="w-3 h-3" />}
                {s.trend === "up" && <TrendingUp className="w-3 h-3" />}
                {s.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orta satır */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Son içerikler */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Son Eklenen İçerikler</CardTitle>
              <Link href="/icerik-yonetimi/bloglar" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Tümünü gör →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col divide-y">
              {recentContent.map((item) => (
                <div key={item.title} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.category} · {item.author}</p>
                  </div>
                  <Badge variant={statusMap[item.status].variant} className="shrink-0 text-[10px]">
                    {statusMap[item.status].label}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sağ kolon */}
        <div className="flex flex-col gap-4">

          {/* Kategori dağılımı */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Kategori Dağılımı</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex flex-col gap-3">
              {categories.map((cat) => (
                <div key={cat.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{cat.name}</span>
                    <span className="font-medium tabular-nums">{cat.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cat.color}`}
                      style={{ width: `${Math.round((cat.count / cat.max) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Son mesajlar */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Son Mesajlar</CardTitle>
                <Link href="/icerik-yonetimi/mesajlar" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Tümü →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col divide-y">
                {messages.map((msg) => (
                  <div key={msg.name} className="flex gap-2.5 py-2.5 first:pt-0 last:pb-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 ${msg.color}`}>
                      {msg.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-medium">{msg.name}</span>
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Alt satır */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Aktiviteler */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col divide-y">
              {activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.color}`} />
                  <div>
                    <p className="text-sm">{act.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{act.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hızlı erişim */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Hızlı Erişim</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${link.iconBg}`}>
                    <link.icon className={`w-4 h-4 ${link.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{link.label}</p>
                    <p className="text-[10px] text-muted-foreground">{link.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default HomeComponents