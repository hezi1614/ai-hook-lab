import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Hook Lab",
  description: "为中文新媒体内容生成高点击开头 Hook。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
