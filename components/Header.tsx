"use client";

import React, { memo } from "react";
import { 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Trash2, 
  Download, 
  FileText, 
  Radio, 
  Layers,
  Sparkles,
  Fingerprint
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StreamEvent, VerifiedArtifact } from "@/types/osint";
import { generateDossierMarkdown } from "@/lib/osint-logic";

interface HeaderProps {
  sessionId: string;
  isStreaming: boolean;
  activeModel?: string;
  events: StreamEvent[];
  artifacts: VerifiedArtifact[];
  onClearSession: () => void;
  mockMode: boolean;
  onToggleMockMode: (val: boolean) => void;
}

export const Header = memo(
  ({
    sessionId,
    isStreaming,
    activeModel = "gemini-3.1-flash-lite",
    events,
    artifacts,
    onClearSession,
    mockMode,
    onToggleMockMode,
  }: HeaderProps) => {

    const handleExportJson = () => {
      const data = {
        sessionId,
        exportedAt: new Date().toISOString(),
        model: activeModel,
        eventsCount: events.length,
        artifactsCount: artifacts.length,
        events,
        artifacts,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sessionId}-telemetry.json`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const handleExportMarkdown = () => {
      const markdown = generateDossierMarkdown(
        sessionId,
        "Autonomous Multi-Agent CyberOSINT Investigation",
        events,
        artifacts
      );
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sessionId}-dossier.md`;
      a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
        {/* Left Section: Logo, Title, Live Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <ShieldCheck className="size-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold tracking-wider text-zinc-100 uppercase">
                  Cyber-OSINT
                </span>
                <span className="font-mono text-[10px] text-cyan-400 font-semibold px-1 rounded bg-cyan-950/50 border border-cyan-800/40">
                  WORKSTATION
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                Autonomous Reconnaissance Suite
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center">
            {isStreaming ? (
              <Badge variant="cyber" className="gap-1.5 py-0.5 px-2 bg-cyan-950/60 border-cyan-500/40 text-cyan-300 animate-pulse">
                <Radio className="size-3 animate-spin" />
                <span className="font-mono font-medium">STREAMING ACTIVE</span>
              </Badge>
            ) : (
              <Badge variant="default" className="gap-1.5 py-0.5 px-2 bg-emerald-950/40 border-emerald-500/30 text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="font-mono font-medium">SYSTEM ONLINE</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Center Section: Active Model, Session ID, Engine Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/70 px-2.5 py-1 text-xs font-mono text-zinc-300">
            <Cpu className="size-3.5 text-cyan-400" />
            <span className="text-zinc-500 text-[10px] uppercase">Model:</span>
            <span className="text-zinc-200 font-semibold">{activeModel}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/70 px-2.5 py-1 text-xs font-mono text-zinc-300">
            <Fingerprint className="size-3.5 text-amber-400" />
            <span className="text-zinc-500 text-[10px] uppercase">Session:</span>
            <span className="text-amber-300 font-mono">{sessionId}</span>
          </div>

          <button
            type="button"
            onClick={() => onToggleMockMode(!mockMode)}
            title="Toggle between Simulated Scenarios and Live Backend SSE stream"
            className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 px-2 py-1 text-[11px] font-mono text-zinc-400 transition-colors cursor-pointer"
          >
            <Sparkles className="size-3 text-cyan-400" />
            <span>Mode:</span>
            <span className={mockMode ? "text-cyan-300 font-medium" : "text-emerald-400 font-medium"}>
              {mockMode ? "Preset / Sim" : "Live API"}
            </span>
          </button>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClearSession}
            disabled={events.length === 0}
            className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs font-mono text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-40 transition-all cursor-pointer"
            title="Clear all live events and telemetry logs"
          >
            <Trash2 className="size-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            disabled={events.length === 0}
            className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs font-mono text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 disabled:opacity-40 transition-all cursor-pointer"
            title="Export raw JSON stream and telemetry data"
          >
            <Download className="size-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            disabled={events.length === 0}
            className="flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-950/30 px-3 py-1.5 text-xs font-mono font-medium text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-500/50 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
            title="Export finalized intelligence dossier as Markdown"
          >
            <FileText className="size-3.5" />
            <span>Dossier MD</span>
          </button>
        </div>
      </header>
    );
  }
);

Header.displayName = "Header";
