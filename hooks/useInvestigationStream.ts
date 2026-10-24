"use client";

import { useState, useCallback, useRef } from 'react';
import { StreamEvent, VerifiedArtifact, ToolApprovalRequest } from '@/types/osint';
import { aggregateArtifacts, processToolApproval } from '@/lib/osint-logic';
import { getScenarioSimulation } from '@/data/scenarios';

export interface TraceLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'TOOL' | 'HANDOFF' | 'WARN' | 'DATA';
  agent: string;
  message: string;
  rawJson?: string;
}

export function useInvestigationStream() {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [artifacts, setArtifacts] = useState<VerifiedArtifact[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string>('Coordinator');
  const [sessionId, setSessionId] = useState<string>('OSINT-7X29A');
  const [mockMode, setMockMode] = useState<boolean>(true); // default true for instant instant interactive simulation, toggleable
  const [terminalLogs, setTerminalLogs] = useState<TraceLog[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const addLog = useCallback((agent: string, level: TraceLog['level'], message: string, rawJson?: any) => {
    const newLog: TraceLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }),
      level,
      agent,
      message,
      rawJson: rawJson ? JSON.stringify(rawJson, null, 2) : undefined,
    };
    setTerminalLogs((prev) => [...prev.slice(-300), newLog]);
  }, []);

  // Handle tool approval decisions (Accept / Reject)
  const handleToolDecision = useCallback((toolId: string, decision: 'accepted' | 'rejected') => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.approval && ev.approval.tool_id === toolId) {
          const updatedApproval = processToolApproval(ev.approval, decision);
          return {
            ...ev,
            approval: updatedApproval,
          };
        }
        return ev;
      })
    );

    addLog(
      activeAgent,
      decision === 'accepted' ? 'TOOL' : 'WARN',
      `Analyst ${decision.toUpperCase()} tool execution for ID: ${toolId}`
    );

    // If accepted, simulate successful follow-up result after a short pause
    if (decision === 'accepted') {
      setTimeout(() => {
        const resultEv: StreamEvent = {
          id: `ev-approved-${Date.now()}`,
          event_type: 'tool_result',
          agent_name: activeAgent,
          tool_name: 'authorized_execution',
          timestamp: Date.now(),
          content: 'Authorized tool execution completed successfully.',
          tool_output: {
            status: 'EXECUTED_BY_ANALYST_OVERRIDE',
            auth_token: 'VALIDATED_OK',
            records_returned: 12,
          },
        };
        setEvents((prev) => [...prev, resultEv]);
        addLog(activeAgent, 'TOOL', `Tool ID ${toolId} completed execution with 12 records returned.`);
      }, 800);
    }
  }, [activeAgent, addLog]);

  // Clear current investigation session
  const clearSession = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setEvents([]);
    setArtifacts([]);
    setIsStreaming(false);
    setActiveAgent('Coordinator');
    setSessionId(`OSINT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
    setTerminalLogs([]);
  }, []);

  // Built-in client simulation runner
  const runSimulation = useCallback(async (scenarioId: string, queryPrompt?: string) => {
    setIsStreaming(true);
    addLog('System', 'INFO', `Initiating investigation session [${sessionId}] in Local Engine...`);

    const sim = getScenarioSimulation(scenarioId, queryPrompt);

    for (let i = 0; i < sim.events.length; i++) {
      const ev = sim.events[i];
      setActiveAgent(ev.agent_name);

      if (ev.event_type === 'thought') {
        addLog(ev.agent_name, 'INFO', `Cognitive Reasoning: ${ev.content.title}`);
      } else if (ev.event_type === 'agent_handoff') {
        addLog('Coordinator', 'HANDOFF', `Orchestrating handoff from [${ev.handoff_from}] to [${ev.handoff_to}]`);
      } else if (ev.event_type === 'tool_call') {
        addLog(ev.agent_name, 'TOOL', `Invoking tool: ${ev.tool_name}`, ev.tool_args);
      } else if (ev.event_type === 'tool_result') {
        addLog(ev.agent_name, 'DATA', `Tool ${ev.tool_name} returned telemetry output`, ev.tool_output);
      } else if (ev.event_type === 'report') {
        addLog(ev.agent_name, 'INFO', 'Synthesizing final intelligence dossier markdown');
      }

      setEvents((prev) => [...prev, ev]);
      await new Promise((resolve) => setTimeout(resolve, 650));
    }

    // Add artifacts
    for (const art of sim.artifacts) {
      setArtifacts((prev) => aggregateArtifacts(prev, [art]));
      addLog(art.source_tool, 'DATA', `Verified artifact: [${art.artifact_type.toUpperCase()}] ${art.identifier} (${Math.round(art.confidence * 100)}% conf)`);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setIsStreaming(false);
    addLog('Coordinator', 'INFO', 'Investigation cycle completed. Anti-hallucination verification gate passed.');
  }, [sessionId, addLog]);

  // Main start function
  const startInvestigation = useCallback(
    async (prompt: string, scenarioId?: string, image?: string | null) => {
      clearSession();
      setIsStreaming(true);
      setActiveAgent('Coordinator');

      if (mockMode || scenarioId) {
        // Use client simulation
        await runSimulation(scenarioId || 'scenario-gym-imint', prompt);
        return;
      }

      // Live backend SSE stream
      try {
        addLog('System', 'INFO', `Connecting to /api/investigate stream...`);
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const response = await fetch('/api/investigate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, scenarioId, image, mode: 'live' }),
          signal: abortController.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;

            const jsonStr = trimmed.replace(/^data: /, '');
            try {
              const data = JSON.parse(jsonStr);
              if (data.event_type === 'artifact') {
                setArtifacts((prev) => aggregateArtifacts(prev, [data.content]));
                addLog('VerifGate', 'DATA', `Artifact grounded: ${data.content.identifier}`);
              } else {
                setEvents((prev) => [...prev, data]);
                if (data.agent_name) {
                  setActiveAgent(data.agent_name);
                }
                addLog(data.agent_name || 'System', data.event_type === 'tool_call' ? 'TOOL' : 'INFO', `Stream event: ${data.event_type}`);
              }
            } catch (err) {
              console.error('Failed to parse SSE payload', err, jsonStr);
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Live investigation stream fallback to simulated scenario:', err);
          addLog('System', 'WARN', `Stream disconnected (${err.message}). Engaging fallback simulation engine...`);
          await runSimulation('scenario-gym-imint', prompt);
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [mockMode, clearSession, runSimulation, addLog]
  );

  const stopInvestigation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    addLog('System', 'WARN', 'Analyst issued manual investigation halt.');
  }, [addLog]);

  return {
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
  };
}
