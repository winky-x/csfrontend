"use client";

import React, { memo, useState, useRef, useEffect } from "react";
import { 
  Paperclip, 
  Send, 
  Square, 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Compass, 
  Crosshair,
  Globe,
  Loader2
} from "lucide-react";
import { BENCHMARK_SCENARIOS } from "@/data/scenarios";
import { InvestigationScenario } from "@/types/osint";
import { cn } from "@/lib/utils";

interface CommandInputBarProps {
  isStreaming: boolean;
  onExecute: (prompt: string, scenarioId?: string, image?: string | null) => void;
  onStop: () => void;
}

export const CommandInputBar = memo(({ isStreaming, onExecute, onStop }: CommandInputBarProps) => {
  const [prompt, setPrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [prompt]);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleScenarioSelect = (scenario: InvestigationScenario) => {
    setSelectedScenarioId(scenario.id);
    setPrompt(scenario.prompt);
    if (scenario.sampleImage) {
      setSelectedImage(scenario.sampleImage);
      setImageName(scenario.imageCaption || "Target Image");
    } else {
      setSelectedImage(null);
      setImageName(null);
    }
    // Automatically trigger execution for instant preview!
    onExecute(scenario.prompt, scenario.id, scenario.sampleImage);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() && !selectedImage) return;
    if (isStreaming) {
      onStop();
      return;
    }
    onExecute(prompt, selectedScenarioId, selectedImage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md p-3 select-none flex flex-col gap-2">
      {/* Preset Scenario Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Crosshair className="size-3 text-cyan-400" />
          Scenarios:
        </span>
        {BENCHMARK_SCENARIOS.map((scenario, index) => {
          const isSelected = selectedScenarioId === scenario.id;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => handleScenarioSelect(scenario)}
              className={cn(
                "group shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono transition-all border cursor-pointer",
                isSelected
                  ? "bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              )}
            >
              <span className="size-1.5 rounded-full bg-cyan-400 opacity-60 group-hover:opacity-100" />
              <span>{`[Scenario ${index + 1}: ${scenario.shortLabel}]`}</span>
            </button>
          );
        })}
      </div>

      {/* Target Image Preview if loaded */}
      {selectedImage && (
        <div className="flex items-center gap-2.5 rounded-md border border-cyan-500/30 bg-cyan-950/20 p-1.5 max-w-fit">
          <div className="relative size-10 rounded border border-zinc-700 overflow-hidden bg-black shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Investigation target thumbnail"
              className="size-full object-cover"
            />
          </div>
          <div className="flex flex-col pr-2">
            <span className="text-[11px] font-mono font-medium text-cyan-300 flex items-center gap-1">
              <ImageIcon className="size-3" /> Target Visual Asset
            </span>
            <span className="text-[10px] font-mono text-zinc-400 max-w-[200px] truncate">
              {imageName || "Target photograph"}
            </span>
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="size-5 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="Remove asset"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Input Form & Drag-and-Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) {
            handleFileChange(e.dataTransfer.files[0]);
          }
        }}
        className={cn(
          "relative flex items-end gap-2 rounded-lg border bg-zinc-900/60 p-2 backdrop-blur-sm transition-all shadow-inner",
          isDragging
            ? "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400"
            : "border-zinc-800/90 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30"
        )}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        {/* Paperclip attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="size-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800/80 transition-colors cursor-pointer shrink-0"
          title="Upload image target for IMINT or visual facial matching"
        >
          <Paperclip className="size-4" />
        </button>

        {/* Text input area */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter investigation objective, handle, domain, or drop target photograph..."
          rows={1}
          className="flex-1 bg-transparent text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-none py-1.5 leading-relaxed"
        />

        {/* Execute / Stop button */}
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="flex items-center gap-1.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 px-3 py-1.5 text-xs font-mono font-medium hover:bg-rose-500/30 transition-all cursor-pointer shadow-sm shrink-0"
            title="Halt current investigation"
          >
            <Square className="size-3.5 fill-current" />
            <span>Halt</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!prompt.trim() && !selectedImage}
            className="flex items-center gap-1.5 rounded-md bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 text-xs font-mono font-medium hover:bg-cyan-600/30 hover:border-cyan-500/70 disabled:opacity-40 transition-all cursor-pointer shadow-sm shrink-0"
            title="Execute Autonomous Investigation"
          >
            <Send className="size-3.5" />
            <span>Execute</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-1 text-[10px] font-mono text-zinc-600">
        <span className="hidden sm:inline">Enter to execute • Shift + Enter for new line • Drag target image</span>
        <span className="sm:hidden">Auto-expanding prompt</span>
        <span className="text-zinc-500">Anti-Hallucination Gate: Active</span>
      </div>
    </div>
  );
});

CommandInputBar.displayName = "CommandInputBar";
