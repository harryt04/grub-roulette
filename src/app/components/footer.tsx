import { GitFork, Bug, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import DarkModeSwitch from './darkModeSwitch'

const Footer = () => {
  return (
    <div className="footer">
      <a
        href="https://buymeacoffee.com/harryt04"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="BuyMeACoffee"
        className={cn(buttonVariants({ variant: 'default' }), 'footer-button')}
      >
        <DollarSign className="mr-2 h-4 w-4" />
        Tip Jar
      </a>
      <a
        href="https://github.com/harryt04/grub-roulette"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className={cn(buttonVariants({ variant: 'outline' }), 'footer-button')}
      >
        <GitFork className="mr-2 h-4 w-4" />
        View source code
      </a>
      <a
        href="https://forms.gle/s4hxSSyAcMCyftmn9"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="BugReport"
        className={cn(buttonVariants({ variant: 'outline' }), 'footer-button')}
      >
        <Bug className="mr-2 h-4 w-4" />
        Report Issue / Feature Request
      </a>
      <DarkModeSwitch />
      <p className="footer-text text-sm">
        Your location data is never stored by GrubRoulette anywhere.
        GrubRoulette respects your privacy.
      </p>
    </div>
  )
}

export default Footer
