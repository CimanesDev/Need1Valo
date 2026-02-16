import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { LFGCard } from "@/components/LFGCard";
import { MyPostPanel } from "@/components/MyPostPanel";
import { useLFGStore, getSavedRiotId } from "@/hooks/use-lfg-store";
import { useAuth } from "@/hooks/use-auth";
import { rankIndex, RANK_ICONS, type GameMode, type Rank, type Region } from "@/lib/types";
import {
  Crosshair, Plus, ChevronDown, Users, Search,
  ShieldCheck, Target, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const LOBBY_PREVIEW_COUNT = 3;

const Index = () => {
  const navigate = useNavigate();
  const { posts, myPost, myJoinedPostIds, joinPost, leavePost, kickJoiner, completePost } = useLFGStore();
  const { isLoggedIn } = useAuth();
  const [gameModeFilter, setGameModeFilter] = useState<GameMode | "all">("all");
  const [rankFilter, setRankFilter] = useState<Rank | "all">("all");
  const [regionFilter, setRegionFilter] = useState<Region | "all">("all");
  const [heroSearch, setHeroSearch] = useState("");

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

  const verifiedPosts = filteredPosts.filter(p => p.isVerified);
  const regularPosts = filteredPosts.filter(p => !p.isVerified);

  // Preview posts: show first few from the full list (unfiltered)
  const previewPosts = posts.slice(0, LOBBY_PREVIEW_COUNT);

  const riotId = getSavedRiotId();
  const rankEntries = Object.entries(RANK_ICONS);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/profile?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden min-h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,hsl(355_100%_62%/0.06),transparent_70%)]" />
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }} />
        </div>

        {/* Floating rank icons — drifting around the background */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          <img src={rankEntries[8]?.[1]} alt="" className="absolute top-[10%] left-[5%] h-24 w-24 lg:h-28 lg:w-28 object-contain opacity-[0.08] animate-float-drift-1" />
          <img src={rankEntries[7]?.[1]} alt="" className="absolute top-[6%] right-[10%] h-20 w-20 lg:h-24 lg:w-24 object-contain opacity-[0.07] animate-float-drift-2" />
          <img src={rankEntries[5]?.[1]} alt="" className="absolute top-[45%] left-[3%] h-20 w-20 lg:h-24 lg:w-24 object-contain opacity-[0.06] animate-float-drift-3" />
          <img src={rankEntries[6]?.[1]} alt="" className="absolute top-[38%] right-[4%] h-20 w-20 lg:h-24 lg:w-24 object-contain opacity-[0.07] animate-float-drift-4" />
          <img src={rankEntries[4]?.[1]} alt="" className="absolute bottom-[14%] right-[7%] h-18 w-18 lg:h-20 lg:w-20 object-contain opacity-[0.06] animate-float-drift-6" />
        </div>

        {/* Centered content */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-8 w-full max-w-2xl mx-auto">
          {/* Rank strip — above the title as a decorative element */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2.5 sm:gap-3.5 mb-7 sm:mb-9"
          >
            {rankEntries.map(([rank, icon], i) => (
              <motion.img
                key={rank}
                src={icon}
                alt={rank}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.22, scale: 1 }}
                whileHover={{ opacity: 1, scale: 1.45, y: -6, filter: "drop-shadow(0 0 10px hsl(355 100% 62% / 0.5))", transition: { type: "spring", stiffness: 400, damping: 15, delay: 0 } }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
                className="h-7 w-7 sm:h-9 sm:w-9 object-contain"
                title={rank}
              />
            ))}
          </motion.div>

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }} className="text-center mb-3 sm:mb-5">
            <h1 className="font-display font-bold tracking-[0.02em] leading-none">
              <span className="text-5xl sm:text-7xl md:text-8xl text-foreground">NEED</span>
              <span className="text-5xl sm:text-7xl md:text-8xl text-primary">1</span>
              <span className="text-5xl sm:text-7xl md:text-8xl text-foreground">VALO</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="text-center text-muted-foreground/60 text-sm sm:text-base md:text-lg max-w-md mx-auto leading-relaxed mb-8 sm:mb-10"
          >
            Find teammates, check stats, verify ranks.
            <br />
            Your Valorant hub — no hassle.
          </motion.p>

          {/* Search bar */}
          <motion.form
            onSubmit={handleHeroSearch}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md mx-auto mb-4"
          >
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20 group-focus-within:text-primary/50 transition-colors pointer-events-none" />
              <input
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Name#Tag"
                className="w-full h-11 sm:h-12 pl-10 pr-26 sm:pr-28 bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground/20 clip-angle-sm focus:outline-none focus:border-primary/30 focus:bg-white/[0.05] transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 sm:h-9 px-4 sm:px-5 bg-primary text-primary-foreground font-display text-[10px] sm:text-[11px] tracking-[0.15em] clip-angle-sm hover:opacity-90 active:scale-[0.97] transition-all flex items-center gap-1.5"
              >
                LOOKUP
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </motion.form>

          {/* Stat tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10"
          >
            {["Rank", "KDA", "HS%", "Agents", "Matches"].map((tag) => (
              <span key={tag} className="text-[9px] sm:text-[10px] text-muted-foreground/15 font-display tracking-[0.15em] uppercase">{tag}</span>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="flex items-center justify-center gap-3"
          >
            <Link
              to="/create"
              className="inline-flex items-center justify-center gap-2 h-11 px-7 sm:px-9 bg-primary text-primary-foreground font-display text-xs tracking-[0.2em] clip-angle-sm glow-red hover:opacity-90 active:scale-[0.97] transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              POST LOBBY
            </Link>
            <a
              href="#feed"
              className="inline-flex items-center justify-center gap-2 h-11 px-7 sm:px-9 bg-white/[0.03] border border-white/[0.06] text-foreground/80 font-display text-xs tracking-[0.2em] clip-angle-sm hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-foreground transition-all"
            >
              BROWSE
              {posts.length > 0 && (
                <span className="text-[10px] text-primary/50 font-display">{posts.length}</span>
              )}
            </a>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.a
          href="#feed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="relative pb-5 flex justify-center text-muted-foreground/15 hover:text-muted-foreground/30 transition-colors"
        >
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </motion.a>

        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      </section>

      {/* ─── LOBBY PREVIEW ─── */}
      {previewPosts.length > 0 && (
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-card/40 via-transparent to-transparent h-[200px] pointer-events-none" />
          <div className="relative px-4 sm:container py-10 sm:py-14">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-primary" />
                <h2 className="font-display text-lg sm:text-xl tracking-[0.1em] text-foreground leading-none">RECENT LOBBIES</h2>
              </div>
              <a href="#feed" className="inline-flex items-center gap-1.5 text-[11px] text-primary/60 hover:text-primary font-display tracking-wider transition-colors">
                VIEW ALL <ArrowRight className="h-3 w-3" />
              </a>
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {previewPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                >
                  <LFGCard
                    post={post}
                    isJoined={myJoinedPostIds.includes(post.id)}
                    isMyPost={myPost?.id === post.id}
                    onJoin={(rid) => joinPost(post.id, rid)}
                    onLeave={() => leavePost(post.id, riotId)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        </section>
      )}

      {/* ─── FEATURES ─── */}
      <section id="features" className="scroll-mt-14 relative border-t border-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-transparent to-transparent h-[400px] pointer-events-none" />
        <div className="relative px-4 sm:container py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="font-display text-2xl sm:text-4xl tracking-[0.1em] text-foreground mb-3">
              HOW IT <span className="text-primary">WORKS</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground/40 max-w-lg mx-auto">
              Everything you need to find your squad and prove your skill
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: <Plus className="h-5 w-5" />,
                title: "POST YOUR LOBBY",
                desc: "Drop your party code and rank range. Teammates find you in seconds.",
                accent: true,
              },
              {
                icon: <Target className="h-5 w-5" />,
                title: "STAT CHECKER",
                desc: "Look up any Riot ID — rank, K/D, headshot %, agents, and match history.",
              },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: "VERIFY RANK",
                desc: "Prove your rank for a badge and priority placement in the feed.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`bg-card border clip-angle overflow-hidden group hover:border-primary/20 transition-all ${
                  feature.accent ? "border-primary/10" : "border-white/[0.06]"
                }`}
              >
                <div className={`h-0.5 ${feature.accent ? "bg-primary" : "bg-white/[0.06] group-hover:bg-primary/40 transition-colors"}`} />
                <div className="p-6 space-y-3">
                  <div className={`w-10 h-10 flex items-center justify-center clip-angle-sm ${
                    feature.accent ? "bg-primary/15 text-primary" : "bg-white/[0.04] text-muted-foreground group-hover:text-primary transition-colors"
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-sm tracking-[0.15em] text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground/50 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEED ─── */}
      <main id="feed" className="scroll-mt-14 relative border-t border-white/[0.04]">
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
                  <h2 className="font-display text-2xl sm:text-3xl tracking-[0.1em] text-foreground leading-none">ALL LOBBIES</h2>
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
            <div className="h-px bg-gradient-to-r from-primary/20 via-white/[0.06] to-transparent" />
          </div>

          {/* Verified / Priority section */}
          {verifiedPosts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-primary/60" />
                <span className="font-display text-[11px] tracking-[0.2em] text-primary/60">VERIFIED</span>
                <div className="flex-1 h-px bg-primary/10" />
              </div>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {verifiedPosts.map((post, i) => (
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
            </div>
          )}

          {/* Regular posts */}
          {regularPosts.length > 0 ? (
            <div className="space-y-3">
              {verifiedPosts.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground/30" />
                  <span className="font-display text-[11px] tracking-[0.2em] text-muted-foreground/30">EVERYONE</span>
                  <div className="flex-1 h-px bg-white/[0.04]" />
                </div>
              )}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {regularPosts.map((post, i) => (
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
            </div>
          ) : verifiedPosts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
              <div className="flex flex-col items-center justify-center py-20 sm:py-28 text-center space-y-5">
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
              <div className="absolute inset-0 border border-dashed border-white/[0.04] clip-angle-lg pointer-events-none" />
            </motion.div>
          ) : null}
        </div>
      </main>

      {/* ─── VERIFY CTA ─── */}
      <section className="relative border-t border-white/[0.04]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,hsl(355_100%_62%/0.06),transparent_70%)] pointer-events-none" />
        <div className="relative px-4 sm:container py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 clip-angle-sm mx-auto">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="font-display text-xs tracking-[0.2em] text-primary">RANK VERIFICATION</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl tracking-[0.1em] text-foreground">
              PROVE YOUR <span className="text-primary">RANK</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground/40 max-w-md mx-auto leading-relaxed">
              {isLoggedIn
                ? "Look up your Riot ID, hit verify, and your posts get a badge + priority placement in the feed."
                : "Sign in, look up your Riot ID, and verify your rank. Verified players get priority posting and a trusted badge."
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/profile"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-primary text-primary-foreground font-display text-sm tracking-[0.2em] h-12 px-10 clip-angle-sm glow-red hover:opacity-90 active:scale-[0.97] transition-all"
              >
                <Target className="h-4 w-4" />
                {isLoggedIn ? "VERIFY NOW" : "LOOK UP STATS"}
              </Link>
              {!isLoggedIn && (
                <p className="text-[11px] text-muted-foreground/30 font-display tracking-wider">SIGN IN TO VERIFY</p>
              )}
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
              {[
                { step: "01", label: "SEARCH", desc: "Look up your Riot ID" },
                { step: "02", label: "VERIFY", desc: "Confirm your rank" },
                { step: "03", label: "POST", desc: "Get priority in the feed" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] p-4 clip-angle-sm">
                  <span className="font-display text-2xl font-bold text-primary/20 leading-none shrink-0">{s.step}</span>
                  <div className="text-left">
                    <p className="font-display text-xs tracking-[0.15em] text-foreground">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground/40">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.04]">
        <div className="container px-4 sm:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-primary/40" />
                <span className="font-display text-base tracking-wider text-foreground">NEED<span className="text-primary">1</span>VALO</span>
              </div>
              <p className="text-xs text-muted-foreground/30 max-w-xs">
                Find teammates, check stats, verify ranks. The fastest way to fill your Valorant lobby.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/create" className="text-xs text-muted-foreground/40 hover:text-muted-foreground font-display tracking-wider transition-colors">
                CREATE POST
              </Link>
              <Link to="/profile" className="text-xs text-muted-foreground/40 hover:text-muted-foreground font-display tracking-wider transition-colors">
                STAT CHECKER
              </Link>
              <a href="#feed" className="text-xs text-muted-foreground/40 hover:text-muted-foreground font-display tracking-wider transition-colors">
                LOBBIES
              </a>
            </div>
          </div>

          <div className="h-px bg-white/[0.04] my-6" />

          <div className="flex items-center justify-between text-[11px] text-muted-foreground/25">
            <span>Not affiliated with Riot Games</span>
            <span className="font-display tracking-wider">NEED<span className="text-primary/30">1</span>VALO © {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
