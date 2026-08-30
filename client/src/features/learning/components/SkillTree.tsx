import * as React from "react"
import { Button } from "@/components/ui"
import { Plus, Layers } from "lucide-react"
import { SkillNode } from "./SkillNode"
import type { WorkspaceSkill, WorkspaceTopic } from "../learning.types"

export interface SkillTreeProps {
  skills: WorkspaceSkill[]
  selectedTopicId: string | null
  onToggleExpandSkill: (skillId: string) => void
  onSelectTopic: (topic: WorkspaceTopic) => void
  onAddSkill: () => void
  onAddTopic: (skill: WorkspaceSkill) => void
  onEditSkill: (skill: WorkspaceSkill) => void
  onDeleteSkill: (skill: WorkspaceSkill) => void
  onEditTopic: (topic: WorkspaceTopic) => void
  onDeleteTopic: (topic: WorkspaceTopic) => void
}

export const SkillTree: React.FC<SkillTreeProps> = ({
  skills,
  selectedTopicId,
  onToggleExpandSkill,
  onSelectTopic,
  onAddSkill,
  onAddTopic,
  onEditSkill,
  onDeleteSkill,
  onEditTopic,
  onDeleteTopic,
}) => {
  return (
    <div className="space-y-3">
      {/* Header and Add Skill Trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Layers className="h-3.5 w-3.5" />
          <span>Skills Hierarchy</span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddSkill}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          className="h-7 text-xs font-semibold text-primary hover:text-primary"
        >
          Add Skill
        </Button>
      </div>

      {/* Skills Nodes Stack */}
      {skills.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground space-y-2">
          <p>No skills in this journey yet.</p>
          <Button size="sm" onClick={onAddSkill} leftIcon={<Plus className="h-3.5 w-3.5" />}>
            Add First Skill
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {skills.map((skill) => (
            <SkillNode
              key={skill.id}
              skill={skill}
              selectedTopicId={selectedTopicId}
              onToggleExpand={() => onToggleExpandSkill(skill.id)}
              onSelectTopic={onSelectTopic}
              onAddTopic={onAddTopic}
              onEditSkill={onEditSkill}
              onDeleteSkill={onDeleteSkill}
              onEditTopic={onEditTopic}
              onDeleteTopic={onDeleteTopic}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SkillTree
