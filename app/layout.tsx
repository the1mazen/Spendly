import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth/auth-context"
import { FinanceProvider } from "@/lib/context/finance-context"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Spendly OS — KokonutUI Personal Finance & Expense Ledger",
  description: "Enterprise-grade personal finance, multi-currency ledger, isolated user accounts, and client-side encryption.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#09090b] text-zinc-100 antialiased min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <FinanceProvider>
              {children}
              <Toaster richColors position="top-right" theme="dark" />
            </FinanceProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
