import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Copy, Check, LogOut, Swords, Gamepad2, Users, Globe, MapPin, Minus } from "lucide-react";
import type { LFGPost } from "@/lib/types";
import { REGIONS, RANK_ICONS, UNRANKED_ICON, type Rank } from "@/lib/types";
import { getSavedRiotId } from "@/hooks/use-lfg-store";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

interface LFGCardProps {
  post: LFGPost;
  isJoined: boolean;
  isMyPost: boolean;
  onJoin: (riotId: string) => void;
  onLeave: () => void;
}

function RankDisplay({ rankMin, rankMax }: { rankMin: Rank | "Any"; rankMax: Rank | "Any" }) {
  if (rankMin === "Any") {
    return <img src={UNRANKED_ICON} alt="Any" className="h-9 w-9 object-contain opacity-60" title="Any rank" />;
  }

  const minIcon = RANK_ICONS[rankMin as Rank];
  const maxIcon = RANK_ICONS[rankMax as Rank];

  if (rankMin === rankMax) {
    return <img src={minIcon} alt={rankMin} className="h-9 w-9 object-contain" title={rankMin} />;
  }

  return (
    <div className="flex items-center gap-0.5">
      <img src={minIcon} alt={rankMin} className="h-8 w-8 object-contain" title={rankMin} />
      <Minus className="h-2.5 w-2.5 text-muted-foreground/40" />
      <img src={maxIcon} alt={rankMax} className="h-8 w-8 object-contain" title={rankMax} />
    </div>
  );
}

export function LFGCard({ post, isJoined, isMyPost, onJoin, onLeave }: LFGCardProps) {
  const { user } = useAuth();
  const [showCode, setShowCode] = useState(false);
  const [riotId, setRiotId] = useState(user?.riotId || getSavedRiotId());
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  const slotsRemaining = post.slotsTotal - post.slotsFilled;
  const isFull = post.status === "full";
  const regionLabel = REGIONS.find(r => r.id === post.region)?.label ?? post.region;

  const handleJoin = () => {
    if (!riotId.trim()) {
      toast({ title: "Enter your Riot ID", variant: "destructive" });
      return;
    }
    onJoin(riotId.trim());
    setShowCode(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(post.partyCode);
    setCopied(true);
    toast({ title: "Party code copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const modeIcon = post.gameMode === "Competitive" ? (
    <Swords className="h-3 w-3 text-primary" />
  ) : post.gameMode === "Unrated" ? (
    <Gamepad2 className="h-3 w-3 text-muted-foreground" />
  ) : (
    <Globe className="h-3 w-3 text-muted-foreground" />
  );

  return (
      <div className={`bg-card border border-white/[0.06] clip-angle overflow-hidden transition-all duration-200 ${
        isFull ? "opacity-40" : "hover:border-primary/20 hover:glow-red"
      }`}>
        <div className="h-0.5 bg-primary" />
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-display text-base font-bold tracking-wide text-foreground truncate">{post.riotId}</p>
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1">
                  {modeIcon}
                  <span className="text-[11px] text-muted-foreground font-display tracking-wider">{post.gameMode.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5 text-muted-foreground/50" />
                  <span className="text-[11px] text-muted-foreground/50 font-display tracking-wider">{regionLabel}</span>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <RankDisplay rankMin={post.rankMin} rankMax={post.rankMax} />
            </div>
          </div>

          {/* Slots */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span className="font-display tracking-wider text-[11px]">{post.slotsFilled}/{post.slotsTotal} FILLED</span>
            </div>
            <span className={`font-display tracking-wider text-[11px] ${isFull ? "text-primary" : "text-foreground"}`}>
              {isFull ? "FULL" : `${slotsRemaining} SLOT${slotsRemaining !== 1 ? "S" : ""} LEFT`}
            </span>
          </div>

          {/* Actions */}
          {isJoined || showCode ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white/[0.04] border border-white/[0.06] px-3 py-2 font-mono text-sm text-primary tracking-widest clip-angle-sm">
                  {post.partyCode}
                </code>
                <button onClick={handleCopy} className="shrink-0 w-9 h-9 flex items-center justify-center border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] clip-angle-sm transition-colors">
                  {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                </button>
              </div>
              {!isMyPost && (
                <button onClick={onLeave} className="w-full flex items-center justify-center gap-1.5 text-muted-foreground/60 hover:text-muted-foreground text-[11px] font-display tracking-wider py-1.5 transition-colors">
                  <LogOut className="h-3 w-3" /> LEAVE
                </button>
              )}
            </div>
          ) : joining ? (
            <div className="space-y-2">
              <Input
                value={riotId}
                onChange={(e) => setRiotId(e.target.value)}
                placeholder="Your Riot ID (e.g. Player#NA1)"
                className="bg-white/[0.03] border-white/[0.08] text-sm h-9"
              />
              <div className="flex gap-2">
                <button onClick={handleJoin} className="flex-1 h-9 bg-primary text-primary-foreground font-display text-xs tracking-wider clip-angle-sm hover:opacity-90 transition-opacity">
                  CONFIRM
                </button>
                <button onClick={() => setJoining(false)} className="h-9 px-3 text-muted-foreground font-display text-xs tracking-wider hover:text-foreground transition-colors">
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => isMyPost ? setShowCode(true) : setJoining(true)}
              disabled={isFull && !isMyPost}
              className={`w-full h-10 font-display text-xs tracking-[0.15em] clip-angle-sm transition-all ${
                isFull && !isMyPost
                  ? "bg-white/[0.04] text-muted-foreground cursor-not-allowed"
                  : isMyPost
                    ? "bg-white/[0.06] text-foreground border border-white/[0.08] hover:bg-white/[0.1]"
                    : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
              }`}
            >
              {isMyPost ? "VIEW CODE" : isFull ? "LOBBY FULL" : "JOIN"}
            </button>
          )}
        </div>
      </div>
  );
}
