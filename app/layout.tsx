import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { FinanceProvider } from "@/lib/context/finance-context"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Spendly OS — Personal Finance & Expense Ledger OS",
  description: "Enterprise-grade personal finance, multi-currency ledger, cashflow burn-down pacing, and custodial asset tracking.",
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
          <FinanceProvider>
            {children}
            <Toaster richColors position="top-right" theme="dark" />
          </FinanceProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
