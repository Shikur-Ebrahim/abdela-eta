import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "አብደላ የመኪና እጣ | Abdela Car Lottery",
  description: "Ethiopia's premier auto lottery experience. Win your dream car today!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 flex flex-col font-sans">
        <LanguageProvider>
          <div className="flex-1 w-full flex flex-col">{children}</div>
        </LanguageProvider>
      </body>
    </html>
  );
}
