import * as React from "react"
import { Sun, Moon, Monitor, Check } from "lucide-react"
import { useTheme, Theme } from "@/context/ThemeContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui"
import { cn } from "@/lib/utils"

export const ThemeSettings: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const options: Array<{
    id: Theme
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
  }> = [
    {
      id: "light",
      title: "Light",
      description: "Clean, high-contrast light mode",
      icon: Sun,
    },
    {
      id: "dark",
      title: "Dark",
      description: "Eye-friendly dark SaaS mode",
      icon: Moon,
    },
    {
      id: "system",
      title: "System",
      description: "Matches your OS color scheme",
      icon: Monitor,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance &amp; Theme</CardTitle>
        <CardDescription>
          Customize how SkillSync looks on your device. Currently using{" "}
          <span className="font-semibold text-foreground capitalize">{resolvedTheme}</span> mode.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {options.map((opt) => {
            const Icon = opt.icon
            const isSelected = theme === opt.id

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={cn(
                  "relative flex flex-col items-start justify-between rounded-xl border p-4 text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                    : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
                )}
              >
                <div className="flex w-full items-center justify-between mb-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border",
                      isSelected
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {isSelected && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm font-bold text-foreground">{opt.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default ThemeSettings
