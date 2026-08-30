import * as React from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme, Theme } from "@/context/ThemeContext"
import { cn } from "@/lib/utils"

export interface ThemeToggleProps {
  className?: string
  showDropdown?: boolean
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  showDropdown = false,
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick)
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [menuOpen])

  if (!showDropdown) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-2xs cursor-pointer select-none",
          className
        )}
        title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? (
          <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 text-slate-700 transition-transform hover:-rotate-12" />
        )}
      </button>
    )
  }

  const options: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-2xs cursor-pointer",
          className
        )}
        aria-label="Theme selector"
        title="Theme preferences"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="h-4 w-4 text-slate-300" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-32 rounded-lg border border-border bg-card p-1 shadow-lg animate-in fade-in-0 zoom-in-95 text-xs">
          {options.map((opt) => {
            const Icon = opt.icon
            const isSelected = theme === opt.value

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value)
                  setMenuOpen(false)
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left font-medium transition-colors",
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ThemeToggle
