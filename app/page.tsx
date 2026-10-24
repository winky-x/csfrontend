"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { CommandInputBar } from "@/components/CommandInputBar";
import { EventFeed } from "@/components/EventFeed";
import { TelemetryDrawer } from "@/components/TelemetryDrawer";
import { useInvestigationStream } from "@/hooks/useInvestigationStream";
import { BENCHMARK_SCENARIOS } from "@/data/scenarios";
import { Layers, Terminal, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WorkstationPage() {
  const {
    events,
    artifacts,
    isStreaming,
    activeAgent,
    sessionId,
    mockMode,
    setMockMode,
    terminalLogs,
    startInvestigation,
    stopInvestigation,
    clearSession,
    handleToolDecision,
  } = useInvestigationStream();

  // Mobile viewport tab toggle: 'investigation' or 'telemetry'
  const [mobileTab, setMobileTab] = useState<"investigation" | "telemetry">("investigation");

  const handleLaunchScenario = (scenarioId: string) => {
    const sc = BENCHMARK_SCENARIOS.find((s) => s.id === scenarioId);
    if (sc) {
      startInvestigation(sc.prompt, sc.id, sc.sampleImage);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090a0f] text-zinc-100">
      {/* 1. Master Header */}
      <Header
        sessionId={sessionId}
        isStreaming={isStreaming}
        activeModel="gemini-3.1-flash-lite"
        events={events}
        artifacts={artifacts}
        onClearSession={clearSession}
        mockMode={mockMode}
        onToggleMockMode={setMockMode}
      />

      {/* Mobile view switcher (only visible on small screens) */}
      <div className="flex md:hidden border-b border-zinc-800 bg-zinc-950 px-2 py-1.5 gap-2">
        <button
          type="button"
          onClick={() => setMobileTab("investigation")}
          className={cn(
            "flex-1 py-1 text-xs font-mono rounded flex items-center justify-center gap-1.5",
            mobileTab === "investigation"
              ? "bg-zinc-800 text-cyan-300 font-semibold"
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          <Layers className="size-3.5" />
          <span>Investigation Stream</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("telemetry")}
          className={cn(
            "flex-1 py-1 text-xs font-mono rounded flex items-center justify-center gap-1.5",
            mobileTab === "telemetry"
              ? "bg-zinc-800 text-cyan-300 font-semibold"
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          <Terminal className="size-3.5" />
          <span>Telemetry & Ledger</span>
        </button>
      </div>

      {/* 2. Desktop Split Screen Workstation Body */}
      <main className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Pane (60% Desktop): Event Stream + Command Input Bar */}
        <section
          className={cn(
            "flex-col h-full overflow-hidden transition-all duration-200",
            // Desktop: 60% width, flex
            "md:w-[60%] md:flex",
            // Mobile: toggle based on active tab
            mobileTab === "investigation" ? "flex w-full" : "hidden md:flex"
          )}
        >
          {/* Scrollable Event Stream */}
          <EventFeed
            events={events}
            isStreaming={isStreaming}
            onToolDecision={handleToolDecision}
            onQuickScenario={handleLaunchScenario}
          />

          {/* Bottom Command Input Bar */}
          <CommandInputBar
            isStreaming={isStreaming}
            onExecute={(prompt, scenarioId, image) =>
              startInvestigation(prompt, scenarioId, image)
            }
            onStop={stopInvestigation}
          />
        </section>

        {/* Right Pane (40% Desktop): Telemetry Drawer */}
        <section
          className={cn(
            "flex-col h-full overflow-hidden transition-all duration-200",
            // Desktop: 40% width, flex
            "md:w-[40%] md:flex",
            // Mobile: toggle based on active tab
            mobileTab === "telemetry" ? "flex w-full" : "hidden md:flex"
          )}
        >
          <TelemetryDrawer
            activeAgent={activeAgent}
            isStreaming={isStreaming}
            artifacts={artifacts}
            terminalLogs={terminalLogs}
          />
        </section>
      </main>
    </div>
  );
}
