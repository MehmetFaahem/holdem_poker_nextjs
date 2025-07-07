import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ReduxProvider } from "@/components/ReduxProvider";
import { ConfirmationModalProvider } from "@/contexts/ConfirmationModalContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const blacklisted = localFont({
  src: "../../public/images/font/Blacklisted.ttf",
  variable: "--font-blacklisted",
  display: "swap",
});

const impact = localFont({
  src: "../../public/images/font/impact.ttf",
  variable: "--font-impact",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Texas Hold'em Poker - Multiplayer Online",
  description:
    "Play Texas Hold'em poker online with friends. Real-time multiplayer poker game with professional interface and responsive design.",
  viewport:
    "width=device-width, initial-scale=1.0, orientation=portrait, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, orientation=portrait, user-scalable=no"
        />
        <meta name="screen-orientation" content="portrait" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${blacklisted.variable} ${impact.variable} antialiased`}
      >
        <ReduxProvider>
          <ConfirmationModalProvider>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
              toastClassName="!bg-slate-800/95 !border !border-white/10 !backdrop-blur-sm !text-white !font-medium"
              progressClassName="!bg-gradient-to-r !from-blue-500 !to-purple-500"
            />
          </ConfirmationModalProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
