'use client'

import * as React from 'react'
import * as SDK from '@ui-sdk/react/dialog'

import { Portal } from './portal'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-react'

function Dialog({ ...props }: React.ComponentProps<typeof SDK.Dialog>) {
  return <SDK.Dialog data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof SDK.DialogTrigger>) {
  return <SDK.DialogTrigger data-slot="dialog-trigger" {...props} />
}

const DialogPortal = Portal

function DialogClose({
  ...props
}: React.ComponentProps<typeof SDK.DialogClose>) {
  return <SDK.DialogClose data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SDK.DialogBackdrop>) {
  return (
    <SDK.DialogBackdrop
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: Omit<React.ComponentProps<typeof SDK.DialogContent>, 'children'> & {
  children?: React.ReactNode
  showCloseButton?: boolean
}) {
  return (
    <>
      <DialogOverlay />
      <SDK.DialogContent
        data-slot="dialog-content"
        className={cn(
          'fixed inset-0 z-50 m-auto grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SDK.DialogClose
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </SDK.DialogClose>
        )}
      </SDK.DialogContent>
    </>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        '-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <SDK.DialogClose render={<Button variant="outline" />}>
          Close
        </SDK.DialogClose>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof SDK.DialogTitle>) {
  return (
    <SDK.DialogTitle
      data-slot="dialog-title"
      className={cn(
        'font-heading text-base leading-none font-medium',
        className,
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof SDK.DialogDescription>) {
  return (
    <SDK.DialogDescription
      data-slot="dialog-description"
      className={cn(
        'text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
