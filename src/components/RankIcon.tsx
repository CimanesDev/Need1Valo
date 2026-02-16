import { RANK_ICONS, UNRANKED_ICON, type Rank } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RankIconProps {
  rank: Rank | "Any";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeMap = { sm: "h-5 w-5", md: "h-7 w-7", lg: "h-10 w-10" };

export function RankIcon({ rank, size = "md", showLabel = false, className }: RankIconProps) {
  const icon = rank === "Any" ? UNRANKED_ICON : RANK_ICONS[rank];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <img src={icon} alt={rank} className={cn(sizeMap[size], "object-contain")} />
      {showLabel && (
        <span className="font-display text-xs tracking-wider text-foreground">{rank === "Any" ? "ANY RANK" : rank.toUpperCase()}</span>
      )}
    </div>
  );
}
