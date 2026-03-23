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
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50"
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60">
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
      <ScrollArea className="flex-1">
        <div className="p-4">
          <pre className="text-[11px] text-zinc-400 whitespace-pre-wrap font-sans leading-relaxed">
            {markdown}
          </pre>
        </div>
      </ScrollArea>
    </div>
  );
}
