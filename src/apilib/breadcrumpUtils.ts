import { navbarItems, routeLabels } from "@/config/navbar.config";

export function getBreadcrumbs(pathname: string) {
  const allItems = navbarItems.flatMap((item) => [
    { url: item.url, title: item.breadcrumpTitle ?? item.title },
    ...(item.nest ?? []).map((sub) => ({
      url: sub.url,
      title: sub.breadcrumpTitle ?? sub.title,
    })),
  ]);

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { title: string; url: string }[] = [];
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;

    // Önce navbarItems'a bak, sonra routeLabels'a, son çare URL slug'ı
    const fromNav = allItems.find((i) => i.url === currentPath);
    const fromMap = routeLabels[currentPath];

    const title = fromNav?.title || fromMap || segment
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    crumbs.push({ title, url: currentPath });
  }

  return crumbs;
}

export function getActiveMeta(pathname: string) {
  for (const item of navbarItems) {
    if (item.url === pathname) return item.meta;
    if (item.nest?.some((s) => s.url === pathname)) return item.meta;
  }
  return undefined;
}

export function getAddUrl(pathname: string) {
  const parent = navbarItems.find(
    (item) =>
      item.url === pathname || item.nest?.some((s) => s.url === pathname),
  );
  return (
    parent?.nest?.find((s) => s.title.toLowerCase().includes("ekle"))?.url ??
    null
  );
}

export function getAddLabel(pathname: string) {
  const parent = navbarItems.find(
    (item) =>
      item.url === pathname || item.nest?.some((s) => s.url === pathname),
  );
  return (
    parent?.nest?.find((s) => s.title.toLowerCase().includes("ekle"))?.title ??
    null
  );
}
