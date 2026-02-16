import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { LFGCard } from "@/components/LFGCard";
import { MyPostPanel } from "@/components/MyPostPanel";
import { useLFGStore, getSavedRiotId } from "@/hooks/use-lfg-store";
import type { GameMode, Rank, Region } from "@/lib/types";
import { Crosshair, Plus, Users, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const { posts, myPost, myJoinedPostIds, joinPost, leavePost, kickJoiner, completePost } = useLFGStore();
  const [gameModeFilter, setGameModeFilter] = useState<GameMode | "all">("all");
  const [rankFilter, setRankFilter] = useState<Rank | "all">("all");
  const [regionFilter, setRegionFilter] = useState<Region | "all">("all");

  const filteredPosts = posts.filter(p => {
    if (gameModeFilter !== "all" && p.gameMode !== gameModeFilter) return false;
    if (rankFilter !== "all" && p.rankRequirement !== rankFilter) return false;
    if (regionFilter !== "all" && p.region !== regionFilter) return false;
    return true;
  });

  const riotId = getSavedRiotId();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rotate-45 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="container relative py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 clip-angle-sm">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="font-display text-xs tracking-[0.2em] text-primary">INSTANT PARTY CODES</span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.9]">
                FIND YOUR<br /><span className="text-primary">SQUAD</span><span className="text-muted-foreground/30">.</span>
              </h1>

              <p className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
                Drop your party code. Fill your lobby. No friction — just teammates ready to queue.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="clip-angle-sm font-display text-sm tracking-[0.15em] h-13 px-8 glow-red-strong">
                  <Link to="/create"><Plus className="h-4 w-4" />CREATE POST</Link>
                </Button>
                <Button variant="outline" size="lg" className="clip-angle-sm font-display text-sm tracking-[0.15em] h-13 px-8 border-border" asChild>
                  <a href="#feed"><Users className="h-4 w-4" />BROWSE LOBBIES</a>
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="space-y-0.5">
                  <p className="font-display text-2xl font-bold text-foreground">{posts.length}</p>
                  <p className="text-xs text-muted-foreground font-display tracking-wider">ACTIVE</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="space-y-0.5">
                  <p className="font-display text-2xl font-bold text-foreground">{posts.reduce((acc, p) => acc + p.slotsFilled, 0)}</p>
                  <p className="text-xs text-muted-foreground font-display tracking-wider">QUEUED</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="hidden md:flex justify-center">
              <div className="relative w-72 h-72 lg:w-80 lg:h-80">
                <div className="absolute inset-0 border-2 border-primary/10 rotate-45" />
                <div className="absolute inset-4 border border-primary/20 rotate-45" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Crosshair className="h-32 w-32 text-primary/20" strokeWidth={0.5} />
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card border border-border px-3 py-1.5 clip-angle-sm">
                  <span className="font-display text-xs tracking-wider text-primary">COMPETITIVE</span>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-card border border-border px-3 py-1.5 clip-angle-sm">
                  <span className="font-display text-xs tracking-wider text-muted-foreground">UNRATED</span>
                </div>
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 bg-card border border-primary/30 px-3 py-1.5 clip-angle-sm">
                  <span className="font-display text-xs tracking-wider text-foreground">4/5</span>
                </div>
                <div className="absolute top-1/2 -right-3 -translate-y-1/2 bg-card border border-border px-3 py-1.5 clip-angle-sm">
                  <span className="font-mono text-xs tracking-widest text-primary">JOIN</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border bg-card/30">
        <div className="container py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Plus, label: "POST", desc: "Share your party code & rank" },
              { icon: Users, label: "FILL", desc: "Players join your lobby instantly" },
              { icon: Shield, label: "PLAY", desc: "Copy code, queue up, dominate" },
            ].map((step, i) => (
              <motion.div key={step.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 border border-primary/20 clip-angle-sm shrink-0">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold tracking-[0.15em] text-foreground">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feed */}
      <main id="feed" className="container py-8 space-y-6">
        {myPost && (
          <MyPostPanel post={myPost} onKick={(joinerId) => kickJoiner(myPost.id, joinerId)} onComplete={() => completePost(myPost.id)} />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary" />
            <h2 className="font-display text-xl tracking-[0.15em] text-foreground">ACTIVE LOBBIES</h2>
            <span className="font-display text-xs tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 clip-angle-sm">{filteredPosts.length}</span>
          </div>
          <FilterBar
            gameMode={gameModeFilter}
            rank={rankFilter}
            region={regionFilter}
            onGameModeChange={setGameModeFilter}
            onRankChange={setRankFilter}
            onRegionChange={setRegionFilter}
          />
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map(post => (
              <LFGCard key={post.id} post={post} isJoined={myJoinedPostIds.includes(post.id)} isMyPost={myPost?.id === post.id} onJoin={(rid) => joinPost(post.id, rid)} onLeave={() => leavePost(post.id, riotId)} />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-border/50 bg-card/20" style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}>
            <Crosshair className="h-12 w-12 text-muted-foreground/20" />
            <h3 className="font-display text-lg text-muted-foreground/60 tracking-[0.2em]">NO ACTIVE LOBBIES</h3>
            <p className="text-sm text-muted-foreground/40 max-w-xs">Be the first to drop a party code and find your squad.</p>
            <Button asChild className="clip-angle-sm font-display tracking-[0.15em] text-xs mt-2">
              <Link to="/create"><Plus className="h-3.5 w-3.5" />CREATE FIRST POST</Link>
            </Button>
          </motion.div>
        )}
      </main>

      <footer className="border-t border-border py-6">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Crosshair className="h-3.5 w-3.5 text-primary" />
            <span className="font-display tracking-wider">NEED<span className="text-primary">1</span>VALO</span>
          </div>
          <span>Not affiliated with Riot Games</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
