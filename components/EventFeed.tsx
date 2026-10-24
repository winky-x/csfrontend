"use client";

import React, { memo, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Brain, 
  Cpu, 
  Terminal, 
  ChevronRight, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Copy, 
  Check, 
  Sparkles, 
  FileText, 
  Eye, 
  ChevronDown,
  Wrench,
  Search,
  Radar
} from "lucide-react";
import { StreamEvent, EventType, AgentName } from "@/types/osint";
import { 
  ChainOfThought, 
  ChainOfThoughtHeader, 
  ChainOfThoughtContent, 
  ChainOfThoughtStep 
} from "@/components/ui/chain-of-thought";
import { Confirmation } from "@/components/ui/confirmation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EventFeedProps {
  events: StreamEvent[];
  isStreaming: boolean;
  onToolDecision: (toolId: string, decision: "accepted" | "rejected") => void;
  onQuickScenario?: (scenarioId: string) => void;
}

// Markdown Dossier Viewer component
function DossierReportCard({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-zinc-950/95 shadow-2xl backdrop-blur-md overflow-hidden relative">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-emerald-950/20">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <FileText className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-zinc-100 uppercase tracking-wide">
                Final Intelligence Dossier
              </span>
              <Badge variant="default" className="text-[10px] tracking-wider font-mono flex items-center gap-1 bg-emerald-950/80 border-emerald-500/40 text-emerald-300">
                <Check className="size-3" />
                <span>VERIFIED</span>
              </Badge>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              Synthesized by Master Coordinator • Anti-Hallucination Gate Passed
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:text-zinc-100 text-zinc-400 transition-colors cursor-pointer"
          title="Copy markdown to clipboard"
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          <span>{copied ? "Copied" : "Copy Dossier"}</span>
        </button>
      </div>

      <div className="p-4 text-xs font-sans text-zinc-200 leading-relaxed max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ ...props }) => <h1 className="text-base font-mono font-bold text-zinc-100 mb-2 mt-3 pb-1 border-b border-zinc-800" {...props} />,
            h2: ({ ...props }) => <h2 className="text-sm font-mono font-bold text-cyan-300 mb-2 mt-4" {...props} />,
            h3: ({ ...props }) => <h3 className="text-xs font-mono font-bold text-emerald-300 mb-1.5 mt-3 uppercase tracking-wider" {...props} />,
            h4: ({ ...props }) => <h4 className="text-xs font-mono font-semibold text-zinc-200 mb-1 mt-2.5" {...props} />,
            p: ({ ...props }) => <p className="mb-2.5 leading-relaxed text-zinc-300" {...props} />,
            ul: ({ ...props }) => <ul className="list-disc pl-4 mb-2.5 space-y-1 text-zinc-300 font-mono text-[11px]" {...props} />,
            ol: ({ ...props }) => <ol className="list-decimal pl-4 mb-2.5 space-y-1 text-zinc-300 font-mono text-[11px]" {...props} />,
            li: ({ ...props }) => <li className="leading-snug" {...props} />,
            strong: ({ ...props }) => <strong className="font-semibold text-zinc-100" {...props} />,
            code: ({ ...props }) => <code className="bg-zinc-900/90 text-cyan-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-zinc-800" {...props} />,
            table: ({ ...props }) => (
              <div className="overflow-x-auto my-3 rounded-lg border border-zinc-800 bg-zinc-950/60 shadow-inner">
                <table className="w-full text-left font-mono text-[11px] divide-y divide-zinc-800" {...props} />
              </div>
            ),
            thead: ({ ...props }) => <thead className="bg-zinc-900/80 text-zinc-300 font-semibold uppercase text-[10px]" {...props} />,
            tbody: ({ ...props }) => <tbody className="divide-y divide-zinc-800/60" {...props} />,
            tr: ({ ...props }) => <tr className="hover:bg-zinc-900/40 transition-colors" {...props} />,
            th: ({ ...props }) => <th className="px-3 py-2 text-zinc-400 font-bold tracking-wider" {...props} />,
            td: ({ ...props }) => <td className="px-3 py-2 text-zinc-300" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

// Tool Execution Card component
function ToolExecutionCard({
  event,
  onToolDecision,
}: {
  event: StreamEvent;
  onToolDecision: (toolId: string, decision: "accepted" | "rejected") => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      {/* If tool approval request is present, render the clean Confirmation component */}
      {event.approval && (
        <Confirmation
          request={event.approval}
          onAccept={(id) => onToolDecision(id, "accepted")}
          onReject={(id) => onToolDecision(id, "rejected")}
        />
      )}

      {/* Main Tool Execution Card */}
      <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm p-3 transition-all hover:border-zinc-700 font-mono text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
              <Wrench className="size-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-200">
                  Tool: <code className="text-cyan-300">{event.tool_name || "GenericTool"}</code>
                </span>
                <span className="text-[10px] text-zinc-500">[{event.agent_name}]</span>
              </div>
              {event.content && typeof event.content === "string" && (
                <div className="text-[11px] text-zinc-400 mt-0.5">{event.content}</div>
              )}
            </div>
          </div>

          {(event.tool_args || event.tool_output) && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded bg-zinc-950/60 border border-zinc-800/60 cursor-pointer"
            >
              <span>{isOpen ? "Hide Telemetry" : "View I/O"}</span>
              <ChevronDown className={cn("size-3 transition-transform", isOpen && "rotate-180")} />
            </button>
          )}
        </div>

        {/* Collapsible I/O telemetry details */}
        {isOpen && (
          <div className="mt-3 pt-2.5 border-t border-zinc-800/60 space-y-2">
            {event.tool_args && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">
                  Parameters / Payload:
                </span>
                <pre className="p-2 rounded bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-cyan-200/90 overflow-x-auto">
                  {JSON.stringify(event.tool_args, null, 2)}
                </pre>
              </div>
            )}

            {event.tool_output && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">
                  Return Telemetry:
                </span>
                <pre className="p-2 rounded bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-emerald-300/90 overflow-x-auto">
                  {JSON.stringify(event.tool_output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Multi-Agent Handoff Banner component
function HandoffBanner({ event }: { event: StreamEvent }) {
  const fromAgent = event.handoff_from || "Master Coordinator";
  const toAgent = event.handoff_to || event.agent_name || "SubAgent";
  const reason = event.handoff_reason || event.content || "Delegating tactical intelligence tasks";

  return (
    <div className="rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-zinc-900/60 to-zinc-950/80 p-3 backdrop-blur-md shadow-sm font-mono text-xs">
      <div className="flex items-center gap-2 text-cyan-300 mb-1">
        <Layers className="size-3.5 text-cyan-400" />
        <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
          Autonomous Agent Handoff
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-zinc-200">
        <Badge variant="secondary" className="bg-zinc-900 border-zinc-700 text-zinc-300 font-semibold">
          {fromAgent}
        </Badge>
        <div className="flex items-center text-cyan-400 px-1">
          <ArrowRight className="size-3.5 animate-pulse" />
        </div>
        <Badge variant="cyber" className="bg-cyan-950 border-cyan-500/40 text-cyan-300 font-semibold">
          {toAgent}
        </Badge>
      </div>

      <p className="text-[11px] text-zinc-300 mt-2 font-mono bg-zinc-950/60 p-2 rounded border border-zinc-800/60">
        &ldquo;{reason}&rdquo;
      </p>
    </div>
  );
}

export const EventFeed = memo(
  ({ events, isStreaming, onToolDecision, onQuickScenario }: EventFeedProps) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest updates
    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [events.length, isStreaming]);

    // Empty state
    if (events.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
          <div className="relative mb-4 flex items-center justify-center">
            <div className="size-16 rounded-full border border-cyan-500/20 bg-cyan-950/20 flex items-center justify-center animate-pulse">
              <Radar className="size-8 text-cyan-400" />
            </div>
            <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-ping opacity-30" />
          </div>

          <h3 className="font-mono text-sm font-bold text-zinc-200 uppercase tracking-widest mb-1">
            Reconnaissance Pipeline Idle
          </h3>
          <p className="font-mono text-xs text-zinc-400 max-w-md leading-relaxed mb-6">
            Autonomous multi-agent system standing by. Dispatch target query, upload visual asset, or launch one of the benchmark intelligence workflows below:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl w-full">
            <button
              type="button"
              onClick={() => onQuickScenario?.("scenario-gym-imint")}
              className="flex flex-col text-left p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-cyan-500/40 transition-all cursor-pointer group"
            >
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1">
                Scenario 1
              </span>
              <span className="font-mono text-xs text-zinc-200 group-hover:text-cyan-300 font-semibold mb-1">
                Gym IMINT ➔ Person Pivot
              </span>
              <span className="text-[11px] text-zinc-400 leading-snug">
                Photo geolocation, OCR machinery brand, social check-in schedule.
              </span>
            </button>

            <button
              type="button"
              onClick={() => onQuickScenario?.("scenario-social-resolution")}
              className="flex flex-col text-left p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-cyan-500/40 transition-all cursor-pointer group"
            >
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1">
                Scenario 2
              </span>
              <span className="font-mono text-xs text-zinc-200 group-hover:text-cyan-300 font-semibold mb-1">
                Private Social Resolution
              </span>
              <span className="text-[11px] text-zinc-400 leading-snug">
                Handle entropy, PGP signature verification, cross-forum linkage.
              </span>
            </button>

            <button
              type="button"
              onClick={() => onQuickScenario?.("scenario-domain-attack-surface")}
              className="flex flex-col text-left p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-cyan-500/40 transition-all cursor-pointer group"
            >
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1">
                Scenario 3
              </span>
              <span className="font-mono text-xs text-zinc-200 group-hover:text-cyan-300 font-semibold mb-1">
                Domain Attack Surface
              </span>
              <span className="text-[11px] text-zinc-400 leading-snug">
                Passive CT logs, dangling subdomains, Jenkins cluster leak audit.
              </span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {events.map((event, idx) => {
          const isLatest = idx === events.length - 1;

          if (event.event_type === "thought") {
            const content = event.content || {};
            const title = typeof content === "string" ? content : content.title || "Agent Cognitive Reasoning";
            const steps = Array.isArray(content.steps) ? content.steps : [];

            return (
              <ChainOfThought key={event.id} defaultOpen={true}>
                <ChainOfThoughtHeader isGenerating={isStreaming && isLatest}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">{title}</span>
                    <span className="text-[10px] text-zinc-500">[{event.agent_name}]</span>
                  </div>
                </ChainOfThoughtHeader>
                <ChainOfThoughtContent>
                  {steps.length > 0 ? (
                    steps.map((st: any, sIdx: number) => (
                      <ChainOfThoughtStep
                        key={sIdx}
                        label={st.label}
                        description={st.desc}
                        status={st.status || "complete"}
                      />
                    ))
                  ) : (
                    <div className="text-xs font-mono text-zinc-300 p-2">
                      {typeof event.content === "string" ? event.content : JSON.stringify(event.content)}
                    </div>
                  )}
                </ChainOfThoughtContent>
              </ChainOfThought>
            );
          }

          if (event.event_type === "agent_handoff") {
            return <HandoffBanner key={event.id} event={event} />;
          }

          if (event.event_type === "tool_call" || event.event_type === "tool_result") {
            return (
              <ToolExecutionCard
                key={event.id}
                event={event}
                onToolDecision={onToolDecision}
              />
            );
          }

          if (event.event_type === "report") {
            return (
              <DossierReportCard
                key={event.id}
                content={typeof event.content === "string" ? event.content : JSON.stringify(event.content, null, 2)}
              />
            );
          }

          if (event.event_type === "error") {
            return (
              <div
                key={event.id}
                className="rounded-lg border border-rose-500/40 bg-rose-950/20 p-3 font-mono text-xs text-rose-300"
              >
                <span className="font-bold uppercase tracking-wider block mb-1">
                  Pipeline Exception:
                </span>
                {typeof event.content === "string" ? event.content : JSON.stringify(event.content)}
              </div>
            );
          }

          return null;
        })}

        {isStreaming && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 p-2">
            <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Autonomous agent executing intelligence graph...</span>
          </div>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>
    );
  }
);

EventFeed.displayName = "EventFeed";
