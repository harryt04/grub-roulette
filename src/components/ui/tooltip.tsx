'use client'

import * as React from 'react'
import * as SDK from '@ui-sdk/react/tooltip'

import { cn } from '@/lib/utils'

const Delay = React.createContext(0)
function TooltipProvider({
  delay = 0,
  children,
}: {
  delay?: number
  children?: React.ReactNode
}) {
  return <Delay value={delay}>{children}</Delay>
}
function Tooltip({ ...props }: React.ComponentProps<typeof SDK.Tooltip>) {
  return <SDK.Tooltip delay={React.useContext(Delay)} {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof SDK.TooltipTrigger>) {
  return <SDK.TooltipTrigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  side = 'top',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  children,
  ...props
}: Omit<React.ComponentProps<typeof SDK.TooltipContent>, 'children'> & {
  children?: React.ReactNode
}) {
  return (
    <SDK.TooltipContent
      align={align}
      side={side}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      data-slot="tooltip-content"
      className={cn(
        'z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
        className,
      )}
      {...props}
    >
      {children}
      <SDK.TooltipArrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
    </SDK.TooltipContent>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
