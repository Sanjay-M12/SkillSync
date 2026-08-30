import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppShell, ProtectedRoute, RouteErrorBoundary } from "@/components/layout"
import { LandingPage } from "@/pages/public/LandingPage"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { OnboardingPage } from "@/pages/app/OnboardingPage"
import { DashboardPage } from "@/pages/app/DashboardPage"
import { LearningPage } from "@/pages/app/LearningPage"
import { AnalyticsPage } from "@/pages/app/AnalyticsPage"
import { FocusPage } from "@/pages/app/FocusPage"
import { AchievementsPage } from "@/pages/app/AchievementsPage"
import { KnowledgePage } from "@/pages/app/KnowledgePage"
import { SettingsPage } from "@/pages/app/SettingsPage"

export const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <RouteErrorBoundary />,
  },

  // Authenticated Protected Routes
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/onboarding",
        element: <OnboardingPage />,
      },
      {
        element: <AppShell />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/learning",
            element: <LearningPage />,
          },
          {
            path: "/knowledge",
            element: <KnowledgePage />,
          },
          {
            path: "/focus",
            element: <FocusPage />,
          },
          {
            path: "/achievements",
            element: <AchievementsPage />,
          },
          {
            path: "/analytics",
            element: <AnalyticsPage />,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },


  // Fallback Catch-All
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])

export default router
