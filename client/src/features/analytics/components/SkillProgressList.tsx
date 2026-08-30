import * as React from "react"
import { ProgressBar } from "@/components/ui"
import { Layers } from "lucide-react"
import type { SkillProgressSummary } from "../analytics.types"

export interface SkillProgressItemProps {
  skill: SkillProgressSummary
}

export const SkillProgressItem: React.FC<SkillProgressItemProps> = ({ skill }) => {
  return (
    <div className="rounded-lg border border-border/80 bg-card p-4 space-y-2.5 shadow-2xs">
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
        <span className="text-foreground truncate pr-2">{skill.name}</span>
        <span className="text-primary flex-shrink-0 font-bold">{skill.progressPercent}%</span>
      </div>

      <ProgressBar value={skill.progressPercent} size="md" />

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          <strong className="text-foreground">{skill.completedTasks}</strong> of{" "}
          {skill.totalTasks} tasks complete
        </span>
        <span>{skill.totalTasks - skill.completedTasks} tasks remaining</span>
      </div>
    </div>
  )
}

export interface SkillProgressListProps {
  skills: SkillProgressSummary[]
}

export const SkillProgressList: React.FC<SkillProgressListProps> = ({ skills }) => {
  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="text-base font-bold text-foreground">Skill Breakdown &amp; Progress</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Bottom-up mastery calculated across all skills in your active roadmap
        </p>
      </div>

      {/* Skills Grid */}
      {skills.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          No skills found in the active learning journey.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {skills.map((skill) => (
            <SkillProgressItem key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  )
}

export default SkillProgressList
