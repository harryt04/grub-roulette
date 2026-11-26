'use client'

import { Button as ButtonPrimitive } from '@ui-sdk/react/button'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

import { buttonVariants } from '@/lib/button-variants'

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ComponentProps<typeof ButtonPrimitive> &
  VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
export { Button, buttonVariants }
