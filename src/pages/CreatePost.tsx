import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RANKS, RANK_ICONS, GAME_MODES, REGIONS, type GameMode, type Rank, type Region } from "@/lib/types";
import { RankIcon } from "@/components/RankIcon";
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
  const [rankRequirement, setRankRequirement] = useState<Rank | "Any">("Any");
  const [region, setRegion] = useState<Region | "">("");
  const [slotsTotal, setSlotsTotal] = useState(1);

  if (myPost) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 max-w-lg">
          <Card className="clip-angle bg-card border-border">
            <div className="h-0.5 bg-primary" />
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="font-display text-xl tracking-wider text-foreground">ACTIVE POST EXISTS</h2>
              <p className="text-sm text-muted-foreground">You already have an active lobby. Complete or delete it before creating a new one.</p>
              <Button asChild className="clip-angle-sm font-display tracking-wider">
                <Link to="/">GO TO FEED</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riotId.trim()) { toast({ title: "Enter your Riot ID", variant: "destructive" }); return; }
    if (!partyCode.trim()) { toast({ title: "Enter a Party Code", variant: "destructive" }); return; }

    createPost({
      riotId: riotId.trim(),
      partyCode: partyCode.trim(),
      gameMode,
      rankRequirement,
      slotsTotal,
      region: region || undefined,
      authorId: user?.id,
    });
    toast({ title: "Lobby created!" });
    navigate("/");
  };

  const gameModeIcons: Record<GameMode, React.ReactNode> = {
    Competitive: <Swords className="h-4 w-4" />,
    Unrated: <Gamepad2 className="h-4 w-4" />,
    Others: <Globe className="h-4 w-4" />,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-lg">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to feed
        </Link>

        <Card className="clip-angle bg-card border-border">
          <div className="h-0.5 bg-primary" />
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-[0.15em]">CREATE LFG POST</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="font-display text-xs tracking-wider">RIOT ID</Label>
                <Input value={riotId} onChange={e => setRiotId(e.target.value)} placeholder="Player#NA1" className="bg-secondary border-border" />
              </div>

              <div className="space-y-2">
                <Label className="font-display text-xs tracking-wider">PARTY CODE</Label>
                <Input value={partyCode} onChange={e => setPartyCode(e.target.value)} placeholder="Enter Valorant party code" className="bg-secondary border-border font-mono tracking-widest" />
              </div>

              {/* Game Mode - button group */}
              <div className="space-y-2">
                <Label className="font-display text-xs tracking-wider">GAME MODE</Label>
                <div className="grid grid-cols-3 gap-2">
                  {GAME_MODES.map(mode => (
                    <Button
                      key={mode}
                      type="button"
                      variant={gameMode === mode ? "default" : "outline"}
                      className="clip-angle-sm font-display text-xs tracking-wider h-10 gap-1.5"
                      onClick={() => setGameMode(mode)}
                    >
                      {gameModeIcons[mode]}
                      {mode.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Rank Requirement - visual grid */}
              <div className="space-y-2">
                <Label className="font-display text-xs tracking-wider">RANK REQUIREMENT <span className="text-muted-foreground">(optional)</span></Label>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => setRankRequirement("Any")}
                    className={`flex flex-col items-center gap-1 p-2 border transition-colors clip-angle-sm ${
                      rankRequirement === "Any" ? "border-primary bg-primary/10" : "border-border bg-secondary hover:border-muted-foreground/30"
                    }`}
                  >
                    <span className="font-display text-[10px] tracking-wider text-muted-foreground">ANY</span>
                  </button>
                  {RANKS.map(rank => (
                    <button
                      key={rank}
                      type="button"
                      onClick={() => setRankRequirement(rank)}
                      className={`flex flex-col items-center gap-1 p-2 border transition-colors clip-angle-sm ${
                        rankRequirement === rank ? "border-primary bg-primary/10" : "border-border bg-secondary hover:border-muted-foreground/30"
                      }`}
                    >
                      <img src={RANK_ICONS[rank]} alt={rank} className="h-6 w-6 object-contain" />
                      <span className="font-display text-[10px] tracking-wider text-muted-foreground">{rank.slice(0, 4).toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Region - optional */}
              <div className="space-y-2">
                <Label className="font-display text-xs tracking-wider">SERVER <span className="text-muted-foreground">(optional)</span></Label>
                <div className="grid grid-cols-2 gap-2">
                  {REGIONS.map(r => (
                    <Button
                      key={r.id}
                      type="button"
                      variant={region === r.id ? "default" : "outline"}
                      className="clip-angle-sm font-display text-xs tracking-wider h-9"
                      onClick={() => setRegion(region === r.id ? "" : r.id)}
                    >
                      {r.label.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Slots */}
              <div className="space-y-2">
                <Label className="font-display text-xs tracking-wider">SLOTS NEEDED</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <Button
                      key={n}
                      type="button"
                      variant={slotsTotal === n ? "default" : "outline"}
                      className="flex-1 font-display text-lg clip-angle-sm"
                      onClick={() => setSlotsTotal(n)}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full clip-angle-sm font-display text-sm tracking-[0.15em] h-12 glow-red-strong">
                POST LOBBY
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreatePost;
