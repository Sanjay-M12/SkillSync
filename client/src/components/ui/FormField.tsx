import * as React from "react"
import { Label } from "./Label"
import { cn } from "@/lib/utils"

export interface FormFieldProps {
  label?: string
  htmlFor?: string
  required?: boolean
  helperText?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  helperText,
  error,
  children,
  className,
}) => {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-[11px] font-medium text-destructive leading-tight" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-muted-foreground leading-tight">{helperText}</p>
      ) : null}
    </div>
  )
}
