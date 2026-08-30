import * as React from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  subtitle?: string
  to?: string
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showText = true,
  subtitle,
  to,
  className,
  ...props
}) => {
  const sizeMap = {
    sm: { img: "h-6 w-6", text: "text-sm", sub: "text-[9px]" },
    md: { img: "h-7 w-7", text: "text-base", sub: "text-[10px]" },
    lg: { img: "h-9 w-9", text: "text-lg", sub: "text-xs" },
    xl: { img: "h-12 w-12", text: "text-2xl", sub: "text-sm" },
  }

  const { img, text, sub } = sizeMap[size] || sizeMap.md

  const content = (
    <div
      className={cn("inline-flex items-center gap-2.5 select-none group", className)}
      {...props}
    >
      <img
        src="/logo.png"
        alt="SkillSync Logo"
        className={cn(img, "rounded-lg object-contain shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105")}
      />
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-bold tracking-tight text-foreground leading-none", text)}>
            SkillSync
          </span>
          {subtitle && (
            <span className={cn("font-semibold text-muted-foreground uppercase tracking-wider mt-0.5", sub)}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        {content}
      </Link>
    )
  }

  return content
}

export default Logo
