import FooterComponents from "@/components/FooterComponents/footerComponents";
import LeftPanel from "@/components/LeftPanel/leftPanel";
import NavbarComponents from "@/components/NavbarComponents/navbarComponents";
import PageHeader from "@/components/PageHeader/pageHeader";
import RightPanel from "@/components/RightPanel/rightPanel";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40">
      <NavbarComponents />
      <PageHeader />

            <div className="flex gap-3 items-start px-4 sm:px-6 -mt-5 pb-10 relative z-10 justify-center">
        {/* Sol panel — 1280px dışında */}
        <aside className="hidden xl:flex w-[200px] shrink-0 sticky top-4">
          <LeftPanel />
        </aside>

        {/* Merkez — 1280px korunuyor */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto w-full max-w-[1280px] px-3 -mt-5 pb-10 relative z-10">
            <div className="bg-background rounded-xl border shadow-sm min-h-[200px] p-6">
              {children}
            </div>
          </div>
        </main>

        {/* Sağ panel — 1280px dışında */}
        <aside className="hidden xl:flex w-[200px] shrink-0 sticky top-4">
          <RightPanel />
        </aside>
      </div>
    </div>
  );
}
