export interface LevelOptionItem {
  value: string
  label: string
  description: string
}

export interface HoursOptionItem {
  value: number
  label: string
  description: string
}

export const LEVEL_OPTIONS: LevelOptionItem[] = [
  {
    value: "Beginner",
    label: "Beginner",
    description: "Starting from core fundamentals",
  },
  {
    value: "Intermediate",
    label: "Intermediate",
    description: "Comfortable with standard concepts",
  },
  {
    value: "Advanced",
    label: "Advanced",
    description: "Deepening specialized mastery",
  },
]

export const WEEKLY_HOURS_OPTIONS: HoursOptionItem[] = [
  {
    value: 3,
    label: "1–3 hours",
    description: "Light and casual pace",
  },
  {
    value: 6,
    label: "4–6 hours",
    description: "Steady consistent progress",
  },
  {
    value: 10,
    label: "7–10 hours",
    description: "Recommended for career growth",
  },
  {
    value: 15,
    label: "10+ hours",
    description: "Intensive dedicated study",
  },
]
