import type { WorkspaceGoal } from "./learning.types"
import { hydrateGoalWithProgress } from "./learning.utils"

export const rawInitialGoal: WorkspaceGoal = {
  id: "goal-1",
  title: "Become a Full Stack Developer",
  description: "A complete roadmap from frontend fundamentals to full-stack mastery.",
  level: "Beginner",
  weeklyHours: 10,
  skills: [
    {
      id: "skill-1",
      goalId: "goal-1",
      name: "HTML & CSS",
      description: "Core markup and modern responsive styling layouts.",
      isExpanded: true,
      topics: [
        {
          id: "topic-1-1",
          skillId: "skill-1",
          name: "Semantic HTML",
          description: "Understanding document structure and accessible tags.",
          confidence: "STRONG",
          tasks: [
            {
              id: "task-1-1-1",
              topicId: "topic-1-1",
              title: "Learn semantic structural elements (main, header, nav, section)",
              completed: true,
              estimatedMinutes: 30,
            },
            {
              id: "task-1-1-2",
              topicId: "topic-1-1",
              title: "Build a semantic and accessible webpage",
              completed: true,
              estimatedMinutes: 45,
            },
          ],
        },
        {
          id: "topic-1-2",
          skillId: "skill-1",
          name: "CSS Layout & Grid",
          description: "Mastering modern layout patterns with Flexbox and CSS Grid.",
          confidence: "STRONG",
          tasks: [
            {
              id: "task-1-2-1",
              topicId: "topic-1-2",
              title: "Master Flexbox alignment and main/cross axes",
              completed: true,
              estimatedMinutes: 45,
            },
            {
              id: "task-1-2-2",
              topicId: "topic-1-2",
              title: "Build modern responsive grid layouts with auto-fit",
              completed: true,
              estimatedMinutes: 45,
            },
          ],
        },
      ],
    },
    {
      id: "skill-2",
      goalId: "goal-1",
      name: "JavaScript",
      description: "Modern JavaScript (ES6+), async programming, and DOM APIs.",
      isExpanded: true,
      topics: [
        {
          id: "topic-2-1",
          skillId: "skill-2",
          name: "Fundamentals & Data Types",
          description: "Variables, primitives, reference types, and array methods.",
          confidence: "NEEDS_REVISION",
          tasks: [
            {
              id: "task-2-1-1",
              topicId: "topic-2-1",
              title: "Understand primitive vs reference types in memory",
              completed: true,
              estimatedMinutes: 30,
            },
            {
              id: "task-2-1-2",
              topicId: "topic-2-1",
              title: "Master array transformation methods (map, filter, reduce)",
              completed: true,
              estimatedMinutes: 45,
            },
          ],
        },
        {
          id: "topic-2-2",
          skillId: "skill-2",
          name: "Async JavaScript",
          description: "Event loop, Promises, async/await, and error handling.",
          confidence: "WEAK",
          tasks: [
            {
              id: "task-2-2-1",
              topicId: "topic-2-2",
              title: "Learn Promises and Promise chaining",
              completed: true,
              estimatedMinutes: 45,
            },
            {
              id: "task-2-2-2",
              topicId: "topic-2-2",
              title: "Understand async/await with a small API example",
              completed: false,
              estimatedMinutes: 45,
            },
            {
              id: "task-2-2-3",
              topicId: "topic-2-2",
              title: "Implement error handling with try/catch blocks",
              completed: false,
              estimatedMinutes: 30,
            },
          ],
        },
        {
          id: "topic-2-3",
          skillId: "skill-2",
          name: "Closures & Scope",
          description: "Lexical environment, closures, and variable hoisting.",
          confidence: "WEAK",
          tasks: [
            {
              id: "task-2-3-1",
              topicId: "topic-2-3",
              title: "Understand lexical scoping and closure retention",
              completed: false,
              estimatedMinutes: 40,
            },
            {
              id: "task-2-3-2",
              topicId: "topic-2-3",
              title: "Practice closure encapsulation patterns",
              completed: false,
              estimatedMinutes: 35,
            },
          ],
        },
      ],
    },
    {
      id: "skill-3",
      goalId: "goal-1",
      name: "React",
      description: "Declarative component-driven frontend architecture.",
      isExpanded: true,
      topics: [
        {
          id: "topic-3-1",
          skillId: "skill-3",
          name: "Components & Props",
          description: "JSX composition, props passing, and component structure.",
          confidence: "NOT_RATED",
          tasks: [
            {
              id: "task-3-1-1",
              topicId: "topic-3-1",
              title: "Build reusable functional components and typed props",
              completed: false,
              estimatedMinutes: 30,
            },
            {
              id: "task-3-1-2",
              topicId: "topic-3-1",
              title: "Master conditional rendering and list keys",
              completed: false,
              estimatedMinutes: 30,
            },
          ],
        },
        {
          id: "topic-3-2",
          skillId: "skill-3",
          name: "React Hooks",
          description: "State and lifecycle management with standard React hooks.",
          confidence: "NEEDS_REVISION",
          tasks: [
            {
              id: "task-3-2-1",
              topicId: "topic-3-2",
              title: "Master useState and component state",
              completed: true,
              estimatedMinutes: 30,
            },
            {
              id: "task-3-2-2",
              topicId: "topic-3-2",
              title: "Understand useEffect dependency array",
              completed: false,
              estimatedMinutes: 45,
            },
            {
              id: "task-3-2-3",
              topicId: "topic-3-2",
              title: "Build custom useLocalStorage hook",
              completed: false,
              estimatedMinutes: 45,
            },
          ],
        },
      ],
    },
    {
      id: "skill-4",
      goalId: "goal-1",
      name: "Node.js & Database",
      description: "Backend REST APIs, server logic, and relational databases.",
      isExpanded: false,
      topics: [
        {
          id: "topic-4-1",
          skillId: "skill-4",
          name: "Express REST APIs",
          description: "Setting up Express routing, middleware, and request validation.",
          confidence: "NOT_RATED",
          tasks: [
            {
              id: "task-4-1-1",
              topicId: "topic-4-1",
              title: "Setup Express router and global middleware pipeline",
              completed: false,
              estimatedMinutes: 45,
            },
            {
              id: "task-4-1-2",
              topicId: "topic-4-1",
              title: "Implement structured CRUD endpoints and input validation",
              completed: false,
              estimatedMinutes: 60,
            },
          ],
        },
        {
          id: "topic-4-2",
          skillId: "skill-4",
          name: "PostgreSQL & Prisma",
          description: "Database schemas, migrations, and type-safe Prisma client queries.",
          confidence: "NOT_RATED",
          tasks: [
            {
              id: "task-4-2-1",
              topicId: "topic-4-2",
              title: "Design relational database models and schema relationships",
              completed: false,
              estimatedMinutes: 45,
            },
            {
              id: "task-4-2-2",
              topicId: "topic-4-2",
              title: "Execute Prisma migrations and client database queries",
              completed: false,
              estimatedMinutes: 50,
            },
          ],
        },
      ],
    },
  ],
}

/**
 * Resolves initial workspace goal, factoring in onboarding customization if available.
 */
export function getInitialWorkspaceGoal(): WorkspaceGoal {
  try {
    const storedGoal = localStorage.getItem("skillsync_onboarding_goal")
    const storedLevel = localStorage.getItem("skillsync_onboarding_level")
    const storedHours = localStorage.getItem("skillsync_onboarding_hours")

    if (storedGoal || storedLevel || storedHours) {
      return hydrateGoalWithProgress({
        ...rawInitialGoal,
        title: storedGoal || rawInitialGoal.title,
        level: storedLevel || rawInitialGoal.level,
        weeklyHours: storedHours ? parseInt(storedHours, 10) : rawInitialGoal.weeklyHours,
      })
    }
  } catch {
    // Return default hydrated
  }

  return hydrateGoalWithProgress(rawInitialGoal)
}
