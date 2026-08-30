export interface GoalTemplateOption {
  id: string
  title: string
  description: string
  iconName: string
}

export const GOAL_TEMPLATES: GoalTemplateOption[] = [
  {
    id: "fullstack",
    title: "Become a Full Stack Developer",
    description: "HTML/CSS, JavaScript, React, Node.js, and relational databases",
    iconName: "Layers",
  },
  {
    id: "frontend",
    title: "Frontend React Specialist",
    description: "Advanced React, Next.js, state management, and modern CSS architecture",
    iconName: "Code",
  },
  {
    id: "backend",
    title: "Backend & Systems Engineer",
    description: "RESTful APIs, PostgreSQL, Node.js, authentication, and Docker",
    iconName: "Server",
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    description: "Array methods, trees, graphs, dynamic programming, and problem solving",
    iconName: "Cpu",
  },
]
