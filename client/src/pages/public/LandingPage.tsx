import * as React from "react"
import { LandingNavbar } from "./components/LandingNavbar"
import { LandingHero } from "./components/LandingHero"
import { LandingMetrics } from "./components/LandingMetrics"
import { LandingFeatures } from "./components/LandingFeatures"
import { LandingHowItWorks } from "./components/LandingHowItWorks"
import { LandingCTA } from "./components/LandingCTA"
import { LandingFooter } from "./components/LandingFooter"

export const LandingPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background sandal-scattered-bg text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* 1. Navbar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. Hero & Product Preview */}
        <LandingHero />

        {/* 3. Metrics & Impact Bar */}
        <LandingMetrics />

        {/* 4. Core Solutions / Features */}
        <LandingFeatures />

        {/* 5. How It Works */}
        <LandingHowItWorks />

        {/* 6. Final CTA */}
        <LandingCTA />
      </main>


      {/* 6. Footer */}
      <LandingFooter />
    </div>
  )
}

export default LandingPage
