import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { Target, Menu, Timer, Trophy, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { useAppContext } from "@/context/AppContext"
import { ThemeToggle } from "@/components/ui"

export interface HeaderProps {
  onMobileMenuToggle?: () => void
  isSidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

const pageTitles: Record<string, { title: string; section: string }> = {
  "/dashboard": { title: "Dashboard", section: "Overview" },
  "/learning": { title: "My Learning", section: "Workspace" },
  "/focus": { title: "Focus Mode & Pomodoro", section: "Productivity" },
  "/achievements": { title: "Milestones & Badges", section: "Gamification" },
  "/analytics": { title: "Analytics", section: "Insights" },
  "/settings": { title: "Settings", section: "Preferences" },
}

export const Header: React.FC<HeaderProps> = ({
  onMobileMenuToggle,
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const location = useLocation()
  const pageInfo = pageTitles[location.pathname] || { title: "SkillSync", section: "App" }
  const { user, goal } = useAppContext()

  const userInitials = React.useMemo(() => {
    if (!user.name) return "SJ"
    const parts = user.name.trim().split(" ")
    return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "SJ"
  }, [user.name])

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/80 bg-background/95 px-4 backdrop-blur-xs sm:px-6 lg:px-8 supports-[backdrop-filter]:bg-background/80 select-none">
      {/* Left: Mobile/Desktop Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2.5">
        {/* Mobile menu toggle */}
        {onMobileMenuToggle && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring md:hidden"
            aria-label="Open mobile navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Desktop sidebar collapse/expand toggle button */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 text-primary" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2 text-xs">
          <span className="hidden text-muted-foreground sm:inline-block font-medium">
            {pageInfo.section}
          </span>
          <span className="hidden text-muted-foreground/40 sm:inline-block">/</span>
          <h2 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
            {pageInfo.title}
          </h2>
        </div>
      </div>

      {/* Right: Quick actions, Active Goal pill & User Avatar */}
      <div className="flex items-center gap-2.5">
        {/* Quick Focus Mode Link */}
        {location.pathname !== "/focus" && (
          <Link
            to="/focus"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all shadow-2xs"
          >
            <Timer className="h-3.5 w-3.5 text-primary" />
            <span>Focus Mode</span>
          </Link>
        )}

        {/* Quick Achievements Link */}
        {location.pathname !== "/achievements" && (
          <Link
            to="/achievements"
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all shadow-2xs"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Badges</span>
          </Link>
        )}

        {/* Active Goal Context Pill */}
        {goal && (
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs">
            <Target className="h-3 w-3 text-primary shrink-0" />
            <span className="text-muted-foreground">Goal:</span>
            <span className="font-medium text-foreground truncate max-w-[140px]">
              {goal.title}
            </span>
          </div>
        )}

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* User Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-7 w-7 rounded-full border border-border object-cover select-none"
            referrerPolicy="no-referrer"
            title={user.name}
          />
        ) : (
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-primary/10 text-[11px] font-bold text-primary select-none"
            title={user.name}
            aria-label="User profile avatar"
          >
            {userInitials}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
