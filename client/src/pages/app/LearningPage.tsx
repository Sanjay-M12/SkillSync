import * as React from "react"
import { Link } from "react-router-dom"
import { PageContainer, PageHeader } from "@/components/layout"
import { Button } from "@/components/ui"
import { Plus, Check, FolderTree, X, Sparkles } from "lucide-react"
import { useAppContext } from "@/context/AppContext"
import {
  LearningGoalSummary,
  SkillTree,
  TopicDetails,
  SkillDialog,
  TopicDialog,
  TaskDialog,
  DeleteLearningItemDialog,
  LearningSkeleton,
  LearningErrorState,
  LearningEmptyState,
  type WorkspaceSkill,
  type WorkspaceTopic,
  type WorkspaceTask,
  type DeleteItemTarget,
} from "@/features/learning"
import type { ConfidenceLevel } from "@/types"

export const LearningPage: React.FC = () => {
  const {
    goal,
    isLoading,
    isError,
    refetchActiveGoal,
    toggleTaskComplete,
    updateConfidence,
    addSkill,
    editSkill,
    deleteSkill,
    addTopic,
    editTopic,
    deleteTopic,
    addTask,
    editTask,
    deleteTask,
  } = useAppContext()

  const [selectedSkillId, setSelectedSkillId] = React.useState<string | null>(null)
  const [selectedTopicId, setSelectedTopicId] = React.useState<string | null>(null)
  const [expandedSkills, setExpandedSkills] = React.useState<Record<string, boolean>>({})
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false)

  // Toast feedback state
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)
  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev))
    }, 3000)
  }

  // Dialog states
  const [skillDialog, setSkillDialog] = React.useState<{
    isOpen: boolean
    editingSkill: WorkspaceSkill | null
  }>({ isOpen: false, editingSkill: null })

  const [topicDialog, setTopicDialog] = React.useState<{
    isOpen: boolean
    parentSkill: WorkspaceSkill | null
    editingTopic: WorkspaceTopic | null
  }>({ isOpen: false, parentSkill: null, editingTopic: null })

  const [taskDialog, setTaskDialog] = React.useState<{
    isOpen: boolean
    editingTask: WorkspaceTask | null
  }>({ isOpen: false, editingTask: null })

  const [deleteTarget, setDeleteTarget] = React.useState<DeleteItemTarget | null>(null)

  // Set default selection when goal loads or changes
  React.useEffect(() => {
    if (goal && goal.skills.length > 0) {
      if (!selectedSkillId || !goal.skills.some((s) => s.id === selectedSkillId)) {
        const firstSkill = goal.skills[0]
        setSelectedSkillId(firstSkill.id)
        if (firstSkill.topics.length > 0) {
          setSelectedTopicId(firstSkill.topics[0].id)
        }
      }
    }
  }, [goal, selectedSkillId])

  // Resolve active skill & topic
  const activeSkill = React.useMemo(() => {
    if (!goal || !selectedSkillId) return null
    return goal.skills.find((s) => s.id === selectedSkillId) || null
  }, [goal, selectedSkillId])

  const activeTopic = React.useMemo(() => {
    if (!goal) return null
    for (const skill of goal.skills) {
      const found = skill.topics.find((t) => t.id === selectedTopicId)
      if (found) return found
    }
    return null
  }, [goal, selectedTopicId])

  // Handlers
  const handleToggleExpandSkill = (skillId: string) => {
    setExpandedSkills((prev) => ({
      ...prev,
      [skillId]: prev[skillId] !== undefined ? !prev[skillId] : false,
    }))
  }

  const handleSelectTopic = (topic: WorkspaceTopic) => {
    setSelectedTopicId(topic.id)
    setSelectedSkillId(topic.skillId)
    setMobileDrawerOpen(false)
  }

  const handleToggleTask = (taskId: string, completed: boolean) => {
    toggleTaskComplete(taskId, completed)
    showToast(completed ? "Task completed 🎉" : "Task marked as incomplete")
  }

  const handleConfidenceChange = (confidence: ConfidenceLevel) => {
    if (!selectedTopicId) return
    updateConfidence(selectedTopicId, confidence)
    showToast(`Topic confidence updated to ${confidence.replace("_", " ")}`)
  }

  // Skills with local expanded state
  const skillsWithExpansion = React.useMemo(() => {
    if (!goal) return []
    return goal.skills.map((s) => ({
      ...s,
      isExpanded: expandedSkills[s.id] !== undefined ? expandedSkills[s.id] : (s.isExpanded ?? true),
    }))
  }, [goal, expandedSkills])

  // CRUD Skill
  const handleSaveSkill = (data: { name: string; description?: string }) => {
    if (skillDialog.editingSkill) {
      editSkill(skillDialog.editingSkill.id, data)
      showToast("Skill updated")
    } else {
      addSkill(data)
      showToast("New skill added to roadmap")
    }
  }

  // CRUD Topic
  const handleSaveTopic = (data: { name: string; description?: string }) => {
    const targetSkill = topicDialog.parentSkill || activeSkill
    if (!targetSkill) return

    if (topicDialog.editingTopic) {
      editTopic(topicDialog.editingTopic.id, data)
      showToast("Topic updated")
    } else {
      addTopic(targetSkill.id, data)
      showToast("New topic added")
    }
  }

  // CRUD Task
  const handleSaveTask = (data: { title: string; estimatedMinutes?: number }) => {
    if (!activeTopic) return

    if (taskDialog.editingTask) {
      editTask(taskDialog.editingTask.id, data)
      showToast("Task updated")
    } else {
      addTask(activeTopic.id, data)
      showToast("Task added to topic")
    }
  }

  // Delete Action
  const handleConfirmDelete = () => {
    if (!deleteTarget) return

    if (deleteTarget.type === "SKILL") {
      deleteSkill(deleteTarget.id)
      showToast(`Skill "${deleteTarget.name}" deleted`)
    } else if (deleteTarget.type === "TOPIC") {
      deleteTopic(deleteTarget.id)
      showToast(`Topic "${deleteTarget.name}" deleted`)
    } else if (deleteTarget.type === "TASK") {
      deleteTask(deleteTarget.id)
      showToast(`Task deleted`)
    }

    setDeleteTarget(null)
  }

  return (
    <PageContainer maxWidth="lg" className="space-y-6">
      {/* Page Header with Action */}
      <PageHeader
        title="My Learning Workspace"
        description="Organize your learning path into structured skills, topics, and actionable tasks."
        actions={
          !goal ? (
            <Link to="/onboarding">
              <Button size="sm" leftIcon={<Sparkles className="h-4 w-4" />}>
                Get Started
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              {/* Mobile Hierarchy Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileDrawerOpen(true)}
                leftIcon={<FolderTree className="h-4 w-4" />}
              >
                Browse Path
              </Button>

              <Button
                size="sm"
                onClick={() => setSkillDialog({ isOpen: true, editingSkill: null })}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Skill
              </Button>
            </div>
          )
        }
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-primary/20 bg-card px-4 py-3 text-xs font-semibold text-foreground shadow-lg animate-in slide-in-from-bottom-4"
          role="status"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3 w-3" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Loading State */}
      {isLoading && <LearningSkeleton />}

      {/* 2. Error State */}
      {!isLoading && isError && !goal && (
        <LearningErrorState onRetry={refetchActiveGoal} />
      )}

      {/* 3. Empty State (No Goal or No Skills) */}
      {!isLoading && !isError && !goal && (
        <LearningEmptyState />
      )}

      {!isLoading && !isError && goal && goal.skills.length === 0 && (
        <div className="space-y-6">
          <LearningGoalSummary goal={goal} />
          <LearningEmptyState
            isGoalPresent
            onAddSkill={() => setSkillDialog({ isOpen: true, editingSkill: null })}
          />
        </div>
      )}

      {/* 4. Active Main Workspace Grid */}
      {!isLoading && goal && goal.skills.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: Learning Hierarchy (Desktop 5 cols) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col space-y-4">
            <LearningGoalSummary goal={goal} />

            <SkillTree
              skills={skillsWithExpansion}
              selectedTopicId={selectedTopicId}
              onToggleExpandSkill={handleToggleExpandSkill}
              onSelectTopic={handleSelectTopic}
              onAddSkill={() => setSkillDialog({ isOpen: true, editingSkill: null })}
              onAddTopic={(skill) =>
                setTopicDialog({ isOpen: true, parentSkill: skill, editingTopic: null })
              }
              onEditSkill={(skill) =>
                setSkillDialog({ isOpen: true, editingSkill: skill })
              }
              onDeleteSkill={(skill) =>
                setDeleteTarget({ type: "SKILL", id: skill.id, name: skill.name })
              }
              onEditTopic={(topic) =>
                setTopicDialog({ isOpen: true, parentSkill: activeSkill, editingTopic: topic })
              }
              onDeleteTopic={(topic) =>
                setDeleteTarget({ type: "TOPIC", id: topic.id, name: topic.name })
              }
            />
          </div>

          {/* Right Column: Selected Topic Details & Tasks (7 cols) */}
          <div className="col-span-12 lg:col-span-7">
            <TopicDetails
              topic={activeTopic}
              parentSkill={activeSkill}
              onToggleTaskComplete={handleToggleTask}
              onChangeConfidence={handleConfidenceChange}
              onAddTask={() => setTaskDialog({ isOpen: true, editingTask: null })}
              onEditTask={(task) => setTaskDialog({ isOpen: true, editingTask: task })}
              onDeleteTask={(task) =>
                setDeleteTarget({ type: "TASK", id: task.id, name: task.title })
              }
            />
          </div>
        </div>
      )}

      {/* Mobile Learning Path Drawer */}
      {mobileDrawerOpen && goal && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Learning Hierarchy Drawer"
        >
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-card p-5 shadow-2xl overflow-y-auto space-y-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm">Learning Path Structure</h3>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <LearningGoalSummary goal={goal} />

            <SkillTree
              skills={skillsWithExpansion}
              selectedTopicId={selectedTopicId}
              onToggleExpandSkill={handleToggleExpandSkill}
              onSelectTopic={handleSelectTopic}
              onAddSkill={() => {
                setMobileDrawerOpen(false)
                setSkillDialog({ isOpen: true, editingSkill: null })
              }}
              onAddTopic={(skill) => {
                setMobileDrawerOpen(false)
                setTopicDialog({ isOpen: true, parentSkill: skill, editingTopic: null })
              }}
              onEditSkill={(skill) => {
                setMobileDrawerOpen(false)
                setSkillDialog({ isOpen: true, editingSkill: skill })
              }}
              onDeleteSkill={(skill) => {
                setMobileDrawerOpen(false)
                setDeleteTarget({ type: "SKILL", id: skill.id, name: skill.name })
              }}
              onEditTopic={(topic) => {
                setMobileDrawerOpen(false)
                setTopicDialog({ isOpen: true, parentSkill: activeSkill, editingTopic: topic })
              }}
              onDeleteTopic={(topic) => {
                setMobileDrawerOpen(false)
                setDeleteTarget({ type: "TOPIC", id: topic.id, name: topic.name })
              }}
            />
          </div>
        </div>
      )}

      {/* CRUD Dialogs */}
      <SkillDialog
        isOpen={skillDialog.isOpen}
        onClose={() => setSkillDialog({ isOpen: false, editingSkill: null })}
        onSave={handleSaveSkill}
        editingSkill={skillDialog.editingSkill}
      />

      <TopicDialog
        isOpen={topicDialog.isOpen}
        parentSkill={topicDialog.parentSkill}
        onClose={() => setTopicDialog({ isOpen: false, parentSkill: null, editingTopic: null })}
        onSave={handleSaveTopic}
        editingTopic={topicDialog.editingTopic}
      />

      <TaskDialog
        isOpen={taskDialog.isOpen}
        onClose={() => setTaskDialog({ isOpen: false, editingTask: null })}
        onSave={handleSaveTask}
        editingTask={taskDialog.editingTask}
      />

      <DeleteLearningItemDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  )
}

export default LearningPage
