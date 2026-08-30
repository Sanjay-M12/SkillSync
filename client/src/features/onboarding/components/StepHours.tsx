import * as React from "react"
import { WEEKLY_HOURS_OPTIONS } from "@/features/settings/settings.constants"
import { Check, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StepHoursProps {
  selectedHours: number
  onSelectHours: (hours: number) => void
}

export const StepHours: React.FC<StepHoursProps> = ({ selectedHours, onSelectHours }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-foreground sm:text-lg">
          How much time can you commit weekly?
        </h3>
        <p className="text-xs text-muted-foreground">
          Setting a realistic study target helps keep your learning streak alive.
        </p>
      </div>

      <div className="space-y-3">
        {WEEKLY_HOURS_OPTIONS.map((opt) => {
          const isSelected = selectedHours === opt.value

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectHours(opt.value)}
              className={cn(
                "flex items-center justify-between w-full p-4 rounded-lg border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-2xs"
                  : "border-border bg-card hover:bg-muted/40 text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4
                    className={cn(
                      "text-sm font-bold",
                      isSelected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {opt.label}
                  </h4>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
              </div>

              {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default StepHours
