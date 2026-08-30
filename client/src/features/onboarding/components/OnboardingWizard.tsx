import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button, ProgressBar } from "@/components/ui"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { StepGoal } from "./StepGoal"
import { StepLevel } from "./StepLevel"
import { StepHours } from "./StepHours"
import { StepReview } from "./StepReview"
import { useAppContext } from "@/context/AppContext"
import type { OnboardingData, OnboardingStep } from "../onboarding.types"

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate()
  const { createGoal } = useAppContext()

  const [step, setStep] = React.useState<OnboardingStep>(1)
  const [data, setData] = React.useState<OnboardingData>({
    goalTitle: "Become a Full Stack Developer",
    customGoal: "",
    level: "Beginner",
    weeklyHours: 10,
  })

  const [isGenerating, setIsGenerating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const activeGoalTitle = data.customGoal.trim() || data.goalTitle

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as OnboardingStep)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as OnboardingStep)
    }
  }

  const handleComplete = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Create real learning goal in backend
      await createGoal({
        title: activeGoalTitle,
        currentLevel: data.level,
        weeklyHours: data.weeklyHours,
      })

      navigate("/dashboard")
    } catch {
      setError("Failed to create learning goal. Please try again.")
      setIsGenerating(false)
    }
  }

  const stepProgress = step * 25

  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
      {/* Step Progress Header */}
      <div className="space-y-2 border-b border-border/80 pb-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-primary font-bold">Step {step} of 4</span>
          <span className="text-muted-foreground">
            {step === 1 && "Goal Direction"}
            {step === 2 && "Experience Level"}
            {step === 3 && "Study Commitment"}
            {step === 4 && "Review & Launch"}
          </span>
        </div>
        <ProgressBar value={stepProgress} size="sm" />
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
          {error}
        </div>
      )}

      {/* Step Viewport */}
      <div className="min-h-[280px]">
        {step === 1 && (
          <StepGoal
            selectedGoal={data.goalTitle}
            customGoal={data.customGoal}
            onSelectTemplate={(title) =>
              setData((prev) => ({ ...prev, goalTitle: title, customGoal: "" }))
            }
            onChangeCustomGoal={(val) =>
              setData((prev) => ({ ...prev, customGoal: val, goalTitle: "custom" }))
            }
          />
        )}

        {step === 2 && (
          <StepLevel
            selectedLevel={data.level}
            onSelectLevel={(lvl) => setData((prev) => ({ ...prev, level: lvl }))}
          />
        )}

        {step === 3 && (
          <StepHours
            selectedHours={data.weeklyHours}
            onSelectHours={(hrs) => setData((prev) => ({ ...prev, weeklyHours: hrs }))}
          />
        )}

        {step === 4 && (
          <StepReview
            goalTitle={activeGoalTitle}
            level={data.level}
            weeklyHours={data.weeklyHours}
          />
        )}
      </div>

      {/* Navigation Actions Footer */}
      <div className="flex items-center justify-between border-t border-border/80 pt-5">
        <div>
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={isGenerating}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              disabled={isGenerating}
            >
              Skip
            </Button>
          )}
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleNext}
          isLoading={isGenerating}
          rightIcon={
            step === 4 ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )
          }
        >
          {step === 4 ? "Launch Workspace" : "Continue"}
        </Button>
      </div>
    </div>
  )
}

export default OnboardingWizard
