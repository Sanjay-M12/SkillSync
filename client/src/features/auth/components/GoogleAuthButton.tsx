import * as React from "react"
import { GoogleLogin, CredentialResponse } from "@react-oauth/google"
import { Loader2 } from "lucide-react"

export interface GoogleAuthButtonProps {
  onSuccess: (credential: string) => void
  onError?: (error: string) => void
  text?: "signin_with" | "signup_with" | "continue_with"
  isLoading?: boolean
  width?: string
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  text = "continue_with",
  isLoading = false,
  width = "100%",
}) => {
  const handleCredentialResponse = (response: CredentialResponse) => {
    if (response.credential) {
      onSuccess(response.credential)
    } else {
      onError?.("No credential token received from Google.")
    }
  }

  const handleCustomError = () => {
    onError?.("Google authentication was canceled or encountered an error.")
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[44px]">
      {isLoading ? (
        <div className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-medium text-muted-foreground shadow-2xs">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Authenticating with Google...</span>
        </div>
      ) : (
        <div className="w-full flex justify-center [&>div]:!w-full [&>div>div]:!w-full [&_iframe]:!w-full">
          <GoogleLogin
            onSuccess={handleCredentialResponse}
            onError={handleCustomError}
            theme="outline"
            size="large"
            text={text}
            shape="rectangular"
            logo_alignment="left"
            width={width}
          />
        </div>
      )}
    </div>
  )
}

export default GoogleAuthButton
