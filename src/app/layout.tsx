import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Bayaan Sales OS",
  description: "Internal Sales & Commission Operating System — Bayaan Institute",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white antialiased">
        <AppProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1c1c1c",
                color: "#f5f5f5",
                border: "1px solid #252525",
                borderRadius: "10px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#22c55e", secondary: "#0a0a0a" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#0a0a0a" },
              },
            }}
          />
        </AppProvider>
      </body>
    </html>
  );
}
