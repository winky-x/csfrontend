"use client";

import React, { memo } from "react";
import { ShieldAlert, ShieldCheck, ShieldX, Terminal, ArrowRight, Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ToolApprovalRequest } from "@/types/osint";

export interface ConfirmationProps {
  request: ToolApprovalRequest;
  onAccept?: (toolId: string) => void;
  onReject?: (toolId: string) => void;
  className?: string;
  disabled?: boolean;
}

export const Confirmation = memo(
  ({ request, onAccept, onReject, className, disabled = false }: ConfirmationProps) => {
    const { status, tool_name, target, risk_level, reason, parameters, tool_id } = request;

    const riskBadgeVariant = 
      risk_level === 'critical' ? 'destructive' :
      risk_level === 'high' ? 'warning' :
      risk_level === 'moderate' ? 'cyber' : 'secondary';

    if (status === 'accepted') {
      return (
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2.5 backdrop-blur-md transition-all duration-300",
            className
          )}
        >
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Check className="size-3.5" />
            </div>
            <div>
              <span className="font-semibold text-emerald-300">Tool Execution Authorized:</span>{" "}
              <code className="text-emerald-200 bg-emerald-950/50 px-1 py-0.5 rounded text-[11px]">{tool_name}</code>
              <span className="text-zinc-400 ml-2">➔ {target}</span>
            </div>
          </div>
          <Badge variant="default" className="text-[10px] uppercase tracking-wider font-mono">
            Approved
          </Badge>
        </div>
      );
    }

    if (status === 'rejected') {
      return (
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-950/20 px-3.5 py-2.5 backdrop-blur-md transition-all duration-300",
            className
          )}
        >
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <div className="flex size-6 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <X className="size-3.5" />
            </div>
            <div>
              <span className="font-semibold text-rose-300">Tool Execution Denied:</span>{" "}
              <code className="text-rose-200 bg-rose-950/50 px-1 py-0.5 rounded text-[11px]">{tool_name}</code>
              <span className="text-zinc-400 ml-2">➔ Interception Aborted</span>
            </div>
          </div>
          <Badge variant="destructive" className="text-[10px] uppercase tracking-wider font-mono">
            Denied
          </Badge>
        </div>
      );
    }

    // Pending approval state
    return (
      <div
        className={cn(
          "rounded-lg border border-amber-500/40 bg-zinc-950/80 p-3.5 shadow-lg backdrop-blur-md transition-all duration-300 relative overflow-hidden",
          className
        )}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 animate-pulse" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
              <ShieldAlert className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-100 font-mono tracking-wide">
                  ANALYST ACTION REQUIRED: TOOL APPROVAL
                </span>
                <Badge variant={riskBadgeVariant} className="text-[10px] uppercase font-mono tracking-widest">
                  {risk_level} RISK
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                Active investigation agent is requesting permission to execute an external intelligence probe.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onReject?.(tool_id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-rose-500/30 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 hover:border-rose-500/60 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <X className="size-3.5" />
              <span>Reject</span>
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onAccept?.(tool_id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-emerald-500/40 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 hover:border-emerald-500/70 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Check className="size-3.5" />
              <span>Authorize Tool</span>
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          <div className="space-y-1 bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Tool Command & Target</div>
            <div className="flex items-center gap-1.5 text-zinc-200">
              <Terminal className="size-3 text-cyan-400" />
              <code className="text-cyan-300 font-semibold">{tool_name}</code>
              <ArrowRight className="size-3 text-zinc-500" />
              <span className="text-zinc-300 truncate">{target}</span>
            </div>
          </div>

          <div className="space-y-1 bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Operational Justification</div>
            <p className="text-[11px] text-zinc-300 line-clamp-2">
              {reason}
            </p>
          </div>
        </div>

        {parameters && Object.keys(parameters).length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-zinc-800/60 text-[10px] font-mono text-zinc-400 flex items-center gap-2 overflow-x-auto">
            <span className="text-zinc-500">Payload:</span>
            <code className="text-zinc-300 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
              {JSON.stringify(parameters)}
            </code>
          </div>
        )}
      </div>
    );
  }
);

Confirmation.displayName = "Confirmation";
