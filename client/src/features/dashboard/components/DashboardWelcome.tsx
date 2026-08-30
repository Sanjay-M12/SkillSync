import * as React from "react"

export interface DashboardWelcomeProps {
  userName: string
}

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({ userName }) => {
  const greeting = getTimeOfDayGreeting()

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {greeting}, {userName}
      </h1>
      <p className="text-xs text-muted-foreground sm:text-sm">
        Here&apos;s where you are in your learning journey.
      </p>
    </div>
  )
}

export default DashboardWelcome
