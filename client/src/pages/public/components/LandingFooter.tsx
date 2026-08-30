import * as React from "react"
import { Link } from "react-router-dom"
import { Logo } from "@/components/ui"

export const LandingFooter: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="border-t border-border bg-card py-12 text-foreground antialiased">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Brand & Description */}
          <div className="space-y-2 max-w-sm">
            <Logo size="md" to="/" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Personalized learning tracker that helps turn ambitious goals into structured,
              trackable journeys.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-medium text-muted-foreground">
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <Link to="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Get Started
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SkillSync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default LandingFooter
