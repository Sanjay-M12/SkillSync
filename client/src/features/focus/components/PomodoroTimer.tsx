import * as React from "react"
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui"
import { focusApi, FocusStats } from "@/services/focus.api"
import { useAppContext } from "@/context/AppContext"

type TimerMode = "POMODORO" | "SHORT_BREAK" | "LONG_BREAK"

const MODE_CONFIGS = {
  POMODORO: { label: "Focus Session", minutes: 25, color: "text-primary" },
  SHORT_BREAK: { label: "Short Break", minutes: 5, color: "text-emerald-500" },
  LONG_BREAK: { label: "Long Break", minutes: 15, color: "text-blue-500" },
}

export interface PomodoroTimerProps {
  initialTaskId?: string
  initialTopicId?: string
  onSessionLogged?: () => void
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  initialTaskId,
  initialTopicId,
  onSessionLogged,
}) => {
  const { goal, toggleTaskComplete } = useAppContext()

  const [mode, setMode] = React.useState<TimerMode>("POMODORO")
  const [timeLeftSeconds, setTimeLeftSeconds] = React.useState<number>(25 * 60)
  const [isRunning, setIsRunning] = React.useState<boolean>(false)
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true)
  const [selectedTaskId, setSelectedTaskId] = React.useState<string>(initialTaskId || "")
  const [focusStats, setFocusStats] = React.useState<FocusStats | null>(null)
  const [isLoggedModalOpen, setIsLoggedModalOpen] = React.useState<boolean>(false)
  const [lastLoggedMinutes, setLastLoggedMinutes] = React.useState<number>(25)

  // Audio tone generator using Web Audio API
  const playChime = React.useCallback(() => {
    if (!soundEnabled) return
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15) // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.6)
    } catch {
      // Audio not permitted or supported
    }
  }, [soundEnabled])

  // Fetch initial stats
  const fetchStats = React.useCallback(async () => {
    try {
      const stats = await focusApi.getFocusStats()
      setFocusStats(stats)
    } catch {
      // Handled
    }
  }, [])

  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Flatten available tasks from goal
  const availableTasks = React.useMemo(() => {
    if (!goal) return []
    return goal.skills.flatMap((s) =>
      s.topics.flatMap((t) =>
        (t.tasks || []).map((task) => ({
          id: task.id,
          title: task.title,
          skillName: s.name,
          topicName: t.name,
          topicId: t.id,
          completed: task.completed,
        }))
      )
    )
  }, [goal])

  // Switch timer mode
  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    setIsRunning(false)
    setTimeLeftSeconds(MODE_CONFIGS[newMode].minutes * 60)
  }

  // Handle Session Completion
  const handleSessionComplete = React.useCallback(async () => {
    playChime()
    setIsRunning(false)

    if (mode === "POMODORO") {
      const duration = MODE_CONFIGS.POMODORO.minutes
      setLastLoggedMinutes(duration)

      try {
        const matchingTask = availableTasks.find((t) => t.id === selectedTaskId)
        await focusApi.logSession({
          durationMinutes: duration,
          taskId: selectedTaskId || undefined,
          topicId: matchingTask?.topicId || initialTopicId || undefined,
        })
        await fetchStats()
        if (onSessionLogged) onSessionLogged()
        setIsLoggedModalOpen(true)
      } catch {
        // Handled
      }
    }

    // Auto transition to break if finished pomodoro
    if (mode === "POMODORO") {
      switchMode("SHORT_BREAK")
    } else {
      switchMode("POMODORO")
    }
  }, [mode, playChime, availableTasks, selectedTaskId, initialTopicId, fetchStats, onSessionLogged])

  // Timer Tick Interval
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval!)
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, handleSessionComplete])

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeftSeconds(MODE_CONFIGS[mode].minutes * 60)
  }

  // Formatting minutes:seconds
  const minutes = Math.floor(timeLeftSeconds / 60)
  const seconds = timeLeftSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  const totalDuration = MODE_CONFIGS[mode].minutes * 60
  const progressPercent = Math.round(((totalDuration - timeLeftSeconds) / totalDuration) * 100)

  const activeTask = availableTasks.find((t) => t.id === selectedTaskId)

  return (
    <div className="rounded-2xl border border-primary/20 bg-linear-to-b from-card via-card to-primary/5 p-4 sm:p-5 shadow-sm space-y-3.5 max-w-lg mx-auto text-center relative overflow-hidden">
      {/* Background ambient ring glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center gap-1 rounded-full bg-muted/60 p-1 text-xs max-w-xs mx-auto">
        <button
          type="button"
          onClick={() => switchMode("POMODORO")}
          className={`rounded-full px-3 py-1 font-semibold transition-all ${
            mode === "POMODORO"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          🍅 Focus (25m)
        </button>
        <button
          type="button"
          onClick={() => switchMode("SHORT_BREAK")}
          className={`rounded-full px-3 py-1 font-semibold transition-all ${
            mode === "SHORT_BREAK"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ☕ Break (5m)
        </button>
        <button
          type="button"
          onClick={() => switchMode("LONG_BREAK")}
          className={`rounded-full px-3 py-1 font-semibold transition-all ${
            mode === "LONG_BREAK"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          🌴 Long (15m)
        </button>
      </div>

      {/* Circular Progress & Digital Countdown - Compact Sleek Scale */}
      <div className="relative flex flex-col items-center justify-center my-1">
        <div className="relative flex items-center justify-center">
          {/* SVG Progress Circle */}
          <svg className="h-40 w-40 -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              className="text-muted/40"
              strokeWidth="5"
              stroke="currentColor"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
            <circle
              className="text-primary transition-all duration-1000 ease-linear"
              strokeWidth="5"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-mono text-4xl font-extrabold tracking-tight text-foreground">
              {formattedTime}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider">
              {MODE_CONFIGS[mode].label}
            </span>
          </div>
        </div>
      </div>

      {/* Task Linker Dropdown - Compact */}
      <div className="space-y-1 max-w-sm mx-auto text-left">
        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-primary" />
            <span>Link Focus Task:</span>
          </span>
          {activeTask && (
            <span className="text-[10px] text-primary truncate max-w-[160px]">
              {activeTask.topicName}
            </span>
          )}
        </div>
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-2xs"
        >
          <option value="">-- General Study (No Specific Task) --</option>
          {availableTasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.completed ? "✓ " : ""}{t.title} ({t.skillName} › {t.topicName})
            </option>
          ))}
        </select>
      </div>

      {/* Control Buttons - Compact */}
      <div className="flex items-center justify-center gap-2.5 pt-1">
        <Button
          size="md"
          variant={isRunning ? "outline" : "primary"}
          onClick={() => setIsRunning(!isRunning)}
          leftIcon={isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          className="w-32 font-bold shadow-xs h-9"
        >
          {isRunning ? "Pause" : "Start Focus"}
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={resetTimer}
          title="Reset Timer"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={handleSessionComplete}
          title="Skip / Finish Interval"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <SkipForward className="h-3.5 w-3.5" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Mute Sound" : "Enable Chime"}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-primary" /> : <VolumeX className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Focus Daily Stats Footer - Compact */}
      {focusStats && (
        <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-border/70 text-xs">
          <div className="rounded-lg bg-muted/30 px-2.5 py-1.5">
            <span className="text-muted-foreground text-[10px]">Today&apos;s Focus</span>
            <p className="text-xs font-bold text-foreground">
              {focusStats.todayMinutes}m ({focusStats.todaySessions} sessions)
            </p>
          </div>

          <div className="rounded-lg bg-muted/30 px-2.5 py-1.5">
            <span className="text-muted-foreground text-[10px]">Total Logged</span>
            <p className="text-xs font-bold text-primary">
              {(focusStats.totalMinutes / 60).toFixed(1)}h ({focusStats.totalSessions} sessions)
            </p>
          </div>
        </div>
      )}

      {/* Session Completed Modal */}
      {isLoggedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xl max-w-xs w-full text-center space-y-3 animate-in zoom-in-95">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 ring-4 ring-emerald-500/10">
              <Sparkles className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Focus Session Complete! 🎉</h3>
              <p className="text-xs text-muted-foreground">
                You logged <strong>{lastLoggedMinutes} mins</strong> of deep work. Streak updated!
              </p>
            </div>

            {selectedTaskId && activeTask && !activeTask.completed && (
              <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-left space-y-1.5">
                <p className="text-xs font-semibold text-foreground truncate">
                  Task: {activeTask.title}
                </p>
                <Button
                  size="sm"
                  onClick={async () => {
                    await toggleTaskComplete(selectedTaskId, true)
                    setIsLoggedModalOpen(false)
                  }}
                  leftIcon={<Check className="h-3.5 w-3.5" />}
                  className="w-full text-xs"
                >
                  Mark Task Complete
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLoggedModalOpen(false)}
              className="w-full text-xs"
            >
              Continue Break
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PomodoroTimer
