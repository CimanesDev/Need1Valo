import { RANKS, RANK_ICONS, GAME_MODES, REGIONS, type GameMode, type Rank, type Region } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, X, ChevronDown } from "lucide-react";

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Game Mode */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="clip-angle-sm font-display text-xs tracking-wider gap-1.5 h-8 border-border">
            {gameMode === "all" ? "MODE" : gameMode.toUpperCase()}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1 bg-card border-border" align="start">
          <button
            onClick={() => onGameModeChange("all")}
            className={`w-full text-left px-3 py-1.5 text-xs font-display tracking-wider transition-colors rounded-sm ${gameMode === "all" ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"}`}
          >
            ALL MODES
          </button>
          {GAME_MODES.map(m => (
            <button
              key={m}
              onClick={() => onGameModeChange(m)}
              className={`w-full text-left px-3 py-1.5 text-xs font-display tracking-wider transition-colors rounded-sm ${gameMode === m ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"}`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Rank */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="clip-angle-sm font-display text-xs tracking-wider gap-1.5 h-8 border-border">
            {rank === "all" ? "RANK" : (
              <span className="flex items-center gap-1.5">
                <img src={RANK_ICONS[rank]} alt={rank} className="h-4 w-4" />
                {rank.toUpperCase()}
              </span>
            )}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1 bg-card border-border" align="start">
          <button
            onClick={() => onRankChange("all")}
            className={`w-full text-left px-3 py-1.5 text-xs font-display tracking-wider transition-colors rounded-sm ${rank === "all" ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"}`}
          >
            ALL RANKS
          </button>
          {RANKS.map(r => (
            <button
              key={r}
              onClick={() => onRankChange(r)}
              className={`w-full text-left px-3 py-1.5 text-xs font-display tracking-wider transition-colors rounded-sm flex items-center gap-2 ${rank === r ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"}`}
            >
              <img src={RANK_ICONS[r]} alt={r} className="h-4 w-4" />
              {r.toUpperCase()}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Region */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="clip-angle-sm font-display text-xs tracking-wider gap-1.5 h-8 border-border">
            {region === "all" ? "SERVER" : REGIONS.find(r => r.id === region)?.label.toUpperCase()}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1 bg-card border-border" align="start">
          <button
            onClick={() => onRegionChange("all")}
            className={`w-full text-left px-3 py-1.5 text-xs font-display tracking-wider transition-colors rounded-sm ${region === "all" ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"}`}
          >
            ALL SERVERS
          </button>
          {REGIONS.map(r => (
            <button
              key={r.id}
              onClick={() => onRegionChange(r.id)}
              className={`w-full text-left px-3 py-1.5 text-xs font-display tracking-wider transition-colors rounded-sm ${region === r.id ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"}`}
            >
              {r.label.toUpperCase()}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { onGameModeChange("all"); onRankChange("all"); onRegionChange("all"); }}
          className="text-muted-foreground text-xs h-8 px-2"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
