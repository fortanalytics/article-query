import { Inter } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";


const inter = Inter({ subsets: ["latin"] });

const cnn = localFont({
  src: "../fonts/CNN.ttf",
  variable: "--cnn",
  weight: "200",
});
const bbc = localFont({
  src: "../fonts/BBC Logos.ttf",
  variable: "--bbc",
  weight: "200",
});

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${bbc.variable} ${cnn.variable}`}>
          {children}
      </body>
    </html>
  );
}
