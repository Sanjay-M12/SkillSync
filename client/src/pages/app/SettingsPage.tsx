import * as React from "react"
import { PageContainer, PageHeader } from "@/components/layout"
import { useAppContext } from "@/context/AppContext"
import {
  ProfileSettings,
  LearningPreferences,
  ThemeSettings,
  AccountActions,
} from "@/features/settings"
import { Check } from "lucide-react"

export const SettingsPage: React.FC = () => {
  const {
    user,
    goal,
    updateProfile,
    updatePreferences,
    signOut,
  } = useAppContext()

  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 3000)
  }

  const handleSavePreferences = async (level: string, weeklyHours: number) => {
    await updatePreferences(level, weeklyHours)
    showToast("Learning preferences updated successfully")
  }

  return (
    <PageContainer maxWidth="md" className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Settings"
        description="Manage your profile, theme, and learning preferences."
      />

      {/* Toast Notification */}
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

      <div className="space-y-6 animate-in fade-in-0 duration-200">
        {/* Section 1 — Profile */}
        <ProfileSettings
          initialName={user.name}
          email={user.email}
          avatarUrl={user.avatarUrl}
          onSave={updateProfile}
        />

        {/* Section 2 — Appearance & Theme */}
        <ThemeSettings />

        {/* Section 3 — Learning Preferences */}
        <LearningPreferences
          initialLevel={goal?.level || "Beginner"}
          initialHours={goal?.weeklyHours || 10}
          onSave={handleSavePreferences}
        />

        {/* Section 4 — Account Actions */}
        <AccountActions onSignOut={signOut} />
      </div>
    </PageContainer>
  )
}

export default SettingsPage
