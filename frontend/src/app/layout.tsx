import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "./lib/ThemeContext"
import { AuthProvider } from "@/lib/AuthContext"
import { TicketProvider } from "@/lib/TicketContext"

const fontSans = Plus_Jakarta_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Enterprise Support Concierge — Intelligent Support Engine",
  description: "Human-centered enterprise customer support platform with multi-agent intelligence.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" data-theme="indigo">
      <body className={fontSans.className}>
        <ThemeProvider>
          <AuthProvider>
            <TicketProvider>
              {children}
            </TicketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
