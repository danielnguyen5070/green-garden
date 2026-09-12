import { Be_Vietnam_Pro, Lora } from "next/font/google";

export const lora = Lora({
  subsets: ["latin", "vietnamese"],
  variable: "--font-lora",
  display: "swap",
});

export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const fontVariables = `${lora.variable} ${beVietnamPro.variable}`;
