import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, LogOut, Swords, Gamepad2, Users, Globe, MapPin } from "lucide-react";
import type { LFGPost } from "@/lib/types";
import { REGIONS } from "@/lib/types";
import { RankIcon } from "@/components/RankIcon";
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

export function LFGCard({ post, isJoined, isMyPost, onJoin, onLeave }: LFGCardProps) {
  const { user } = useAuth();
  const [showCode, setShowCode] = useState(false);
  const [riotId, setRiotId] = useState(user?.riotId || getSavedRiotId());
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  const slotsRemaining = post.slotsTotal - post.slotsFilled;
  const fillPercent = (post.slotsFilled / post.slotsTotal) * 100;
  const isFull = post.status === "full";
  const regionLabel = post.region ? REGIONS.find(r => r.id === post.region)?.label : null;

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
    <Swords className="h-3.5 w-3.5 text-primary" />
  ) : post.gameMode === "Unrated" ? (
    <Gamepad2 className="h-3.5 w-3.5 text-muted-foreground" />
  ) : (
    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`clip-angle bg-card border-border overflow-hidden transition-all duration-300 ${
        isFull ? "opacity-50" : "hover:glow-red hover:border-primary/20"
      }`}>
        <div className="h-0.5 bg-primary" />
        <CardContent className="p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="font-display text-lg font-bold tracking-wide text-foreground">{post.riotId}</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {modeIcon}
                  <span className="text-xs text-muted-foreground font-display tracking-wider">{post.gameMode.toUpperCase()}</span>
                </div>
                {regionLabel && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground/60 font-display tracking-wider">{regionLabel}</span>
                  </div>
                )}
              </div>
            </div>
            <RankIcon rank={post.rankRequirement} size="lg" />
          </div>

          {/* Slots progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span className="font-display tracking-wider">{post.slotsFilled}/{post.slotsTotal} FILLED</span>
              </div>
              <span className={`font-display tracking-wider ${isFull ? "text-primary" : "text-foreground"}`}>
                {isFull ? "FULL" : `${slotsRemaining} SLOT${slotsRemaining !== 1 ? "S" : ""} LEFT`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-secondary overflow-hidden" style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 100%, 4px 100%)" }}>
              <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${fillPercent}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>

          {/* Actions */}
          {isJoined || showCode ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-secondary px-3 py-2 font-mono text-sm text-primary tracking-widest">
                  {post.partyCode}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {!isMyPost && (
                <Button variant="ghost" size="sm" onClick={onLeave} className="text-muted-foreground text-xs w-full">
                  <LogOut className="h-3 w-3 mr-1" /> Leave
                </Button>
              )}
            </div>
          ) : joining ? (
            <div className="space-y-2">
              <Input
                value={riotId}
                onChange={(e) => setRiotId(e.target.value)}
                placeholder="Your Riot ID (e.g. Player#NA1)"
                className="bg-secondary border-border text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleJoin} className="flex-1 clip-angle-sm font-display text-xs tracking-wider">
                  CONFIRM JOIN
                </Button>
                <Button variant="ghost" onClick={() => setJoining(false)} className="text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => isMyPost ? setShowCode(true) : setJoining(true)}
              disabled={isFull && !isMyPost}
              className="w-full clip-angle-sm font-display tracking-[0.15em]"
            >
              {isMyPost ? "VIEW CODE" : isFull ? "LOBBY FULL" : "JOIN"}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
