import * as React from "react"
import { cn } from "@/lib/utils"
import type { ConfidenceLevel } from "@/types"

export interface ConfidenceSelectorProps {
  confidence: ConfidenceLevel
  onChange: (confidence: ConfidenceLevel) => void
  disabled?: boolean
}

const confidenceOptions: Array<{
  value: ConfidenceLevel
  label: string
  dotClass: string
  activeBorder: string
  activeBg: string
}> = [
  {
    value: "STRONG",
    label: "Strong",
    dotClass: "bg-emerald-500",
    activeBorder: "border-emerald-500/40",
    activeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold",
  },
  {
    value: "NEEDS_REVISION",
    label: "Needs Revision",
    dotClass: "bg-amber-500",
    activeBorder: "border-amber-500/40",
    activeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold",
  },
  {
    value: "WEAK",
    label: "Weak",
    dotClass: "bg-rose-500",
    activeBorder: "border-rose-500/40",
    activeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold",
  },
  {
    value: "NOT_RATED",
    label: "Not Rated",
    dotClass: "bg-muted-foreground",
    activeBorder: "border-border",
    activeBg: "bg-muted text-foreground font-semibold",
  },
]

export const ConfidenceSelector: React.FC<ConfidenceSelectorProps> = ({
  confidence,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Confidence Rating
      </label>

      <div className="flex flex-wrap gap-2">
        {confidenceOptions.map((opt) => {
          const isSelected = confidence === opt.value

          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none",
                isSelected
                  ? cn(opt.activeBorder, opt.activeBg, "shadow-2xs")
                  : "border-border/80 bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", opt.dotClass)} />
              <span>{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ConfidenceSelector
