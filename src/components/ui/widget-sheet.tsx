
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const WidgetSheet = SheetPrimitive.Root

const WidgetSheetTrigger = SheetPrimitive.Trigger

const WidgetSheetClose = SheetPrimitive.Close

// Fully transparent overlay that doesn't darken the background
const WidgetSheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-transparent data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
WidgetSheetOverlay.displayName = "WidgetSheetOverlay"

const widgetSheetVariants = cva(
  "fixed z-50 bg-background shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-100 data-[state=open]:duration-100",
  {
    variants: {
      position: {
        center: "left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 rounded-lg data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      position: "center",
    },
  }
)

interface WidgetSheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof widgetSheetVariants> {
  hideCloseButton?: boolean;
}

const WidgetSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  WidgetSheetContentProps
>(({ position = "center", className, children, hideCloseButton = false, ...props }, ref) => {
  const isMobile = useIsMobile();
  const mobilePosition = isMobile ? "center" : position;
  
  return (
    <SheetPrimitive.Portal>
      <WidgetSheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          widgetSheetVariants({ position: mobilePosition }),
          className,
          isMobile ? "max-w-[95%] max-h-[90vh] overflow-auto" : "",
          !isMobile ? "max-w-[400px] max-h-[85vh] overflow-auto" : ""
        )}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
})
WidgetSheetContent.displayName = "WidgetSheetContent"

// Add keyframes to the global stylesheet
const injectKeyframes = () => {
  if (typeof document !== "undefined") {
    const styleId = "widget-sheet-keyframes";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        @keyframes zoom-in-95 {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes zoom-out-95 {
          from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          to { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
        }
      `;
      document.head.appendChild(style);
    }
  }
};

// Run once on import
injectKeyframes();

export {
  WidgetSheet,
  WidgetSheetTrigger,
  WidgetSheetClose,
  WidgetSheetOverlay,
  WidgetSheetContent,
}
