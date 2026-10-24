"use client";

import React, { memo, useState, useEffect, useRef } from "react";
import { 
  Activity, 
  Terminal, 
  ShieldCheck, 
  UserCheck, 
  Network, 
  MapPin, 
  Key, 
  Search, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  ArrowDown, 
  Sparkles,
  Maximize2,
  X,
  Radio,
  Cpu
} from "lucide-react";
import { VerifiedArtifact } from "@/types/osint";
import { TraceLog } from "@/hooks/useInvestigationStream";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TelemetryDrawerProps {
  activeAgent: string;
  isStreaming: boolean;
  artifacts: VerifiedArtifact[];
  terminalLogs: TraceLog[];
  onClearLogs?: () => void;
}

const AGENT_PROFILES: Record<
  string,
  { label: string; role: string; color: string; badgeVariant: "cyber" | "default" | "warning" | "purple" }
> = {
  Coordinator: {
    label: "Master Coordinator",
    role: "Strategic intelligence orchestration, entity correlation & final dossier synthesis",
    color: "cyan",
    badgeVariant: "cyber",
  },
  SocialSubAgent: {
    label: "SocialSubAgent",
    role: "Cross-platform identity de-anonymization, handle entropy & breach index correlation",
    color: "emerald",
    badgeVariant: "default",
  },
  InfraAgent: {
    label: "InfraAgent",
    role: "Attack surface mapping, Certificate Transparency logs & DNS routing topology",
    color: "amber",
    badgeVariant: "warning",
  },
  GeoAgent: {
    label: "GeoAgent",
    role: "IMINT imagery parsing, equipment catalogue recognition & geospatial triangulation",
    color: "purple",
    badgeVariant: "purple",
  },
};

export const TelemetryDrawer = memo(
  ({ activeAgent, isStreaming, artifacts, terminalLogs, onClearLogs }: TelemetryDrawerProps) => {
    const [selectedTab, setSelectedTab] = useState<"all" | "profile" | "infrastructure" | "location" | "credential">("all");
    const [logFilter, setLogFilter] = useState<"ALL" | "TOOL" | "HANDOFF" | "DATA" | "WARN">("ALL");
    const [autoScroll, setAutoScroll] = useState(true);
    const [inspectedArtifact, setInspectedArtifact] = useState<VerifiedArtifact | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const terminalBottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll terminal
    useEffect(() => {
      if (autoScroll && terminalBottomRef.current) {
        terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [terminalLogs.length, autoScroll]);

    const agentInfo = AGENT_PROFILES[activeAgent] || {
      label: activeAgent,
      role: "Specialized intelligence operator",
      color: "cyan",
      badgeVariant: "cyber" as const,
    };

    const filteredArtifacts = artifacts.filter((a) => {
      if (selectedTab === "all") return true;
      return a.artifact_type === selectedTab;
    });

    const filteredLogs = terminalLogs.filter((log) => {
      if (logFilter === "ALL") return true;
      return log.level === logFilter;
    });

    const handleCopy = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    };

    const handleDownloadTerminal = () => {
      const content = terminalLogs
        .map((l) => `[${l.timestamp}] [${l.level}] [${l.agent}] ${l.message} ${l.rawJson || ""}`)
        .join("\n");
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `terminal-trace-${Date.now()}.log`;
      a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div className="flex-1 flex flex-col h-full bg-[#08090d] border-l border-zinc-800/80 overflow-hidden select-none">
        {/* 1. Active Agent Header */}
        <div className="p-3 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <span className={cn(
                  "size-2.5 rounded-full",
                  isStreaming ? "bg-cyan-400 animate-ping" : "bg-emerald-400"
                )} />
                <span className={cn(
                  "absolute size-2.5 rounded-full",
                  isStreaming ? "bg-cyan-400" : "bg-emerald-400"
                )} />
              </div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                Active Tactical Operator:
              </span>
            </div>

            <Badge variant={agentInfo.badgeVariant} className="font-mono text-xs uppercase px-2 py-0.5">
              {agentInfo.label}
            </Badge>
          </div>

          <div className="mt-1.5 flex items-start gap-2 text-xs font-mono">
            <Cpu className="size-3.5 text-zinc-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-zinc-400 leading-snug">
              {agentInfo.role}
            </p>
          </div>
        </div>

        {/* 2. Verified Artifacts Ledger (Upper half) */}
        <div className="flex-[5] flex flex-col min-h-0 border-b border-zinc-800/80">
          <div className="px-3 py-2 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span className="text-xs font-mono font-semibold text-zinc-200 uppercase tracking-wider">
                Verified Artifacts Ledger
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                {artifacts.length}
              </span>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1">
              {(["all", "profile", "infrastructure", "location", "credential"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedTab(tab)}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-mono rounded transition-colors uppercase cursor-pointer",
                    selectedTab === tab
                      ? "bg-zinc-800 text-cyan-300 font-medium border border-zinc-700"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                  )}
                >
                  {tab === "all" ? "ALL" : tab.slice(0, 4)}
                </button>
              ))}
            </div>
          </div>

          {/* Artifacts Grid / List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredArtifacts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <ShieldCheck className="size-8 text-zinc-700 mb-2 stroke-1" />
                <span className="text-xs font-mono text-zinc-500">
                  Zero verified entities in current session.
                </span>
                <span className="text-[10px] font-mono text-zinc-600 mt-1">
                  Entities must pass the anti-hallucination verification gate to appear.
                </span>
              </div>
            ) : (
              filteredArtifacts.map((art) => {
                const confPercent = Math.round(art.confidence * 100);
                const Icon =
                  art.artifact_type === "profile" ? UserCheck :
                  art.artifact_type === "infrastructure" ? Network :
                  art.artifact_type === "location" ? MapPin : Key;

                const badgeLabel =
                  art.artifact_type === "profile" ? "VERIFIED" :
                  art.artifact_type === "infrastructure" ? "GROUNDED" :
                  art.artifact_type === "location" ? "MATCH" : "KEY";

                return (
                  <div
                    key={art.id}
                    onClick={() => setInspectedArtifact(art)}
                    className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer font-mono text-xs group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center text-cyan-400 shrink-0">
                          <Icon className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-200 truncate group-hover:text-cyan-300">
                            {art.identifier}
                          </div>
                          <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                            <span className="uppercase">{art.artifact_type}</span>
                            <span>•</span>
                            <span className="text-zinc-400">{art.source_tool}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <Badge variant="default" className="text-[9px] py-0 px-1.5 tracking-wider bg-emerald-950/60 border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                          <Check className="size-2.5" />
                          <span>{badgeLabel}</span>
                        </Badge>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {confPercent}% conf
                        </span>
                      </div>
                    </div>

                    {/* Progress confidence bar */}
                    <div className="mt-2 w-full h-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/60">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all"
                        style={{ width: `${confPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. Raw Tool Trace Terminal (Lower half) */}
        <div className="flex-[6] flex flex-col min-h-0 bg-[#050608]">
          <div className="px-3 py-2 border-b border-zinc-800/80 bg-zinc-950/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="size-3.5 text-cyan-400" />
              <span className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                Raw Tool Trace Terminal
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Log Level Filters */}
              <div className="hidden sm:flex items-center gap-1">
                {(["ALL", "TOOL", "DATA", "WARN"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLogFilter(lvl)}
                    className={cn(
                      "px-1.5 py-0.5 text-[9px] font-mono rounded cursor-pointer",
                      logFilter === lvl
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-800/60"
                        : "text-zinc-600 hover:text-zinc-400"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Auto scroll toggle */}
              <button
                type="button"
                onClick={() => setAutoScroll(!autoScroll)}
                className={cn(
                  "p-1 rounded text-[10px] font-mono transition-colors cursor-pointer",
                  autoScroll ? "text-cyan-400 bg-cyan-950/40 border border-cyan-800/50" : "text-zinc-600 hover:text-zinc-400"
                )}
                title="Toggle Auto-Scroll"
              >
                <ArrowDown className="size-3" />
              </button>

              <button
                type="button"
                onClick={handleDownloadTerminal}
                className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
                title="Download terminal trace"
              >
                <Download className="size-3" />
              </button>
            </div>
          </div>

          {/* Terminal log output */}
          <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1.5 leading-relaxed">
            {filteredLogs.length === 0 ? (
              <div className="text-zinc-600 text-center py-6">
                Waiting for agent tool trace telemetry...
              </div>
            ) : (
              filteredLogs.map((log) => {
                const badgeColor =
                  log.level === "TOOL" ? "text-cyan-400" :
                  log.level === "HANDOFF" ? "text-purple-400" :
                  log.level === "WARN" ? "text-amber-400" :
                  log.level === "DATA" ? "text-emerald-400" : "text-zinc-500";

                return (
                  <div key={log.id} className="text-zinc-400 flex flex-col gap-0.5">
                    <div className="flex items-start gap-1.5">
                      <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
                      <span className={cn("font-bold shrink-0", badgeColor)}>
                        [{log.level}]
                      </span>
                      <span className="text-zinc-300 font-medium shrink-0">
                        [{log.agent}]:
                      </span>
                      <span className="text-zinc-200 break-words flex-1">
                        {log.message}
                      </span>
                    </div>

                    {log.rawJson && (
                      <pre className="ml-6 my-1 p-2 rounded bg-zinc-950 border border-zinc-900 text-[10px] text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                        {log.rawJson}
                      </pre>
                    )}
                  </div>
                );
              })
            )}
            <div ref={terminalBottomRef} />
          </div>
        </div>

        {/* Modal / Dialog for inspecting an artifact */}
        {inspectedArtifact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-lg w-full p-4 shadow-2xl font-mono text-xs space-y-3 relative">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-400" />
                  <span className="font-bold text-zinc-100 uppercase tracking-wide">
                    Artifact Verification Inspector
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedArtifact(null)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 font-semibold block">
                    Identifier:
                  </span>
                  <div className="flex items-center justify-between bg-zinc-900 p-2 rounded border border-zinc-800 text-cyan-300 mt-1">
                    <span className="font-semibold break-all">{inspectedArtifact.identifier}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(inspectedArtifact.identifier, "identifier")}
                      className="p-1 text-zinc-400 hover:text-zinc-100 cursor-pointer"
                    >
                      {copiedId === "identifier" ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                    <span className="text-[10px] uppercase text-zinc-500">Type</span>
                    <div className="text-zinc-200 capitalize font-medium mt-0.5">
                      {inspectedArtifact.artifact_type}
                    </div>
                  </div>
                  <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                    <span className="text-[10px] uppercase text-zinc-500">Confidence</span>
                    <div className="text-emerald-400 font-medium mt-0.5">
                      {Math.round(inspectedArtifact.confidence * 100)}% (Grounded)
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
                  <span className="text-[10px] uppercase text-zinc-500 font-semibold block mb-1">
                    Grounded Evidence Snippet
                  </span>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">
                    {inspectedArtifact.evidence_snippet}
                  </p>
                </div>

                <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Source Tool:</span>
                  <code className="text-cyan-400">{inspectedArtifact.source_tool}</code>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectedArtifact(null)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

TelemetryDrawer.displayName = "TelemetryDrawer";
