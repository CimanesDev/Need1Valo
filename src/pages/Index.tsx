import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { LFGCard } from "@/components/LFGCard";
import { MyPostPanel } from "@/components/MyPostPanel";
import { useLFGStore, getSavedRiotId } from "@/hooks/use-lfg-store";
import { rankIndex, RANK_ICONS, type GameMode, type Rank, type Region } from "@/lib/types";
import { Crosshair, Plus, ChevronDown, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { posts, myPost, myJoinedPostIds, joinPost, leavePost, kickJoiner, completePost } = useLFGStore();
  const [gameModeFilter, setGameModeFilter] = useState<GameMode | "all">("all");
  const [rankFilter, setRankFilter] = useState<Rank | "all">("all");
  const [regionFilter, setRegionFilter] = useState<Region | "all">("all");

  const filteredPosts = posts.filter(p => {
    if (gameModeFilter !== "all" && p.gameMode !== gameModeFilter) return false;
    if (rankFilter !== "all") {
      if (p.rankMin === "Any") { /* any rank matches */ }
      else {
        const filterIdx = rankIndex(rankFilter);
        const lo = rankIndex(p.rankMin as Rank);
        const hi = rankIndex(p.rankMax as Rank);
        if (filterIdx < lo || filterIdx > hi) return false;
      }
    }
    if (regionFilter !== "all" && p.region !== regionFilter) return false;
    return true;
  });

  const riotId = getSavedRiotId();
  const rankEntries = Object.entries(RANK_ICONS);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center">
        {/* ── Background layers ── */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,hsl(355_100%_62%/0.12),transparent_70%)]" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
          {/* Bottom border glow */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* ── Floating rank icons (decorative, desktop) ── */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <motion.img src={rankEntries[6]?.[1]} alt="" className="absolute top-[15%] left-[8%] h-16 w-16 object-contain opacity-[0.06] animate-float" initial={{ opacity: 0 }} animate={{ opacity: 0.06 }} transition={{ delay: 0.8 }} />
          <motion.img src={rankEntries[8]?.[1]} alt="" className="absolute top-[25%] right-[10%] h-20 w-20 object-contain opacity-[0.05] animate-float-delayed" initial={{ opacity: 0 }} animate={{ opacity: 0.05 }} transition={{ delay: 1 }} />
          <motion.img src={rankEntries[3]?.[1]} alt="" className="absolute bottom-[20%] left-[12%] h-14 w-14 object-contain opacity-[0.04] animate-float-delayed" initial={{ opacity: 0 }} animate={{ opacity: 0.04 }} transition={{ delay: 1.2 }} />
          <motion.img src={rankEntries[5]?.[1]} alt="" className="absolute bottom-[25%] right-[8%] h-16 w-16 object-contain opacity-[0.05] animate-float" initial={{ opacity: 0 }} animate={{ opacity: 0.05 }} transition={{ delay: 0.9 }} />
        </div>

        {/* ── Content ── */}
        <div className="relative px-4 sm:px-8 w-full max-w-4xl mx-auto text-center py-16 sm:py-0">
          <div className="space-y-8 sm:space-y-10">
            {/* Title */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-5 sm:space-y-6">
              <h1 className="font-display font-bold tracking-tight leading-[0.82]">
                <span className="text-[3.5rem] sm:text-7xl md:text-8xl lg:text-[7rem] text-foreground">NEED</span>
                <span className="text-[3.5rem] sm:text-7xl md:text-8xl lg:text-[7rem] text-primary">1</span>
                <span className="text-[3.5rem] sm:text-7xl md:text-8xl lg:text-[7rem] text-foreground">VALO</span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-lg mx-auto leading-relaxed px-2">
                Drop your party code. Fill your lobby.<br className="hidden sm:block" />
                No sign-ups, no waiting — just teammates.
              </p>
            </motion.div>

            {/* Rank strip */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }} className="flex items-center justify-center">
              <div className="flex items-center gap-1.5 sm:gap-3">
                {rankEntries.map(([rank, icon], i) => (
                  <motion.img
                    key={rank}
                    src={icon}
                    alt={rank}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 0.3, scale: 1 }}
                    whileHover={{ opacity: 1, scale: 1.25, y: -4 }}
                    transition={{ duration: 0.25, delay: 0.2 + i * 0.05 }}
                    className="h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 object-contain cursor-pointer drop-shadow-lg"
                    title={rank}
                  />
                ))}
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                to="/create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-primary text-primary-foreground font-display text-sm sm:text-base tracking-[0.2em] h-12 sm:h-14 px-10 sm:px-14 clip-angle-sm glow-red-strong hover:opacity-90 active:scale-[0.97] transition-all"
              >
                <Plus className="h-4 w-4" />
                CREATE POST
              </Link>
              <a
                href="#feed"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 border border-white/10 text-foreground font-display text-sm sm:text-base tracking-[0.2em] h-12 sm:h-14 px-10 sm:px-14 clip-angle-sm hover:bg-white/[0.04] hover:border-white/20 active:scale-[0.97] transition-all"
              >
                BROWSE LOBBIES
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.45 }} className="flex items-center justify-center gap-6 sm:gap-10 pt-1">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary/60" />
                  <p className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-none">{posts.length}</p>
                </div>
                <p className="text-[10px] text-muted-foreground/50 font-display tracking-[0.25em]">ACTIVE</p>
              </div>
              <div className="w-px h-8 bg-white/[0.06]" />
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary/60" />
                  <p className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-none">{posts.reduce((acc, p) => acc + p.slotsFilled, 0)}</p>
                </div>
                <p className="text-[10px] text-muted-foreground/50 font-display tracking-[0.25em]">QUEUED</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.a
          href="#feed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1 text-muted-foreground/25 hover:text-muted-foreground/50 transition-colors"
        >
          <span className="font-display text-[9px] tracking-[0.3em]">SCROLL</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.a>
      </section>

      {/* ─── FEED ─── */}
      <main id="feed" className="scroll-mt-14 relative">
        {/* Section background */}
        <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-transparent to-transparent h-[300px] pointer-events-none" />

        <div className="relative px-4 sm:container py-8 sm:py-12 space-y-6 sm:space-y-8">
          {myPost && (
            <MyPostPanel post={myPost} onKick={(joinerId) => kickJoiner(myPost.id, joinerId)} onComplete={() => completePost(myPost.id)} />
          )}

          {/* Section header */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-7 bg-primary" />
                  <h2 className="font-display text-2xl sm:text-3xl tracking-[0.1em] text-foreground leading-none">ACTIVE LOBBIES</h2>
                </div>
                <p className="text-sm text-muted-foreground/50 pl-4 sm:pl-[19px]">
                  {filteredPosts.length > 0
                    ? `${filteredPosts.length} ${filteredPosts.length === 1 ? 'lobby' : 'lobbies'} looking for players`
                    : 'No lobbies match your filters'
                  }
                </p>
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
            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-primary/20 via-white/[0.06] to-transparent" />
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <LFGCard post={post} isJoined={myJoinedPostIds.includes(post.id)} isMyPost={myPost?.id === post.id} onJoin={(rid) => joinPost(post.id, rid)} onLeave={() => leavePost(post.id, riotId)} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
              <div className="flex flex-col items-center justify-center py-20 sm:py-28 text-center space-y-5">
                {/* Decorative crosshair */}
                <div className="relative">
                  <Crosshair className="h-16 w-16 sm:h-20 sm:w-20 text-white/[0.03]" strokeWidth={0.5} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-lg sm:text-xl text-muted-foreground/40 tracking-[0.25em]">NO ACTIVE LOBBIES</h3>
                  <p className="text-sm text-muted-foreground/25 max-w-xs mx-auto px-4">Be the first to drop a party code and find your squad.</p>
                </div>
                <Link
                  to="/create"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-xs tracking-[0.2em] px-6 py-3 clip-angle-sm hover:opacity-90 active:scale-[0.97] transition-all glow-red mt-2"
                >
                  <Plus className="h-3.5 w-3.5" />
                  CREATE FIRST POST
                </Link>
              </div>
              {/* Border decoration */}
              <div className="absolute inset-0 border border-dashed border-white/[0.04] clip-angle-lg pointer-events-none" />
            </motion.div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/[0.04] py-6 mt-8">
        <div className="container flex items-center justify-between text-xs text-muted-foreground/40 px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <Crosshair className="h-3.5 w-3.5 text-primary/40" />
            <span className="font-display tracking-wider">NEED<span className="text-primary/40">1</span>VALO</span>
          </div>
          <span className="text-[11px]">Not affiliated with Riot Games</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
