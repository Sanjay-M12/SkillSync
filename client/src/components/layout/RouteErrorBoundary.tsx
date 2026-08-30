import * as React from "react"
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom"
import { ErrorState, Button } from "@/components/ui"
import { PageContainer } from "./PageContainer"
import { Home } from "lucide-react"

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError()
  const navigate = useNavigate()

  let title = "Unexpected Application Error"
  let description = "An unexpected error occurred while rendering this page."

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`
    description = error.data?.message || "The requested page encountered a router error."
  } else if (error instanceof Error) {
    description = error.message
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <PageContainer maxWidth="sm">
        <ErrorState
          title={title}
          description={description}
          onRetry={() => window.location.reload()}
          retryLabel="Reload Page"
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/dashboard")}
              leftIcon={<Home className="h-3.5 w-3.5" />}
            >
              Back to Dashboard
            </Button>
          }
        />
      </PageContainer>
    </div>
  )
}

export default RouteErrorBoundary
