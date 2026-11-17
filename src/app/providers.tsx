"use client";

import { ThemeProvider } from "next-themes";
import { MantineProvider } from "@mantine/core";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <MantineProvider
        theme={{ fontFamily: "var(--font-sans)" }}
        withGlobalStyles
      >
        {children}
      </MantineProvider>
    </ThemeProvider>
  );
}
