export const metadata = {
  title: "Cinematic Store Hero Motion",
  description: "Generate a cinematic hero motion from your store images"
};

import "./globals.css";
import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

