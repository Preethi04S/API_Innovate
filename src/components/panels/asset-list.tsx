"use client";

import { ZONE_LABELS, Zone } from "@/lib/schemas/events";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Thermometer, Camera, ShieldCheck, Network, Wind, Server, MapPin,
} from "lucide-react";

interface Asset {
  id: string;
  name: string;
  type: string;
  zone: string;
  status: string;
  ip?: string;
}

interface AssetListProps {
  assets: Asset[];
  affectedAssets?: string[];
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  sensor: <Thermometer className="h-3 w-3" />,
  camera: <Camera className="h-3 w-3" />,
  access_control: <ShieldCheck className="h-3 w-3" />,
  network: <Network className="h-3 w-3" />,
  hvac: <Wind className="h-3 w-3" />,
  server: <Server className="h-3 w-3" />,
};

const STATUS_DOT: Record<string, string> = {
  online: "bg-emerald-400",
  offline: "bg-zinc-600",
  warning: "bg-yellow-400",
  critical: "bg-red-400 animate-pulse",
};

export function AssetList({ assets, affectedAssets = [] }: AssetListProps) {
  const grouped = assets.reduce<Record<string, Asset[]>>((acc, asset) => {
    (acc[asset.zone] ??= []).push(asset);
    return acc;
  }, {});

  const affectedSet = new Set(affectedAssets);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-zinc-600" />
          <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Assets
          </h2>
        </div>
        <Badge variant="outline" className="text-[10px] border-zinc-700/50 text-zinc-500 font-mono">
          {assets.length}
        </Badge>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {Object.entries(grouped).map(([zone, zoneAssets]) => (
            <div key={zone}>
              <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-1.5 px-1">
                {ZONE_LABELS[zone as Zone] || zone}
              </h3>
              <div className="space-y-0.5">
                {zoneAssets.map((asset) => {
                  const isAffected = affectedSet.has(asset.id);
                  return (
                    <div
                      key={asset.id}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] transition-colors ${
                        isAffected
                          ? "bg-red-500/8 border border-red-500/15"
                          : "hover:bg-zinc-800/30"
                      }`}
                    >
                      <span className={isAffected ? "text-red-400" : "text-zinc-600"}>
                        {TYPE_ICONS[asset.type] || <Server className="h-3 w-3" />}
                      </span>
                      <span className={`truncate flex-1 ${isAffected ? "text-red-300" : "text-zinc-400"}`}>
                        {asset.name}
                      </span>
                      {asset.ip && (
                        <span className="text-zinc-700 font-mono text-[9px]">{asset.ip}</span>
                      )}
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOT[asset.status] || "bg-zinc-600"}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
