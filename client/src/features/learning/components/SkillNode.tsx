import * as React from "react"
import { ChevronDown, ChevronRight, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { TopicNode } from "./TopicNode"
import { ProgressBar } from "@/components/ui"
import type { WorkspaceSkill, WorkspaceTopic } from "../learning.types"

export interface SkillNodeProps {
  skill: WorkspaceSkill
  selectedTopicId: string | null
  onToggleExpand: () => void
  onSelectTopic: (topic: WorkspaceTopic) => void
  onAddTopic: (skill: WorkspaceSkill) => void
  onEditSkill: (skill: WorkspaceSkill) => void
  onDeleteSkill: (skill: WorkspaceSkill) => void
  onEditTopic: (topic: WorkspaceTopic) => void
  onDeleteTopic: (topic: WorkspaceTopic) => void
}

export const SkillNode: React.FC<SkillNodeProps> = ({
  skill,
  selectedTopicId,
  onToggleExpand,
  onSelectTopic,
  onAddTopic,
  onEditSkill,
  onDeleteSkill,
  onEditTopic,
  onDeleteTopic,
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

  return (
    <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
      {/* Skill Header */}
      <div
        onClick={onToggleExpand}
        className="group flex items-center justify-between p-3 hover:bg-muted/40 transition-colors cursor-pointer select-none"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onToggleExpand()
          }
        }}
        aria-expanded={skill.isExpanded}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {skill.isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
          <span className="text-xs font-bold text-foreground sm:text-sm truncate">
            {skill.name}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] font-semibold text-primary">{skill.progress || 0}%</span>

          {/* Skill Actions Menu */}
          <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none transition-colors"
              aria-label={`Options for skill ${skill.name}`}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-md border border-border bg-card p-1 shadow-md animate-in fade-in-0 zoom-in-95 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onAddTopic(skill)
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-foreground hover:bg-muted"
                >
                  <Plus className="h-3 w-3" /> Add Topic
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onEditSkill(skill)
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-foreground hover:bg-muted"
                >
                  <Edit2 className="h-3 w-3" /> Edit Skill
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onDeleteSkill(skill)
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" /> Delete Skill
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mini Progress Bar under header */}
      <div className="px-3 pb-1">
        <ProgressBar value={skill.progress || 0} size="sm" />
      </div>

      {/* Nested Topics List */}
      {skill.isExpanded && (
        <div className="border-t border-border/60 bg-muted/10 p-2 space-y-1">
          {skill.topics.length === 0 ? (
            <div className="py-2 text-center text-xs text-muted-foreground">
              <span>No topics in this skill yet.</span>
              <button
                type="button"
                onClick={() => onAddTopic(skill)}
                className="ml-2 font-medium text-primary hover:underline"
              >
                + Add Topic
              </button>
            </div>
          ) : (
            skill.topics.map((topic) => (
              <TopicNode
                key={topic.id}
                topic={topic}
                isSelected={topic.id === selectedTopicId}
                onSelect={() => onSelectTopic(topic)}
                onEdit={() => onEditTopic(topic)}
                onDelete={() => onDeleteTopic(topic)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default SkillNode
