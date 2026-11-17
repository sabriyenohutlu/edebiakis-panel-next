export type BlogStatus = "published" | "draft" | "pending";

export type Blog = {
  id: number;
  title: string;
  author: string;
  authorInitials: string;
  category: string;
  date: string;
  status: BlogStatus;
};

export const blogData: Blog[] = [
  { id: 1,  title: "2024'ün En İyi 10 Türk Romanı",         author: "Elif S.",    authorInitials: "ES", category: "Edebiyat", date: "12 Oca 2025", status: "published" },
  { id: 2,  title: "Distopik Romanların Yükselişi",          author: "Can B.",     authorInitials: "CB", category: "Analiz",   date: "08 Oca 2025", status: "pending"   },
  { id: 3,  title: "Modern Türk Şiirinin Gelişimi",          author: "Ahmet Y.",   authorInitials: "AY", category: "Şiir",     date: "03 Oca 2025", status: "published" },
  { id: 4,  title: "Orhan Pamuk'un Anlatı Teknikleri",       author: "Zeynep K.",  authorInitials: "ZK", category: "İnceleme", date: "28 Ara 2024", status: "draft"     },
  { id: 5,  title: "Türk Edebiyatında Kadın Yazarlar",       author: "Mehmet D.",  authorInitials: "MD", category: "Edebiyat", date: "20 Ara 2024", status: "published" },
  { id: 6,  title: "Kafka'nın Türk Okuruyla Buluşması",      author: "Selin A.",   authorInitials: "SA", category: "Analiz",   date: "15 Ara 2024", status: "published" },
  { id: 7,  title: "Sesler ve Sessizlikler — Şiir Üzerine",  author: "Deniz K.",   authorInitials: "DK", category: "Şiir",     date: "10 Ara 2024", status: "draft"     },
  { id: 8,  title: "Tanpınar'ın Zaman Anlayışı",             author: "Elif S.",    authorInitials: "ES", category: "İnceleme", date: "05 Ara 2024", status: "published" },
  { id: 9,  title: "Postmodern Roman ve Türk Edebiyatı",     author: "Can B.",     authorInitials: "CB", category: "Edebiyat", date: "01 Ara 2024", status: "pending"   },
  { id: 10, title: "Hikaye Yazımında Karakter Geliştirme",   author: "Ahmet Y.",   authorInitials: "AY", category: "Rehber",   date: "25 Kas 2024", status: "published" },
  { id: 11, title: "Türk Şiirinde İmge Kullanımı",           author: "Zeynep K.",  authorInitials: "ZK", category: "Şiir",     date: "20 Kas 2024", status: "published" },
  { id: 12, title: "Edebiyat Eleştirisine Giriş",            author: "Mehmet D.",  authorInitials: "MD", category: "Rehber",   date: "15 Kas 2024", status: "draft"     },
];