import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./AuthContext"
import {
  goalsApi,
  ApiLearningGoal,
  ApiGoalHierarchy,
  ApiLearningLevel,
  ApiWeeklyHours,
} from "@/services/goals.api"
import { learningApi } from "@/services/learning.api"
import type {
  WorkspaceGoal,
  WorkspaceSkill,
} from "@/features/learning"
import { hydrateGoalWithProgress } from "@/features/learning"
import type { ConfidenceLevel } from "@/types"

export interface UserProfile {
  name: string
  email: string
  avatarUrl?: string | null
}

export interface AppContextType {
  user: UserProfile
  goals: ApiLearningGoal[]
  activeGoalId: string | null
  goal: WorkspaceGoal | null
  isLoading: boolean
  isError: boolean
  setActiveGoalId: (id: string) => void
  refetchGoals: () => Promise<void>
  refetchActiveGoal: () => Promise<void>
  createGoal: (data: {
    title: string
    currentLevel?: string
    weeklyHours?: number | string
    description?: string
  }) => Promise<ApiLearningGoal>
  updateProfile: (data: { name: string; avatarUrl?: string | null }) => Promise<void>
  updatePreferences: (level: string, weeklyHours: number) => Promise<void>
  toggleTaskComplete: (taskId: string, completed: boolean) => Promise<void>
  updateConfidence: (topicId: string, confidence: ConfidenceLevel) => Promise<void>
  addSkill: (data: { name: string; description?: string }) => Promise<void>
  editSkill: (skillId: string, data: { name: string; description?: string }) => Promise<void>
  deleteSkill: (skillId: string) => Promise<void>
  addTopic: (skillId: string, data: { name: string; description?: string }) => Promise<void>
  editTopic: (topicId: string, data: { name: string; description?: string }) => Promise<void>
  deleteTopic: (topicId: string) => Promise<void>
  addTask: (topicId: string, data: { title: string; estimatedMinutes?: number }) => Promise<void>
  editTask: (taskId: string, data: { title: string; estimatedMinutes?: number }) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  signOut: () => void
}

function mapLevelToEnum(level: string): ApiLearningLevel {
  const upper = level.toUpperCase()
  if (upper.includes("ADVANCED")) return "ADVANCED"
  if (upper.includes("INTERMEDIATE")) return "INTERMEDIATE"
  return "BEGINNER"
}

function mapHoursToEnum(hours: number | string): ApiWeeklyHours {
  const num = typeof hours === "number" ? hours : parseInt(hours, 10)
  if (num <= 3) return "HOURS_1_TO_3"
  if (num <= 6) return "HOURS_4_TO_6"
  if (num <= 10) return "HOURS_7_TO_10"
  return "HOURS_10_PLUS"
}

function mapApiHierarchyToWorkspaceGoal(apiGoal: ApiGoalHierarchy): WorkspaceGoal {
  const levelFormatted =
    apiGoal.currentLevel.charAt(0) + apiGoal.currentLevel.slice(1).toLowerCase()

  let weeklyHoursNum = 10
  if (apiGoal.weeklyHours === "HOURS_1_TO_3") weeklyHoursNum = 2
  else if (apiGoal.weeklyHours === "HOURS_4_TO_6") weeklyHoursNum = 5
  else if (apiGoal.weeklyHours === "HOURS_7_TO_10") weeklyHoursNum = 8
  else if (apiGoal.weeklyHours === "HOURS_10_PLUS") weeklyHoursNum = 15

  const skills: WorkspaceSkill[] = (apiGoal.skills || []).map((s) => ({
    id: s.id,
    goalId: apiGoal.id,
    name: s.name,
    description: s.description ?? undefined,
    isExpanded: true,
    topics: (s.topics || []).map((t) => ({
      id: t.id,
      skillId: s.id,
      name: t.name,
      description: t.description ?? undefined,
      confidence: t.confidence as ConfidenceLevel,
      tasks: (t.tasks || []).map((tsk) => ({
        id: tsk.id,
        topicId: t.id,
        title: tsk.title,
        completed: tsk.completed,
        estimatedMinutes: tsk.estimatedMinutes ?? undefined,
      })),
    })),
  }))

  return hydrateGoalWithProgress({
    id: apiGoal.id,
    title: apiGoal.title,
    description: apiGoal.description ?? undefined,
    level: levelFormatted,
    weeklyHours: weeklyHoursNum,
    skills,
  })
}

const AppContext = React.createContext<AppContextType | null>(null)

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate()
  const { user: authUser, logout, isAuthenticated, updateUser } = useAuth()

  const [goals, setGoals] = React.useState<ApiLearningGoal[]>([])
  const [activeGoalId, setActiveGoalId] = React.useState<string | null>(null)
  const [goal, setGoal] = React.useState<WorkspaceGoal | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isError, setIsError] = React.useState(false)

  const user: UserProfile = React.useMemo(
    () => ({
      name: authUser?.name || "Student",
      email: authUser?.email || "",
      avatarUrl: authUser?.avatarUrl || null,
    }),
    [authUser]
  )

  // Fetch Goals
  const fetchGoals = React.useCallback(async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    setIsError(false)
    try {
      const userGoals = await goalsApi.getGoals()
      setGoals(userGoals)

      if (userGoals.length > 0) {
        setActiveGoalId((current) => {
          if (current && userGoals.some((g) => g.id === current)) {
            return current
          }
          return userGoals[0].id
        })
      } else {
        setActiveGoalId(null)
        setGoal(null)
      }
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // Fetch Active Goal Hierarchy
  const fetchActiveGoal = React.useCallback(async () => {
    if (!isAuthenticated || !activeGoalId) {
      setGoal(null)
      return
    }

    try {
      const hierarchy = await goalsApi.getGoalHierarchy(activeGoalId)
      const mapped = mapApiHierarchyToWorkspaceGoal(hierarchy)
      setGoal(mapped)
    } catch {
      setGoal(null)
    }
  }, [isAuthenticated, activeGoalId])

  // Mount effect: Fetch goals when authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      fetchGoals()
    } else {
      setGoals([])
      setActiveGoalId(null)
      setGoal(null)
    }
  }, [isAuthenticated, fetchGoals])

  // Effect: Fetch active goal hierarchy on activeGoalId change
  React.useEffect(() => {
    if (activeGoalId) {
      fetchActiveGoal()
    }
  }, [activeGoalId, fetchActiveGoal])

  // Profile update
  const updateProfile = async (data: { name: string; avatarUrl?: string | null }) => {
    await updateUser(data)
  }

  // Goal Creation
  const createGoal = async (data: {
    title: string
    currentLevel?: string
    weeklyHours?: number | string
    description?: string
  }): Promise<ApiLearningGoal> => {
    const payload = {
      title: data.title,
      description: data.description || null,
      currentLevel: mapLevelToEnum(data.currentLevel || "Beginner"),
      weeklyHours: mapHoursToEnum(data.weeklyHours || 10),
    }

    const created = await goalsApi.createGoal(payload)
    await fetchGoals()
    setActiveGoalId(created.id)
    return created
  }

  // Preferences update
  const updatePreferences = async (level: string, weeklyHours: number) => {
    if (!activeGoalId) return
    const payload = {
      currentLevel: mapLevelToEnum(level),
      weeklyHours: mapHoursToEnum(weeklyHours),
    }
    await goalsApi.updateGoal(activeGoalId, payload)
    await fetchActiveGoal()
  }

  // Toggle Task Completion
  const toggleTaskComplete = async (taskId: string, completed: boolean) => {
    if (!goal) return

    // Optimistic local update
    const updatedSkills = goal.skills.map((skill) => ({
      ...skill,
      topics: skill.topics.map((topic) => ({
        ...topic,
        tasks: topic.tasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        ),
      })),
    }))
    setGoal(hydrateGoalWithProgress({ ...goal, skills: updatedSkills }))

    try {
      await learningApi.updateTaskCompletion(taskId, completed)
      await fetchActiveGoal()
    } catch {
      // Rollback on error
      await fetchActiveGoal()
    }
  }

  // Update Topic Confidence
  const updateConfidence = async (
    topicId: string,
    confidence: ConfidenceLevel
  ) => {
    if (!goal) return

    // Optimistic local update
    const updatedSkills = goal.skills.map((skill) => ({
      ...skill,
      topics: skill.topics.map((topic) =>
        topic.id === topicId ? { ...topic, confidence } : topic
      ),
    }))
    setGoal(hydrateGoalWithProgress({ ...goal, skills: updatedSkills }))

    try {
      await learningApi.updateTopic(topicId, { confidence })
      await fetchActiveGoal()
    } catch {
      await fetchActiveGoal()
    }
  }

  // Skill CRUD
  const addSkill = async (data: { name: string; description?: string }) => {
    if (!activeGoalId) return
    await learningApi.createSkill(activeGoalId, data)
    await fetchActiveGoal()
  }

  const editSkill = async (
    skillId: string,
    data: { name: string; description?: string }
  ) => {
    await learningApi.updateSkill(skillId, data)
    await fetchActiveGoal()
  }

  const deleteSkill = async (skillId: string) => {
    await learningApi.deleteSkill(skillId)
    await fetchActiveGoal()
  }

  // Topic CRUD
  const addTopic = async (
    skillId: string,
    data: { name: string; description?: string }
  ) => {
    await learningApi.createTopic(skillId, data)
    await fetchActiveGoal()
  }

  const editTopic = async (
    topicId: string,
    data: { name: string; description?: string }
  ) => {
    await learningApi.updateTopic(topicId, data)
    await fetchActiveGoal()
  }

  const deleteTopic = async (topicId: string) => {
    await learningApi.deleteTopic(topicId)
    await fetchActiveGoal()
  }

  // Task CRUD
  const addTask = async (
    topicId: string,
    data: { title: string; estimatedMinutes?: number }
  ) => {
    await learningApi.createTask(topicId, data)
    await fetchActiveGoal()
  }

  const editTask = async (
    taskId: string,
    data: { title: string; estimatedMinutes?: number }
  ) => {
    await learningApi.updateTask(taskId, data)
    await fetchActiveGoal()
  }

  const deleteTask = async (taskId: string) => {
    await learningApi.deleteTask(taskId)
    await fetchActiveGoal()
  }

  // Sign out
  const signOut = () => {
    logout()
    navigate("/login")
  }

  return (
    <AppContext.Provider
      value={{
        user,
        goals,
        activeGoalId,
        goal,
        isLoading,
        isError,
        setActiveGoalId,
        refetchGoals: fetchGoals,
        refetchActiveGoal: fetchActiveGoal,
        createGoal,
        updateProfile,
        updatePreferences,
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
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextType {
  const context = React.useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider")
  }
  return context
}
