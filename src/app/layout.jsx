import { Geist, Geist_Mono, Nunito, Caveat_Brush } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import SmoothScroll from "@/components/SmoothScroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
});

const caveatBrush = Caveat_Brush({
  variable: "--font-caveat-brush",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata = {
  title: "Plushies And More | Discover the Cutest Plushies & Adorable Gifts",
  description: "From kawaii plush toys to cozy socks & baby mats – bring happiness home with our handpicked collections.",
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} ${caveatBrush.variable} antialiased`}
      >
        <CartProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </CartProvider>
      </body>
    </html>
  );
}
