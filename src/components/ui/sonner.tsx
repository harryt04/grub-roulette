'use client'

import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  type ToastRegionProps,
} from '@ui-sdk/react/toast'
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const icons = {
  default: null,
  success: CircleCheckIcon,
  info: InfoIcon,
  warning: TriangleAlertIcon,
  error: OctagonXIcon,
  loading: Loader2Icon,
}

export function Toaster({ className, ...props }: ToastRegionProps) {
  return (
    <ToastRegion
      side="bottom"
      align="end"
      className={cn('toaster group', className)}
      {...props}
    >
      {({ type }) => {
        const Icon = icons[type]
        return (
          <Toast className="flex items-center gap-2 rounded-lg border border-border bg-popover p-4 text-sm text-popover-foreground shadow-lg">
            {Icon && <Icon aria-hidden="true" className="size-4" />}
            <div>
              <ToastTitle />
              <ToastDescription />
            </div>
            <ToastAction />
          </Toast>
        )
      }}
    </ToastRegion>
  )
}
