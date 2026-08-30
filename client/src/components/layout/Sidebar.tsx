import * as React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  BarChart3,
  Settings,
  LogOut,
  Timer,
  Trophy,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppContext } from "@/context/AppContext"
import { Logo } from "@/components/ui"

export interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Learning", href: "/learning", icon: BookOpen },
  { label: "Knowledge Base", href: "/knowledge", icon: Brain },
  { label: "Focus Mode", href: "/focus", icon: Timer },
  { label: "Achievements", href: "/achievements", icon: Trophy },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
]

export interface SidebarProps {
  onNavigate?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
  className,
}) => {
  const { user, signOut } = useAppContext()

  const userInitials = React.useMemo(() => {
    if (!user.name) return "SJ"
    const parts = user.name.trim().split(" ")
    return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "SJ"
  }, [user.name])

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card text-card-foreground select-none transition-all duration-200",
        isCollapsed ? "w-16" : "w-60",
        className
      )}
    >
      {/* Brand Header & Close/Collapse Button */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-border/80",
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {isCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-4 w-4 text-primary" />
          </button>
        ) : (
          <>
            <Logo size="md" subtitle="Learning Platform" to="/dashboard" />
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Navigation Container without excessive empty void */}
      <div className="px-2.5 py-3 space-y-4">
        {/* Workspace Group */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Workspace
            </p>
          )}
          {mainNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "group flex items-center rounded-lg text-xs font-medium transition-all duration-150",
                  isCollapsed
                    ? "h-9 w-full justify-center px-0"
                    : "gap-2.5 px-2.5 py-1.5",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground active:scale-[0.99]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* System Group & Settings */}
        <div className="space-y-1 border-t border-border/60 pt-3">
          {!isCollapsed && (
            <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              System
            </p>
          )}
          <NavLink
            to="/settings"
            onClick={onNavigate}
            title={isCollapsed ? "Settings" : undefined}
            className={({ isActive }) =>
              cn(
                "group flex items-center rounded-lg text-xs font-medium transition-all duration-150",
                isCollapsed
                  ? "h-9 w-full justify-center px-0"
                  : "gap-2.5 px-2.5 py-1.5",
                isActive
                  ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground active:scale-[0.99]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Settings
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!isCollapsed && <span>Settings</span>}
              </>
            )}
          </NavLink>
        </div>

        {/* Compact User Profile & Sign Out right below System */}
        <div className="border-t border-border/60 pt-3">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-border object-cover select-none"
                  referrerPolicy="no-referrer"
                  title={user.name}
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs select-none"
                  title={user.name}
                >
                  {userInitials}
                </div>
              )}
              <button
                type="button"
                title="Sign Out"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                onClick={signOut}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-2 transition-colors">
              <div className="flex items-center gap-2 overflow-hidden min-w-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-7 w-7 shrink-0 rounded-full border border-border object-cover select-none"
                    referrerPolicy="no-referrer"
                    title={user.name}
                  />
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-[11px]">
                    {userInitials}
                  </div>
                )}
                <div className="min-w-0 flex-1 truncate">
                  <p className="truncate text-xs font-semibold text-foreground leading-tight">
                    {user.name}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground leading-tight">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                title="Sign Out"
                className="shrink-0 rounded p-1 text-muted-foreground hover:bg-background hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                onClick={signOut}
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
