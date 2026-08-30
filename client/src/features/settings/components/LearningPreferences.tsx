import * as React from "react"
import { Button } from "@/components/ui"
import { Sliders, Check, Clock, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { LEVEL_OPTIONS, WEEKLY_HOURS_OPTIONS } from "../settings.constants"

export interface LearningPreferencesProps {
  initialLevel: string
  initialHours: number
  onSave: (level: string, weeklyHours: number) => Promise<void>
}

export const LearningPreferences: React.FC<LearningPreferencesProps> = ({
  initialLevel,
  initialHours,
  onSave,
}) => {
  const [level, setLevel] = React.useState(initialLevel)
  const [hours, setHours] = React.useState(initialHours)
  const [isSaving, setIsSaving] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    setLevel(initialLevel)
    setHours(initialHours)
  }, [initialLevel, initialHours])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMessage(null)

    try {
      await onSave(level, hours)
      setSuccessMessage("Learning preferences saved successfully")
      setTimeout(() => setSuccessMessage(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="space-y-0.5 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-primary" />
          <h3 className="text-base font-bold text-foreground">Learning Preferences</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Configure your current experience level and target weekly study commitment
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Success Alert */}
        {successMessage && (
          <div
            className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 animate-in fade-in-0"
            role="status"
          >
            <Check className="h-4 w-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. Experience Level Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-primary" />
            <span>Current Experience Level</span>
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            {LEVEL_OPTIONS.map((opt) => {
              const isSelected = level.toLowerCase() === opt.value.toLowerCase()
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLevel(opt.value)}
                  disabled={isSaving}
                  className={cn(
                    "flex flex-col items-start p-3.5 rounded-lg border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-2xs"
                      : "border-border/80 bg-background hover:bg-muted/50 text-foreground"
                  )}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={cn(
                        "text-xs font-bold",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {opt.label}
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    {opt.description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Target Weekly Learning Hours */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Target Weekly Study Time</span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WEEKLY_HOURS_OPTIONS.map((opt) => {
              const isSelected = hours === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHours(opt.value)}
                  disabled={isSaving}
                  className={cn(
                    "flex flex-col items-start p-3.5 rounded-lg border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-2xs"
                      : "border-border/80 bg-background hover:bg-muted/50 text-foreground"
                  )}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={cn(
                        "text-xs font-bold",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {opt.label}
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    {opt.description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <Button type="submit" size="sm" isLoading={isSaving}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  )
}

export default LearningPreferences
