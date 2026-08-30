import * as React from "react"
import { Input, FormField } from "@/components/ui"
import { GOAL_TEMPLATES } from "../onboarding.constants"
import { Check, Target, Sparkles, Layers, Code, Server, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StepGoalProps {
  selectedGoal: string
  customGoal: string
  onSelectTemplate: (title: string) => void
  onChangeCustomGoal: (val: string) => void
}

const templateIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Code,
  Server,
  Cpu,
}

export const StepGoal: React.FC<StepGoalProps> = ({
  selectedGoal,
  customGoal,
  onSelectTemplate,
  onChangeCustomGoal,
}) => {
  const isCustom = selectedGoal === "custom" || (Boolean(customGoal) && !GOAL_TEMPLATES.some((t) => t.title === selectedGoal))

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-foreground sm:text-lg">
          What is your primary learning goal?
        </h3>
        <p className="text-xs text-muted-foreground">
          Choose a popular structured roadmap or write your own custom learning direction.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {GOAL_TEMPLATES.map((tmpl) => {
          const isSelected = selectedGoal === tmpl.title
          const IconComp = templateIcons[tmpl.iconName] || Target

          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelectTemplate(tmpl.title)}
              className={cn(
                "flex flex-col items-start p-3.5 rounded-lg border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-2xs"
                  : "border-border bg-card hover:bg-muted/40 text-foreground"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <IconComp className="h-3.5 w-3.5" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold",
                      isSelected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {tmpl.title}
                  </span>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                {tmpl.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* Or Custom Goal */}
      <div className="pt-2 border-t border-border/80 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Or define a custom ambition:</span>
        </div>

        <FormField label="Custom Learning Goal" htmlFor="custom-goal">
          <Input
            id="custom-goal"
            placeholder="e.g. Master Mobile Development with Flutter & Dart"
            value={customGoal}
            onChange={(e) => onChangeCustomGoal(e.target.value)}
            className={isCustom ? "border-primary ring-1 ring-primary/20" : ""}
          />
        </FormField>
      </div>
    </div>
  )
}

export default StepGoal
