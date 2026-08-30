import * as React from "react"
import { Button } from "@/components/ui"
import { LogOut, ShieldAlert } from "lucide-react"

export interface AccountActionsProps {
  onSignOut: () => void
}

export const AccountActions: React.FC<AccountActionsProps> = ({
  onSignOut,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="space-y-0.5 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <h3 className="text-base font-bold text-foreground">Account Actions</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Manage your account session and security
        </p>
      </div>

      <div className="space-y-4">
        {/* Sign Out Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border/80 bg-muted/20 p-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <LogOut className="h-4 w-4 text-rose-500" />
              Sign Out
            </h4>
            <p className="text-xs text-muted-foreground max-w-md">
              Securely log out of your current account session on this device.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSignOut}
            className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AccountActions
