import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  maxWidth?: "default" | "sm" | "md" | "lg" | "full"
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  maxWidth = "default",
  ...props
}) => {
  const maxWidthClasses = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    default: "max-w-7xl",
    lg: "max-w-[1400px]",
    full: "max-w-full",
  }

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6",
        maxWidthClasses[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default PageContainer
