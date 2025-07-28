import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vendor Sahayak - Supplier Directory for Street Vendors",
  description: "Find verified suppliers with BIS, ISO, and MSME certifications. Get guidance on quality standards and connect with trusted suppliers for your business.",
  keywords: "suppliers, BIS certification, ISO certification, MSME, street vendors, quality standards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      

      <body className={`${inter.className} antialiased bg-gray-50`}>
        <AuthProvider>
          <div className="min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
