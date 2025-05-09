import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ataque a Saturno",
  description:
    "Ataque a Saturno é um jogo de corrida e sobrevivência onde você deve evitar obstáculos e coletar itens enquanto corre pelos anéis de Saturno.",
  generator: "v0.dev",
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
