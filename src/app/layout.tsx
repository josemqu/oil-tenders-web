import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Oil Tenders Dashboard",
  description: "Dashboard conectado a FastAPI",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <div className="min-h-screen bg-background text-foreground">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-xl font-semibold">Oil Tenders</h1>
            </div>
          </header>
          <main className="container mx-auto px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
