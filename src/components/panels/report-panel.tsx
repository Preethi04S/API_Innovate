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
    return <h1 key={idx} className="text-sm font-bold text-white mt-3 mb-1">{line.replace(/^# /, "")}</h1>;
  }
  // H2
  if (/^## (.+)/.test(line)) {
    return <h2 key={idx} className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mt-3 mb-1 border-b border-white/[0.06] pb-1">{line.replace(/^## /, "")}</h2>;
  }
  // H3
  if (/^### (.+)/.test(line)) {
    return <h3 key={idx} className="text-[11px] font-semibold text-zinc-300 mt-2 mb-0.5">{line.replace(/^### /, "")}</h3>;
  }
  // H4
  if (/^#### (.+)/.test(line)) {
    return <h4 key={idx} className="text-[10px] font-semibold text-zinc-400 mt-1.5 mb-0.5">{line.replace(/^#### /, "")}</h4>;
  }
  // HR
  if (/^---+$/.test(line.trim())) {
    return <hr key={idx} className="border-white/[0.08] my-2" />;
  }
  // Bullet
  if (/^[-*] (.+)/.test(line)) {
    const text = line.replace(/^[-*] /, "");
    return (
      <div key={idx} className="flex gap-2 text-[11px] text-zinc-400 leading-relaxed pl-2">
        <span className="text-zinc-600 shrink-0">•</span>
        <span dangerouslySetInnerHTML={{ __html: inlineMd(text) }} />
      </div>
    );
  }
  // Numbered list
  if (/^\d+\. (.+)/.test(line)) {
    const match = line.match(/^(\d+)\. (.+)/);
    if (match) {
      return (
        <div key={idx} className="flex gap-2 text-[11px] text-zinc-400 leading-relaxed pl-2">
          <span className="text-zinc-600 shrink-0 w-4">{match[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: inlineMd(match[2]) }} />
        </div>
      );
    }
  }
  // Empty line
  if (line.trim() === "") {
    return <div key={idx} className="h-1.5" />;
  }
  // Normal paragraph
  return (
    <p key={idx} className="text-[11px] text-zinc-400 leading-relaxed"
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
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          size="sm"
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold border-0"
        >
          {isGenerating ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <FileText className="h-3.5 w-3.5 mr-1.5" />
          )}
          Generate Report
        </Button>
      </div>
    );
  }

  const lines = markdown.split("\n");

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-zinc-600" />
          <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Report
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="h-7 text-[10px] border-zinc-700/50 bg-zinc-800/50 hover:bg-zinc-700"
        >
          <Download className="h-3 w-3 mr-1" />
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
