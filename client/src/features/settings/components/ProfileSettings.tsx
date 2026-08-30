import * as React from "react"
import { Button, FormField, Input } from "@/components/ui"
import { User, Mail, Check, AlertCircle, Camera, Trash2, Upload } from "lucide-react"
import { validateProfileName } from "../settings.validation"

export interface ProfileSettingsProps {
  initialName: string
  email: string
  avatarUrl?: string | null
  onSave: (data: { name: string; avatarUrl?: string | null }) => Promise<void>
}

/**
 * Resizes and compresses an image into a crisp, lightweight data URL
 */
function compressAvatar(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        // High quality JPEG output (~30KB-60KB)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.88)
        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error("Failed to process image"))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  initialName,
  email,
  avatarUrl: initialAvatarUrl,
  onSave,
}) => {
  const [name, setName] = React.useState(initialName)
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(initialAvatarUrl || null)
  const [error, setError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isProcessingPhoto, setIsProcessingPhoto] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    setName(initialName)
  }, [initialName])

  React.useEffect(() => {
    setAvatarUrl(initialAvatarUrl || null)
  }, [initialAvatarUrl])

  const userInitials = React.useMemo(() => {
    if (!name.trim()) return "ST"
    const parts = name.trim().split(" ")
    return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "ST"
  }, [name])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WEBP, or SVG).")
      return
    }

    setIsProcessingPhoto(true)
    setError(null)

    try {
      const compressed = await compressAvatar(file, 256)
      setAvatarUrl(compressed)
    } catch {
      setError("Could not process image. Please try a different photo.")
    } finally {
      setIsProcessingPhoto(false)
    }
  }

  const handleRemovePhoto = () => {
    setAvatarUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateProfileName(name)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await onSave({ name: name.trim(), avatarUrl })
      setSuccessMessage("Profile updated successfully")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update profile. Please try again."
      setError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="space-y-0.5 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-base font-bold text-foreground">Profile Information</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Manage your personal details, profile photo, and account identity
        </p>
      </div>

      {/* Avatar Upload / Selection Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl border border-border/80 bg-muted/20">
        <div className="relative group">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name || "User Avatar"}
              className="h-16 w-16 rounded-full object-cover border-2 border-primary shadow-sm"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-primary/10 text-lg font-bold text-primary shadow-xs select-none">
              {userInitials}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95 cursor-pointer"
            title="Upload photo"
            aria-label="Upload photo"
          >
            <Camera className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-2 flex-1">
          <div>
            <p className="text-xs font-semibold text-foreground">Profile Photo</p>
            <p className="text-[11px] text-muted-foreground">
              Upload a JPG, PNG, or WEBP image to personalize your account across SkillSync.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isProcessingPhoto}
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<Upload className="h-3.5 w-3.5" />}
            >
              Upload Photo
            </Button>

            {avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePhoto}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4 max-w-lg">
        {/* Success Alert */}
        {successMessage && (
          <div
            className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 animate-in fade-in-0"
            role="status"
          >
            <Check className="h-4 w-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive animate-in fade-in-0"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Full Name */}
        <FormField label="Full Name" htmlFor="profile-name" required error={error || undefined}>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            placeholder="John Doe"
            disabled={isSaving}
            autoComplete="name"
            leftIcon={<User className="h-4 w-4" />}
          />
        </FormField>

        {/* Email */}
        <FormField
          label="Email Address"
          htmlFor="profile-email"
          helperText="Your registered SkillSync account email"
        >
          <Input
            id="profile-email"
            value={email}
            readOnly
            disabled
            className="bg-muted/50 cursor-not-allowed opacity-80"
            leftIcon={<Mail className="h-4 w-4" />}
          />
        </FormField>

        {/* Save Button */}
        <div className="pt-2">
          <Button type="submit" size="sm" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ProfileSettings
