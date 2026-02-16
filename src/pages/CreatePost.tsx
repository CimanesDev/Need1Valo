import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RANKS, RANK_ICONS, GAME_MODES, REGIONS, rankIndex, type GameMode, type Rank, type Region } from "@/lib/types";
import { useLFGStore, getSavedRiotId } from "@/hooks/use-lfg-store";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Gamepad2, Swords, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const CreatePost = () => {
  const navigate = useNavigate();
  const { createPost, myPost } = useLFGStore();
  const { user } = useAuth();

  const [riotId, setRiotId] = useState(user?.riotId || getSavedRiotId());
  const [partyCode, setPartyCode] = useState("");
  const [gameMode, setGameMode] = useState<GameMode>("Competitive");
  const [rankMin, setRankMin] = useState<Rank | "Any">("Any");
  const [rankMax, setRankMax] = useState<Rank | "Any">("Any");
  const [region, setRegion] = useState<Region>("manila");
  const [slotsTotal, setSlotsTotal] = useState(1);
  const [rankSelectStep, setRankSelectStep] = useState<0 | 1>(0);

  if (myPost) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm bg-card border border-white/[0.06] clip-angle overflow-hidden">
            <div className="h-0.5 bg-primary" />
            <div className="p-6 sm:p-8 text-center space-y-4">
              <h2 className="font-display text-xl tracking-wider text-foreground">ACTIVE POST EXISTS</h2>
              <p className="text-sm text-muted-foreground">Complete or delete your current lobby first.</p>
              <Link to="/" className="inline-block bg-primary text-primary-foreground font-display text-xs tracking-[0.15em] px-6 py-2.5 clip-angle-sm hover:opacity-90 transition-opacity">
                GO TO FEED
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleRankClick = (rank: Rank) => {
    if (rankSelectStep === 0) {
      setRankMin(rank);
      setRankMax(rank);
      setRankSelectStep(1);
    } else {
      const firstIdx = rankIndex(rankMin as Rank);
      const secondIdx = rankIndex(rank);
      if (firstIdx === secondIdx) {
        setRankSelectStep(0);
        return;
      }
      const lo = Math.min(firstIdx, secondIdx);
      const hi = Math.max(firstIdx, secondIdx);
      setRankMin(RANKS[lo]);
      setRankMax(RANKS[hi]);
      setRankSelectStep(0);
    }
  };

  const handleAnyRank = () => {
    setRankMin("Any");
    setRankMax("Any");
    setRankSelectStep(0);
  };

  const isRankSelected = (rank: Rank) => {
    if (rankMin === "Any") return false;
    const idx = rankIndex(rank);
    const lo = rankIndex(rankMin as Rank);
    const hi = rankIndex(rankMax as Rank);
    return idx >= lo && idx <= hi;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riotId.trim()) { toast({ title: "Enter your Riot ID", variant: "destructive" }); return; }
    if (!partyCode.trim()) { toast({ title: "Party code is required", variant: "destructive" }); return; }

    createPost({
      riotId: riotId.trim(),
      partyCode: partyCode.trim(),
      gameMode,
      rankMin,
      rankMax,
      slotsTotal,
      region,
      authorId: user?.id,
      isVerified: !!user?.verifiedRank,
    });
    toast({ title: "Lobby created!" });
    navigate("/");
  };

  const gameModeIcons: Record<GameMode, React.ReactNode> = {
    Competitive: <Swords className="h-3.5 w-3.5" />,
    Unrated: <Gamepad2 className="h-3.5 w-3.5" />,
    Others: <Globe className="h-3.5 w-3.5" />,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <div className="bg-card border border-white/[0.06] clip-angle overflow-hidden">
            <div className="h-0.5 bg-primary" />
            <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
              <h1 className="font-display text-lg tracking-[0.15em] text-foreground">CREATE LFG POST</h1>

              {/* Riot ID + Party Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-display text-[11px] tracking-wider text-muted-foreground">RIOT ID</label>
                  <Input value={riotId} onChange={e => setRiotId(e.target.value)} placeholder="Player#NA1" className="bg-white/[0.03] border-white/[0.08] h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="font-display text-[11px] tracking-wider text-muted-foreground">PARTY CODE <span className="text-primary">*</span></label>
                  <Input value={partyCode} onChange={e => setPartyCode(e.target.value)} placeholder="Enter code" className="bg-white/[0.03] border-white/[0.08] h-9 text-sm font-mono tracking-wider" required />
                </div>
              </div>

              {/* Game Mode */}
              <div className="space-y-2">
                <label className="font-display text-[11px] tracking-wider text-muted-foreground">MODE</label>
                <div className="grid grid-cols-3 gap-2">
                  {GAME_MODES.map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setGameMode(mode)}
                      className={`flex items-center justify-center gap-1.5 h-9 font-display text-[11px] tracking-wider transition-all clip-angle-sm ${
                        gameMode === mode
                          ? "bg-primary text-primary-foreground"
                          : "bg-white/[0.03] text-muted-foreground border border-white/[0.08] hover:bg-white/[0.06] hover:text-foreground"
                      }`}
                    >
                      {gameModeIcons[mode]}
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rank */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-display text-[11px] tracking-wider text-muted-foreground">RANK</label>
                  {rankSelectStep === 1 && (
                    <span className="text-[10px] text-primary font-display tracking-wider animate-pulse">TAP END OF RANGE</span>
                  )}
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  <button
                    type="button"
                    onClick={handleAnyRank}
                    className={`flex items-center justify-center aspect-square transition-all rounded-sm ${
                      rankMin === "Any"
                        ? "bg-primary/15 ring-2 ring-primary"
                        : "bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="font-display text-[9px] sm:text-[10px] tracking-wider text-muted-foreground font-bold">ANY</span>
                  </button>
                  {RANKS.map(rank => {
                    const selected = isRankSelected(rank);
                    const isEndpoint = rankMin !== "Any" && (rank === rankMin || rank === rankMax);
                    return (
                      <button
                        key={rank}
                        type="button"
                        onClick={() => handleRankClick(rank)}
                        className={`relative flex items-center justify-center aspect-square transition-all rounded-sm ${
                          selected
                            ? isEndpoint
                              ? "bg-primary/20 ring-2 ring-primary"
                              : "bg-primary/10 ring-1 ring-primary/40"
                            : "bg-white/[0.03] hover:bg-white/[0.06] hover:ring-1 hover:ring-white/10"
                        }`}
                        title={rank}
                      >
                        <img src={RANK_ICONS[rank]} alt={rank} className="h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow-lg" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Server + Slots */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-display text-[11px] tracking-wider text-muted-foreground">SERVER</label>
                  <Select value={region} onValueChange={(v) => setRegion(v as Region)}>
                    <SelectTrigger className="bg-white/[0.03] border-white/[0.08] font-display text-sm tracking-wider h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map(r => (
                        <SelectItem key={r.id} value={r.id} className="font-display text-sm tracking-wider">
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="font-display text-[11px] tracking-wider text-muted-foreground">SLOTS NEEDED</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setSlotsTotal(n)}
                        className={`flex-1 h-9 font-display text-sm transition-all clip-angle-sm ${
                          slotsTotal === n
                            ? "bg-primary text-primary-foreground"
                            : "bg-white/[0.03] text-muted-foreground border border-white/[0.08] hover:bg-white/[0.06] hover:text-foreground"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full h-11 mt-1 bg-primary text-primary-foreground font-display text-sm tracking-[0.2em] clip-angle-sm glow-red-strong hover:opacity-90 active:scale-[0.98] transition-all"
              >
                POST LOBBY
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePost;
