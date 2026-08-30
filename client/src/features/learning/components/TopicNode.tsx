import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, MoreVertical, Edit2, Trash2 } from "lucide-react"
import type { WorkspaceTopic } from "../learning.types"

export interface TopicNodeProps {
  topic: WorkspaceTopic
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

export const TopicNode: React.FC<TopicNodeProps> = ({
  topic,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
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

  const isCompleted = (topic.progress || 0) === 100
  const hasTasks = topic.tasks && topic.tasks.length > 0
  const needsAttention = topic.confidence === "WEAK" || topic.confidence === "NEEDS_REVISION"

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer select-none",
        isSelected
          ? "bg-primary/10 text-primary font-semibold border border-primary/30"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      aria-selected={isSelected}
    >
      <div className="flex items-center gap-2 min-w-0 pr-2">
        {isCompleted ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
        ) : (
          <Circle
            className={cn(
              "h-3.5 w-3.5 flex-shrink-0",
              isSelected ? "text-primary" : "text-muted-foreground/60"
            )}
          />
        )}
        <span className="truncate">{topic.name}</span>
        {needsAttention && (
          <span
            className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0"
            title="Needs Revision"
            aria-label="Needs Revision"
          />
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[10px] text-muted-foreground">
          {hasTasks ? `${topic.progress || 0}%` : "0%"}
        </span>

        {/* Options Menu Trigger */}
        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded p-0.5 text-muted-foreground/60 opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted focus:opacity-100 focus:outline-none transition-opacity"
            aria-label={`Options for ${topic.name}`}
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-28 rounded-md border border-border bg-card p-1 shadow-md animate-in fade-in-0 zoom-in-95 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onEdit()
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-foreground hover:bg-muted"
              >
                <Edit2 className="h-3 w-3" /> Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onDelete()
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopicNode
