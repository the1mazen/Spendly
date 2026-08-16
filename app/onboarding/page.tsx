import AuthView from "@/components/auth/auth-view"

export const metadata = {
  title: "Welcome & Account Setup — Spendly OS",
  description: "Create your profile, initialize your financial wallets, and launch your encrypted personal dashboard.",
}

export default function OnboardingPage() {
  return <AuthView />
}
