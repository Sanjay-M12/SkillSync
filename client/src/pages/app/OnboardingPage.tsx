import * as React from "react"
import { Link } from "react-router-dom"
import { OnboardingWizard } from "@/features/onboarding"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/ui"

export const OnboardingPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-background px-4 py-8 sm:px-6 lg:px-8 antialiased selection:bg-primary/20 selection:text-primary">
      {/* Header with Back and Brand */}
      <div className="mx-auto flex w-full max-w-xl items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Exit to home</span>
        </Link>

        <Logo size="sm" to="/" />
      </div>

      {/* Main Wizard Container */}
      <div className="my-auto mx-auto w-full max-w-xl py-6">
        <div className="space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Welcome to SkillSync 👋
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm max-w-md mx-auto">
              Let&apos;s personalize your structured learning journey in a few quick steps.
            </p>
          </div>

          <OnboardingWizard />
        </div>
      </div>

      {/* Footer */}
      <div className="mx-auto text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} SkillSync. All rights reserved.
      </div>
    </div>
  )
}

export default OnboardingPage
