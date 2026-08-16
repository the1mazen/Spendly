import OnboardingWizard from "@/components/onboarding/onboarding-wizard"

export const metadata = {
  title: "User Onboarding & Account Setup — Spendly OS",
  description: "Initialize your financial profile, multi-currency wallets, and cashflow pacing rules.",
}

export default function OnboardingPage() {
  return <OnboardingWizard />
}
