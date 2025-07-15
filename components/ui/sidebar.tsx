"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open],
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContext>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
})
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        className={cn("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-mobile="true"
          className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      ref={ref}
      className="group peer hidden md:block text-sidebar-foreground"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        className={cn(
          "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
        )}
      />
      <div
        className={cn(
          "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
        >
          {children}
        </div>
      </div>
    </div>
  )
})
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
      <Button
        ref={ref}
        data-sidebar="trigger"
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", className)}
        onClick={(event) => {
          onClick?.(event)
          toggleSidebar()
        }}
        {...props}
      >
        <PanelLeft />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    )
  },
)
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
      <button
        ref={ref}
        data-sidebar="rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        className={cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "group-data-[collapsible=offcanvas]:hidden",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarRail.displayName = "SidebarRail"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      ref={ref}
      data-state={state}
      className={cn(
        "flex items-center gap-2 p-4 text-sidebar-foreground",
        "group-data-[collapsible=icon]:justify-center",
        className,
      )}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarTitle = React.forwardRef<HTMLParagraphElement, React.ComponentProps<"p">>(
  ({ className, ...props }, ref) => {
    const { state } = useSidebar()

    return (
      <p
        ref={ref}
        data-state={state}
        className={cn("truncate text-lg font-semibold", "group-data-[collapsible=icon]:hidden", className)}
        {...props}
      />
    )
  },
)
SidebarTitle.displayName = "SidebarTitle"

const SidebarDescription = React.forwardRef<HTMLParagraphElement, React.ComponentProps<"p">>(
  ({ className, ...props }, ref) => {
    const { state } = useSidebar()

    return (
      <p
        ref={ref}
        data-state={state}
        className={cn("text-sm text-muted-foreground", "group-data-[collapsible=icon]:hidden", className)}
        {...props}
      />
    )
  },
)
SidebarDescription.displayName = "SidebarDescription"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      ref={ref}
      data-state={state}
      className={cn(
        "flex items-center gap-2 p-4 text-sidebar-foreground",
        "group-data-[collapsible=icon]:justify-center",
        className,
      )}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const sidebarItemVariants = cva(
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-accent hover:text-accent-foreground",
  {
    variants: {
      active: {
        true: "bg-accent text-accent-foreground",
      },
    },
  },
)

type SidebarItemProps = React.ComponentProps<typeof Slot> &
  VariantProps<typeof sidebarItemVariants> & {
    icon?: React.ReactNode
    label: string
    shortcut?: string
  }

const SidebarItem = React.forwardRef<HTMLDivElement, SidebarItemProps>(
  ({ active, icon, label, shortcut, className, ...props }, ref) => {
    const { state } = useSidebar()

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Slot
            ref={ref}
            data-state={state}
            className={cn(
              sidebarItemVariants({ active }),
              "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-3",
              className,
            )}
            {...props}
          >
            {icon && (
              <span
                data-state={state}
                className={cn(
                  "group-data-[collapsible=icon]:text-lg group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6",
                )}
              >
                {icon}
              </span>
            )}
            <span data-state={state} className={cn("group-data-[collapsible=icon]:hidden")}>
              {label}
            </span>
            {shortcut && (
              <span
                data-state={state}
                className={cn(
                  "ml-auto text-xs tracking-widest text-muted-foreground group-data-[collapsible=icon]:hidden",
                )}
              >
                {shortcut}
              </span>
            )}
          </Slot>
        </TooltipTrigger>
        {state === "collapsed" && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    )
  },
)
SidebarItem.displayName = "SidebarItem"

const SidebarItems = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("p-2", className)} {...props} />
})
SidebarItems.displayName = "SidebarItems"

const SidebarSection = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      ref={ref}
      data-state={state}
      className={cn("flex flex-col gap-2 p-2", "group-data-[collapsible=icon]:items-center", className)}
      {...props}
    />
  )
})
SidebarSection.displayName = "SidebarSection"

const SidebarSectionTitle = React.forwardRef<HTMLParagraphElement, React.ComponentProps<"p">>(
  ({ className, ...props }, ref) => {
    const { state } = useSidebar()

    return (
      <p
        ref={ref}
        data-state={state}
        className={cn(
          "text-xs font-semibold uppercase text-muted-foreground",
          "group-data-[collapsible=icon]:hidden",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarSectionTitle.displayName = "SidebarSectionTitle"

const SidebarSectionSeparator = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof Separator>>(
  ({ className, ...props }, ref) => {
    const { state } = useSidebar()

    return (
      <Separator
        ref={ref}
        data-state={state}
        className={cn("my-4", "group-data-[collapsible=icon]:w-1/2", className)}
        {...props}
      />
    )
  },
)
SidebarSectionSeparator.displayName = "SidebarSectionSeparator"

const SidebarButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & {
    icon?: React.ReactNode
    label: string
    shortcut?: string
  }
>(({ icon, label, shortcut, className, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={ref}
          data-state={state}
          className={cn(
            "flex w-full items-center gap-2",
            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
            className,
          )}
          {...props}
        >
          {icon && (
            <span
              data-state={state}
              className={cn(
                "group-data-[collapsible=icon]:text-lg group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6",
              )}
            >
              {icon}
            </span>
          )}
          <span data-state={state} className={cn("group-data-[collapsible=icon]:hidden")}>
            {label}
          </span>
          {shortcut && (
            <span
              data-state={state}
              className={cn(
                "ml-auto text-xs tracking-widest text-muted-foreground group-data-[collapsible=icon]:hidden",
              )}
            >
              {shortcut}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      {state === "collapsed" && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  )
})
SidebarButton.displayName = "SidebarButton"

const SidebarInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => {
    const { state } = useSidebar()

    return (
      <Input
        ref={ref}
        data-state={state}
        className={cn("group-data-[collapsible=icon]:hidden", "h-8", className)}
        {...props}
      />
    )
  },
)
SidebarInput.displayName = "SidebarInput"

const SidebarSkeleton = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof Skeleton>>(
  ({ className, ...props }, ref) => {
    const { state } = useSidebar()

    return (
      <Skeleton
        ref={ref}
        data-state={state}
        className={cn("group-data-[collapsible=icon]:hidden", "h-8 w-full", className)}
        {...props}
      />
    )
  },
)
SidebarSkeleton.displayName = "SidebarSkeleton"

export {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarHeader,
  SidebarTitle,
  SidebarDescription,
  SidebarFooter,
  SidebarItems,
  SidebarItem,
  SidebarSection,
  SidebarSectionTitle,
  SidebarSectionSeparator,
  SidebarButton,
  SidebarInput,
  SidebarSkeleton,
  useSidebar,
}
