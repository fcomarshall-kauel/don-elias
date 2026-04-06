import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/providers/DataProvider";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PorterOS",
  description: "Sistema de gestión para conserjes de edificios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e3a5f" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            if (!navigator.onLine) {
              document.addEventListener('DOMContentLoaded', function() {
                var b = document.createElement('div');
                b.id = 'offline-banner-static';
                b.style.cssText = 'background:#334155;color:white;padding:8px 16px;text-align:center;font-size:14px;font-family:system-ui,sans-serif;';
                b.textContent = 'Sin conexion — modo offline. Por favor verifique conexion WiFi.';
                document.body.insertBefore(b, document.body.firstChild);
              });
            }
            window.addEventListener('online', function() {
              var b = document.getElementById('offline-banner-static');
              if (b) b.remove();
            });
          })();
        `}} />
      </head>
      <body style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
        <DataProvider>
          <ServiceWorkerRegistrar />
          <OfflineIndicator />
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
