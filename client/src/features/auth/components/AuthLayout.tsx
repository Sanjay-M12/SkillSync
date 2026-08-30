import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/ui"

export interface AuthLayoutProps {
  title: string
  subtitle: string
  footerText: string
  footerLinkText: string
  footerLinkHref: string
  children: React.ReactNode
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
  children,
}) => {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-background px-4 py-8 sm:px-6 lg:px-8 antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Header with Back to Home & Brand */}
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to home</span>
        </Link>

        <Logo size="sm" to="/" />
      </div>

      {/* Centered Auth Card Container */}
      <div className="my-auto mx-auto w-full max-w-md py-6">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
          {/* Heading */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
          </div>

          {/* Form Content */}
          {children}

          {/* Alternative Navigation Footer */}
          <div className="border-t border-border/80 pt-4 text-center text-xs text-muted-foreground">
            {footerText}{" "}
            <Link
              to={footerLinkHref}
              className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
            >
              {footerLinkText}
            </Link>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="mx-auto text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} SkillSync. All rights reserved.
      </div>
    </div>
  )
}

export default AuthLayout
