import "./globals.css";
import { ReactNode } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import ApiStatus from "@/components/ApiStatus";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Oil Tenders Dashboard",
  description: "Dashboard conectado a FastAPI",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Set initial theme to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = stored || (systemDark ? 'dark' : 'light');
                  var root = document.documentElement;
                  if (theme === 'dark') {
                    root.classList.add('dark');
                  } else {
                    root.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <div className="min-h-screen bg-background text-foreground">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
              <h1 className="text-xl font-semibold whitespace-nowrap">Oil Tenders</h1>
              <div className="flex-1 flex justify-center">
                <Navbar />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <ApiStatus />
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}

