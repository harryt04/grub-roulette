import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grub Roulette",
  description: "Randomly choose a restaurant near you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
