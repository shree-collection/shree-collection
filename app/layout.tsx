import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/cart/CartContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: [
    "400",
    "500",
    "600",
    "700",
    "800",
  ],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

const siteTitle =
  "Shree Collection | Gifts, Toys & Party Items";

const siteDescription =
  "Discover trending gifts, toys, party essentials, stationery, ladies bags, gift hampers, key chains and divine decor at Shree Collection.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: siteTitle,
    template: "%s | Shree Collection",
  },

  description: siteDescription,

  keywords: [
    "Shree Collection",
    "gifts online",
    "toys online",
    "party items",
    "birthday decorations",
    "gift hampers",
    "key chains",
    "divine photo frames",
    "home decor",
    "stationery",
    "ladies bags",
    "wholesale gifts",
    "wholesale toys",
    "gift shop India",
  ],

  applicationName: "Shree Collection",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    siteName: "Shree Collection",
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
  },

  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`${plusJakartaSans.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <CartProvider>
          <Header />

          <main className="min-h-screen">
            {children}
          </main>

          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}