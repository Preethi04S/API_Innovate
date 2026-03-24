"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, Loader2, FileDown } from "lucide-react";
import { useState } from "react";

interface ReportPanelProps {
  markdown: string | null;
  hasIncident: boolean;
  onGenerate: () => void;
}

/** Render a single markdown line into styled JSX */
function MarkdownLine({ line, idx }: { line: string; idx: number }) {
  // H1
  if (/^# (.+)/.test(line)) {
    return <h1 key={idx} className="text-base font-bold text-white mt-4 mb-2">{line.replace(/^# /, "")}</h1>;
  }
  // H2
  if (/^## (.+)/.test(line)) {
    return <h2 key={idx} className="text-sm font-bold text-blue-400 uppercase tracking-wider mt-4 mb-2 border-b border-white/[0.08] pb-1">{line.replace(/^## /, "")}</h2>;
  }
  // H3
  if (/^### (.+)/.test(line)) {
    return <h3 key={idx} className="text-sm font-semibold text-zinc-200 mt-3 mb-1">{line.replace(/^### /, "")}</h3>;
  }
  // H4
  if (/^#### (.+)/.test(line)) {
    return <h4 key={idx} className="text-xs font-semibold text-zinc-400 mt-2 mb-0.5">{line.replace(/^#### /, "")}</h4>;
  }
  // HR
  if (/^---+$/.test(line.trim())) {
    return <hr key={idx} className="border-white/[0.08] my-3" />;
  }
  // Bullet
  if (/^[-*] (.+)/.test(line)) {
    const text = line.replace(/^[-*] /, "");
    return (
      <div key={idx} className="flex gap-2 text-sm text-zinc-300 leading-relaxed pl-2 my-0.5">
        <span className="text-zinc-500 shrink-0 mt-0.5">•</span>
        <span dangerouslySetInnerHTML={{ __html: inlineMd(text) }} />
      </div>
    );
  }
  // Numbered list
  if (/^\d+\. (.+)/.test(line)) {
    const match = line.match(/^(\d+)\. (.+)/);
    if (match) {
      return (
        <div key={idx} className="flex gap-2 text-sm text-zinc-300 leading-relaxed pl-2 my-0.5">
          <span className="text-zinc-500 shrink-0 w-5 font-mono">{match[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: inlineMd(match[2]) }} />
        </div>
      );
    }
  }
  // Empty line
  if (line.trim() === "") {
    return <div key={idx} className="h-2" />;
  }
  // Normal paragraph
  return (
    <p key={idx} className="text-sm text-zinc-300 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: inlineMd(line) }} />
  );
}

/** Process inline markdown: **bold**, *italic*, `code`, key:value pairs */
function inlineMd(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-200 font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-zinc-300">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-zinc-800 text-blue-300 px-1 rounded text-[10px]">$1</code>');
}

export function ReportPanel({
  markdown,
  hasIncident,
  onGenerate,
}: ReportPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await onGenerate();
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentinel-mesh-report-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasIncident) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600">
        <FileText className="h-8 w-8 mb-3 opacity-30" />
        <p className="text-xs">Incident reports generated after analysis</p>
      </div>
    );
  }

  if (!markdown) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="p-3 rounded-xl border border-zinc-800/40 bg-zinc-900/20">
          <FileDown className="h-6 w-6 text-zinc-600" />
        </div>
        <div className="text-center">
          <p className="text-xs text-zinc-400 mb-1">Export incident report</p>
          <p className="text-[10px] text-zinc-600">Includes evidence, ASI findings, and actions</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: isGenerating ? "not-allowed" : "pointer",
            background: isGenerating ? "#27272a" : "#2563eb",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "background 0.15s",
          }}
        >
          {isGenerating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileText className="h-3.5 w-3.5" />
          )}
          Generate Report
        </button>
      </div>
    );
  }

  const lines = markdown.split("\n");

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
            Report
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="h-8 text-xs border-zinc-700/50 bg-zinc-800/50 hover:bg-zinc-700 font-semibold"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Download .md
        </Button>
      </div>

      {/* Scrollable rendered markdown */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 space-y-0.5">
          {lines.map((line, idx) => (
            <MarkdownLine key={idx} line={line} idx={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
