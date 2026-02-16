import { RANKS, RANK_ICONS, GAME_MODES, REGIONS, type GameMode, type Rank, type Region } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, ChevronDown } from "lucide-react";

interface FilterBarProps {
  gameMode: GameMode | "all";
  rank: Rank | "all";
  region: Region | "all";
  onGameModeChange: (v: GameMode | "all") => void;
  onRankChange: (v: Rank | "all") => void;
  onRegionChange: (v: Region | "all") => void;
}

export function FilterBar({ gameMode, rank, region, onGameModeChange, onRankChange, onRegionChange }: FilterBarProps) {
  const hasFilters = gameMode !== "all" || rank !== "all" || region !== "all";

  const triggerClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 font-display text-[11px] tracking-wider h-8 px-3 border transition-colors clip-angle-sm ${
      active
        ? "border-primary/30 bg-primary/10 text-primary"
        : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
    }`;

  const itemClass = (active: boolean) =>
    `w-full text-left px-3 py-2 text-xs font-display tracking-wider transition-colors rounded-sm ${
      active ? "text-primary bg-primary/10" : "text-foreground hover:bg-white/[0.06]"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {/* Game Mode */}
      <Popover>
        <PopoverTrigger asChild>
          <button className={triggerClass(gameMode !== "all")}>
            {gameMode === "all" ? "MODE" : gameMode.toUpperCase()}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-36 p-1 bg-card border-white/[0.08]" align="start">
          <button onClick={() => onGameModeChange("all")} className={itemClass(gameMode === "all")}>
            ALL MODES
          </button>
          {GAME_MODES.map(m => (
            <button key={m} onClick={() => onGameModeChange(m)} className={itemClass(gameMode === m)}>
              {m.toUpperCase()}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Rank */}
      <Popover>
        <PopoverTrigger asChild>
          <button className={triggerClass(rank !== "all")}>
            {rank === "all" ? "RANK" : (
              <img src={RANK_ICONS[rank]} alt={rank} className="h-4 w-4" />
            )}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-1 bg-card border-white/[0.08]" align="start">
          <button onClick={() => onRankChange("all")} className={itemClass(rank === "all")}>
            ALL RANKS
          </button>
          {RANKS.map(r => (
            <button key={r} onClick={() => onRankChange(r)} className={`${itemClass(rank === r)} flex items-center gap-2`}>
              <img src={RANK_ICONS[r]} alt={r} className="h-4 w-4" />
              {r.toUpperCase()}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Region */}
      <Popover>
        <PopoverTrigger asChild>
          <button className={triggerClass(region !== "all")}>
            {region === "all" ? "SERVER" : REGIONS.find(r => r.id === region)?.label.toUpperCase()}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1 bg-card border-white/[0.08]" align="start">
          <button onClick={() => onRegionChange("all")} className={itemClass(region === "all")}>
            ALL SERVERS
          </button>
          {REGIONS.map(r => (
            <button key={r.id} onClick={() => onRegionChange(r.id)} className={itemClass(region === r.id)}>
              {r.label.toUpperCase()}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {hasFilters && (
        <button
          onClick={() => { onGameModeChange("all"); onRankChange("all"); onRegionChange("all"); }}
          className="w-8 h-8 flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
