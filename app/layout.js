import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css';


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Philipp Marquardt",
  description: "Personal Site",
  verification: {
    google: "53T7bzBWPmqBSicdukWSBp07YmonNWlZbGM1_gZhimQ",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}<SpeedInsights /></body>
    </html>
  );
}
