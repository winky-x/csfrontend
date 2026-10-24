"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { BrainIcon, ChevronDownIcon, DotIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, memo, useContext, useMemo } from "react";

interface ChainOfThoughtContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(
  null
);

const useChainOfThought = () => {
  const context = useContext(ChainOfThoughtContext);
  if (!context) {
    throw new Error(
      "ChainOfThought components must be used within ChainOfThought"
    );
  }
  return context;
};

export type ChainOfThoughtProps = ComponentProps<"div"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const ChainOfThought = memo(
  ({
    className,
    open,
    defaultOpen = false,
    onOpenChange,
    children,
    ...props
  }: ChainOfThoughtProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      defaultProp: defaultOpen,
      onChange: onOpenChange,
      prop: open,
    });

    const chainOfThoughtContext = useMemo(
      () => ({ isOpen, setIsOpen }),
      [isOpen, setIsOpen]
    );

    return (
      <ChainOfThoughtContext.Provider value={chainOfThoughtContext}>
        <div className={cn("not-prose w-full space-y-3", className)} {...props}>
          {children}
        </div>
      </ChainOfThoughtContext.Provider>
    );
  }
);

export type ChainOfThoughtHeaderProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  isGenerating?: boolean;
};

export const ChainOfThoughtHeader = memo(
  ({ className, children, isGenerating, ...props }: ChainOfThoughtHeaderProps) => {
    const { isOpen, setIsOpen } = useChainOfThought();

    return (
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3.5 py-2.5 text-zinc-300 text-xs font-mono transition-all hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-100 backdrop-blur-md shadow-sm",
            className
          )}
          {...props}
        >
          <div className="relative flex items-center justify-center">
            <BrainIcon className={cn("size-4 text-cyan-400", isGenerating && "animate-pulse")} />
            {isGenerating && (
              <span className="absolute -top-1 -right-1 flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-cyan-500"></span>
              </span>
            )}
          </div>
          <span className="flex-1 text-left font-medium tracking-wide">
            {children ?? "Chain of Thought"}
          </span>
          {isGenerating && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-mono">
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Thinking...
            </span>
          )}
          <ChevronDownIcon
            className={cn(
              "size-4 text-zinc-400 transition-transform duration-200",
              isOpen ? "rotate-180" : "rotate-0"
            )}
          />
        </CollapsibleTrigger>
      </Collapsible>
    );
  }
);

export type ChainOfThoughtStepProps = ComponentProps<"div"> & {
  icon?: LucideIcon;
  label: ReactNode;
  description?: ReactNode;
  status?: "complete" | "active" | "pending";
};

const stepStatusStyles = {
  active: "text-zinc-100",
  complete: "text-zinc-400",
  pending: "text-zinc-500/60",
};

export const ChainOfThoughtStep = memo(
  ({
    className,
    icon: Icon = DotIcon,
    label,
    description,
    status = "complete",
    children,
    ...props
  }: ChainOfThoughtStepProps) => (
    <div
      className={cn(
        "flex gap-3 text-xs font-mono",
        stepStatusStyles[status],
        "fade-in-0 slide-in-from-top-1 animate-in duration-200",
        className
      )}
      {...props}
    >
      <div className="relative mt-0.5 flex flex-col items-center">
        <div className={cn(
          "flex size-5 items-center justify-center rounded border bg-zinc-950",
          status === "active" ? "border-cyan-500 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]" :
          status === "complete" ? "border-zinc-700 text-emerald-400" :
          "border-zinc-800 text-zinc-600"
        )}>
          <Icon className="size-3" />
        </div>
        <div className="mt-1 h-full w-px bg-zinc-800/80" />
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden pb-3">
        <div className="font-medium text-zinc-200 leading-snug">{label}</div>
        {description && (
          <div className="text-zinc-400 text-[11px] leading-relaxed break-words bg-zinc-950/60 rounded p-2 border border-zinc-800/60">
            {description}
          </div>
        )}
        {children}
      </div>
    </div>
  )
);

export type ChainOfThoughtSearchResultsProps = ComponentProps<"div">;

export const ChainOfThoughtSearchResults = memo(
  ({ className, ...props }: ChainOfThoughtSearchResultsProps) => (
    <div
      className={cn("flex flex-wrap items-center gap-1.5 mt-1", className)}
      {...props}
    />
  )
);

export type ChainOfThoughtSearchResultProps = ComponentProps<typeof Badge>;

export const ChainOfThoughtSearchResult = memo(
  ({ className, children, ...props }: ChainOfThoughtSearchResultProps) => (
    <Badge
      className={cn("gap-1 px-2 py-0.5 font-normal text-[10px] bg-zinc-900 border-zinc-800 text-zinc-300", className)}
      variant="secondary"
      {...props}
    >
      {children}
    </Badge>
  )
);

export type ChainOfThoughtContentProps = ComponentProps<
  typeof CollapsibleContent
>;

export const ChainOfThoughtContent = memo(
  ({ className, children, ...props }: ChainOfThoughtContentProps) => {
    const { isOpen } = useChainOfThought();

    return (
      <Collapsible open={isOpen}>
        <CollapsibleContent
          className={cn(
            "mt-2 space-y-2 rounded-lg border border-zinc-800/60 bg-zinc-950/40 p-3.5 backdrop-blur-sm",
            "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
            className
          )}
          {...props}
        >
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  }
);

export type ChainOfThoughtImageProps = ComponentProps<"div"> & {
  caption?: string;
};

export const ChainOfThoughtImage = memo(
  ({ className, children, caption, ...props }: ChainOfThoughtImageProps) => (
    <div className={cn("mt-2 space-y-1.5", className)} {...props}>
      <div className="relative flex max-h-[18rem] items-center justify-center overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 p-2">
        {children}
      </div>
      {caption && <p className="text-zinc-500 text-[11px] font-mono">{caption}</p>}
    </div>
  )
);

ChainOfThought.displayName = "ChainOfThought";
ChainOfThoughtHeader.displayName = "ChainOfThoughtHeader";
ChainOfThoughtStep.displayName = "ChainOfThoughtStep";
ChainOfThoughtSearchResults.displayName = "ChainOfThoughtSearchResults";
ChainOfThoughtSearchResult.displayName = "ChainOfThoughtSearchResult";
ChainOfThoughtContent.displayName = "ChainOfThoughtContent";
ChainOfThoughtImage.displayName = "ChainOfThoughtImage";
