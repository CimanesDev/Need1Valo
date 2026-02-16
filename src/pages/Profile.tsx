import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { fetchAccount, fetchMMR, fetchMatchHistory } from "@/lib/henrikdev";
import { toast } from "@/hooks/use-toast";
import {
  Search, ShieldCheck, Loader2, ArrowLeft, Crosshair,
  Target, Skull, Swords, TrendingUp, TrendingDown, ChevronDown, ChevronUp,
  Clock, Flame, Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { ValorantAccount, ValorantMMR, ValorantMatch, ValorantMatchPlayer, Rank } from "@/lib/types";
import { RANKS } from "@/lib/types";

function tierToRank(tierName: string): Rank | null {
  const base = tierName.split(" ")[0];
  return RANKS.find((r) => r.toLowerCase() === base.toLowerCase()) ?? null;
}

// ─── Stat helpers ────────────────────────────────────────

interface AggregatedStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  kd: number;
  kda: number;
  avgScore: number;
  avgDamage: number;
  headshotPct: number;
  totalHeadshots: number;
  totalBodyshots: number;
  totalLegshots: number;
}

interface AgentStats {
  name: string;
  agentId: string;
  matches: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  avgScore: number;
  headshotPct: number;
}

function computeStats(
  matches: ValorantMatch[],
  accountName: string,
  accountTag: string
): { stats: AggregatedStats; agents: AgentStats[] } {
  const agentMap = new Map<
    string,
    { name: string; id: string; matches: number; wins: number; kills: number; deaths: number; assists: number; score: number; hs: number; bs: number; ls: number }
  >();

  let wins = 0,
    totalKills = 0,
    totalDeaths = 0,
    totalAssists = 0,
    totalScore = 0,
    totalDamage = 0,
    totalHS = 0,
    totalBS = 0,
    totalLS = 0;

  const counted = matches.filter((m) => {
    const p = findPlayer(m, accountName, accountTag);
    return !!p;
  });

  for (const match of counted) {
    const player = findPlayer(match, accountName, accountTag)!;
    const team = match.teams?.find((t) => t.team_id === player.team_id);
    const won = team ? team.rounds.won > team.rounds.lost : false;
    if (won) wins++;

    const k = player.stats?.kills ?? 0;
    const d = player.stats?.deaths ?? 0;
    const a = player.stats?.assists ?? 0;
    const s = player.stats?.score ?? 0;
    const dmg = player.stats?.damage?.dealt ?? 0;
    const hs = player.stats?.headshots ?? 0;
    const bs = player.stats?.bodyshots ?? 0;
    const ls = player.stats?.legshots ?? 0;

    totalKills += k;
    totalDeaths += d;
    totalAssists += a;
    totalScore += s;
    totalDamage += dmg;
    totalHS += hs;
    totalBS += bs;
    totalLS += ls;

    const agentName = player.agent?.name ?? "Unknown";
    const agentId = player.agent?.id ?? "unknown";
    const key = agentName.toLowerCase();
    const existing = agentMap.get(key);
    if (existing) {
      existing.matches++;
      if (won) existing.wins++;
      existing.kills += k;
      existing.deaths += d;
      existing.assists += a;
      existing.score += s;
      existing.hs += hs;
      existing.bs += bs;
      existing.ls += ls;
    } else {
      agentMap.set(key, {
        name: agentName,
        id: agentId,
        matches: 1,
        wins: won ? 1 : 0,
        kills: k,
        deaths: d,
        assists: a,
        score: s,
        hs,
        bs,
        ls,
      });
    }
  }

  const n = counted.length || 1;
  const totalShots = totalHS + totalBS + totalLS;

  const stats: AggregatedStats = {
    totalMatches: counted.length,
    wins,
    losses: counted.length - wins,
    winRate: counted.length > 0 ? (wins / counted.length) * 100 : 0,
    totalKills,
    totalDeaths,
    totalAssists,
    avgKills: totalKills / n,
    avgDeaths: totalDeaths / n,
    avgAssists: totalAssists / n,
    kd: totalDeaths > 0 ? totalKills / totalDeaths : totalKills,
    kda: totalDeaths > 0 ? (totalKills + totalAssists) / totalDeaths : totalKills + totalAssists,
    avgScore: totalScore / n,
    avgDamage: totalDamage / n,
    headshotPct: totalShots > 0 ? (totalHS / totalShots) * 100 : 0,
    totalHeadshots: totalHS,
    totalBodyshots: totalBS,
    totalLegshots: totalLS,
  };

  const agents: AgentStats[] = Array.from(agentMap.values())
    .map((a) => {
      const aN = a.matches || 1;
      const aShots = a.hs + a.bs + a.ls;
      return {
        name: a.name,
        agentId: a.id,
        matches: a.matches,
        wins: a.wins,
        kills: a.kills,
        deaths: a.deaths,
        assists: a.assists,
        avgScore: a.score / aN,
        headshotPct: aShots > 0 ? (a.hs / aShots) * 100 : 0,
      };
    })
    .sort((a, b) => b.matches - a.matches);

  return { stats, agents };
}

function findPlayer(match: ValorantMatch, name: string, tag: string): ValorantMatchPlayer | undefined {
  return match.players?.find(
    (p) => p.name.toLowerCase() === name.toLowerCase() && p.tag.toLowerCase() === tag.toLowerCase()
  );
}

function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  return `${mins}m`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Components ──────────────────────────────────────────

function StatBox({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] p-3 sm:p-4 clip-angle-sm">
      <p className="font-display text-[10px] tracking-[0.2em] text-muted-foreground/60 mb-1">{label}</p>
      <p className={`font-display text-xl sm:text-2xl font-bold tracking-wide leading-none ${color ?? "text-foreground"}`}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground/40 font-display tracking-wider mt-1">{sub}</p>}
    </div>
  );
}

function HitsBar({ hs, bs, ls }: { hs: number; bs: number; ls: number }) {
  const total = hs + bs + ls;
  if (total === 0) return null;
  const hsPct = (hs / total) * 100;
  const bsPct = (bs / total) * 100;
  const lsPct = (ls / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex h-2 w-full overflow-hidden clip-angle-sm">
        <div className="bg-primary" style={{ width: `${hsPct}%` }} title={`Head ${hsPct.toFixed(1)}%`} />
        <div className="bg-blue-500" style={{ width: `${bsPct}%` }} title={`Body ${bsPct.toFixed(1)}%`} />
        <div className="bg-muted-foreground/40" style={{ width: `${lsPct}%` }} title={`Legs ${lsPct.toFixed(1)}%`} />
      </div>
      <div className="flex items-center gap-4 text-[10px] font-display tracking-wider text-muted-foreground/60">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-primary inline-block" /> HEAD {hsPct.toFixed(1)}%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 inline-block" /> BODY {bsPct.toFixed(1)}%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-muted-foreground/40 inline-block" /> LEGS {lsPct.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function AgentCard({ agent, maxMatches }: { agent: AgentStats; maxMatches: number }) {
  const wr = agent.matches > 0 ? (agent.wins / agent.matches) * 100 : 0;
  const kd = agent.deaths > 0 ? agent.kills / agent.deaths : agent.kills;
  const barWidth = maxMatches > 0 ? (agent.matches / maxMatches) * 100 : 0;

  return (
    <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] clip-angle-sm group hover:border-white/[0.1] transition-colors">
      <div className="w-10 h-10 bg-white/[0.04] clip-angle-sm flex items-center justify-center shrink-0 overflow-hidden">
        <img
          src={`https://media.valorant-api.com/agents/${agent.agentId}/displayicon.png`}
          alt={agent.name}
          className="w-9 h-9 object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-display text-sm font-bold tracking-wider text-foreground truncate">{agent.name.toUpperCase()}</p>
          <span className="font-display text-[10px] tracking-wider text-muted-foreground/50 shrink-0 ml-2">{agent.matches} {agent.matches === 1 ? "MATCH" : "MATCHES"}</span>
        </div>
        {/* Usage bar */}
        <div className="h-1 w-full bg-white/[0.04] mb-1.5 overflow-hidden">
          <div className="h-full bg-primary/60 transition-all" style={{ width: `${barWidth}%` }} />
        </div>
        <div className="flex items-center gap-3 text-[10px] font-display tracking-wider text-muted-foreground/50">
          <span className={wr >= 50 ? "text-green-400" : "text-red-400"}>{wr.toFixed(0)}% WR</span>
          <span>{kd.toFixed(2)} KD</span>
          <span>{agent.headshotPct.toFixed(0)}% HS</span>
        </div>
      </div>
    </div>
  );
}

function MatchRow({ match, accountName, accountTag }: { match: ValorantMatch; accountName: string; accountTag: string }) {
  const [expanded, setExpanded] = useState(false);
  const player = findPlayer(match, accountName, accountTag);
  const team = player ? match.teams?.find((t) => t.team_id === player.team_id) : null;
  const won = team ? team.rounds.won > team.rounds.lost : false;
  const draw = team ? team.rounds.won === team.rounds.lost : false;
  const score = team ? `${team.rounds.won}–${team.rounds.lost}` : "";

  const k = player?.stats?.kills ?? 0;
  const d = player?.stats?.deaths ?? 0;
  const a = player?.stats?.assists ?? 0;
  const kd = d > 0 ? (k / d).toFixed(2) : k.toFixed(2);
  const hs = player?.stats?.headshots ?? 0;
  const bs = player?.stats?.bodyshots ?? 0;
  const ls = player?.stats?.legshots ?? 0;
  const totalShots = hs + bs + ls;
  const hsPct = totalShots > 0 ? ((hs / totalShots) * 100).toFixed(0) : "0";
  const damage = player?.stats?.damage?.dealt ?? 0;
  const avgScore = player?.stats?.score ?? 0;
  const duration = match.metadata?.game_length_in_ms ? formatDuration(match.metadata.game_length_in_ms) : "";

  const resultColor = draw ? "text-yellow-400" : won ? "text-green-400" : "text-red-400";
  const resultBorder = draw ? "border-yellow-500/15 bg-yellow-500/[0.02]" : won ? "border-green-500/15 bg-green-500/[0.02]" : "border-red-500/15 bg-red-500/[0.02]";
  const resultLabel = draw ? "DRAW" : won ? "WIN" : "LOSS";

  return (
    <div className={`border clip-angle-sm overflow-hidden transition-colors ${resultBorder}`}>
      {/* Main row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 sm:gap-3 p-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        {/* Result */}
        <div className="w-10 shrink-0 text-center">
          <span className={`font-display text-xs font-bold tracking-wider ${resultColor}`}>{resultLabel}</span>
          <p className="font-display text-[10px] text-muted-foreground/40 tracking-wider">{score}</p>
        </div>

        {/* Vertical divider */}
        <div className={`w-0.5 h-10 shrink-0 ${draw ? "bg-yellow-500/20" : won ? "bg-green-500/20" : "bg-red-500/20"}`} />

        {/* Agent + Map */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 bg-white/[0.04] clip-angle-sm flex items-center justify-center shrink-0 overflow-hidden">
            {player?.agent?.id && (
              <img
                src={`https://media.valorant-api.com/agents/${player.agent.id}/displayicon.png`}
                alt={player?.agent?.name ?? ""}
                className="w-7 h-7 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-display text-xs tracking-wider text-foreground truncate">
              {player?.agent?.name?.toUpperCase() ?? "?"}
            </p>
            <p className="text-[10px] text-muted-foreground/40 font-display tracking-wider truncate">
              {match.metadata?.map?.name ?? "Unknown"} · {match.metadata?.queue?.name ?? ""}
            </p>
          </div>
        </div>

        {/* KDA */}
        <div className="hidden sm:block text-center shrink-0 w-20">
          <p className="font-display text-sm font-bold tracking-wider text-foreground">
            {k}<span className="text-muted-foreground/40">/</span>{d}<span className="text-muted-foreground/40">/</span>{a}
          </p>
          <p className="text-[10px] text-muted-foreground/40 font-display tracking-wider">{kd} KD</p>
        </div>

        {/* HS % */}
        <div className="hidden md:block text-center shrink-0 w-14">
          <p className="font-display text-sm font-bold tracking-wider text-foreground">{hsPct}%</p>
          <p className="text-[10px] text-muted-foreground/40 font-display tracking-wider">HS</p>
        </div>

        {/* Time */}
        <div className="text-right shrink-0 w-12">
          <p className="text-[10px] text-muted-foreground/30 font-display tracking-wider">
            {match.metadata?.started_at ? timeAgo(match.metadata.started_at) : ""}
          </p>
          {duration && <p className="text-[10px] text-muted-foreground/20 font-display tracking-wider">{duration}</p>}
        </div>

        {/* Chevron */}
        <div className="shrink-0 text-muted-foreground/30">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/[0.04] p-3 sm:p-4 space-y-3 bg-white/[0.01]">
          {/* Mobile KDA (shown only on small screens) */}
          <div className="sm:hidden flex items-center gap-4">
            <div>
              <p className="font-display text-sm font-bold tracking-wider text-foreground">
                {k}<span className="text-muted-foreground/40">/</span>{d}<span className="text-muted-foreground/40">/</span>{a}
              </p>
              <p className="text-[10px] text-muted-foreground/40 font-display tracking-wider">{kd} KD</p>
            </div>
            <div>
              <p className="font-display text-sm font-bold tracking-wider text-foreground">{hsPct}%</p>
              <p className="text-[10px] text-muted-foreground/40 font-display tracking-wider">HEADSHOT</p>
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <div className="bg-white/[0.02] p-2 clip-angle-sm">
              <p className="text-[9px] text-muted-foreground/40 font-display tracking-[0.2em]">SCORE</p>
              <p className="font-display text-sm font-bold text-foreground">{avgScore.toLocaleString()}</p>
            </div>
            <div className="bg-white/[0.02] p-2 clip-angle-sm">
              <p className="text-[9px] text-muted-foreground/40 font-display tracking-[0.2em]">DAMAGE</p>
              <p className="font-display text-sm font-bold text-foreground">{damage.toLocaleString()}</p>
            </div>
            <div className="bg-white/[0.02] p-2 clip-angle-sm">
              <p className="text-[9px] text-muted-foreground/40 font-display tracking-[0.2em]">DMG/RND</p>
              <p className="font-display text-sm font-bold text-foreground">
                {team ? Math.round(damage / Math.max(team.rounds.won + team.rounds.lost, 1)) : "—"}
              </p>
            </div>
            {player?.ability_casts && (
              <>
                <div className="bg-white/[0.02] p-2 clip-angle-sm">
                  <p className="text-[9px] text-muted-foreground/40 font-display tracking-[0.2em]">ABILITIES</p>
                  <p className="font-display text-sm font-bold text-foreground">
                    {(player.ability_casts.grenade ?? 0) + (player.ability_casts.ability1 ?? 0) + (player.ability_casts.ability2 ?? 0) + (player.ability_casts.ultimate ?? 0)}
                  </p>
                </div>
                <div className="bg-white/[0.02] p-2 clip-angle-sm">
                  <p className="text-[9px] text-muted-foreground/40 font-display tracking-[0.2em]">ULTS</p>
                  <p className="font-display text-sm font-bold text-primary">{player.ability_casts.ultimate ?? 0}</p>
                </div>
              </>
            )}
          </div>

          {/* Hit distribution */}
          <div>
            <p className="text-[10px] text-muted-foreground/40 font-display tracking-[0.2em] mb-1.5">HIT DISTRIBUTION</p>
            <HitsBar hs={hs} bs={bs} ls={ls} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<ValorantAccount | null>(null);
  const [mmr, setMMR] = useState<ValorantMMR | null>(null);
  const [matches, setMatches] = useState<ValorantMatch[]>([]);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "matches" | "agents">("overview");
  const [modeFilter, setModeFilter] = useState<"all" | "competitive" | "unrated" | "deathmatch" | "swiftplay">("competitive");

  const MODE_FILTERS = [
    { id: "all" as const, label: "ALL" },
    { id: "competitive" as const, label: "COMP" },
    { id: "unrated" as const, label: "UNRATED" },
    { id: "deathmatch" as const, label: "DM" },
    { id: "swiftplay" as const, label: "SWIFT" },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const parts = query.trim().split("#");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      toast({ title: "Enter a valid Riot ID (Name#Tag)", variant: "destructive" });
      return;
    }
    const [name, tag] = parts;
    setLoading(true);
    setError("");
    setAccount(null);
    setMMR(null);
    setMatches([]);
    setActiveTab("overview");

    const [accRes, mmrRes, matchRes] = await Promise.all([
      fetchAccount(name, tag),
      fetchMMR(name, tag),
      fetchMatchHistory(name, tag),
    ]);

    setLoading(false);

    if (accRes.error) {
      setError(accRes.error);
      return;
    }
    setAccount(accRes.data);
    if (mmrRes.data) setMMR(mmrRes.data);
    if (matchRes.data) setMatches(matchRes.data);
  };

  const filteredMatches = useMemo(() => {
    if (modeFilter === "all") return matches;
    return matches.filter((m) => {
      const queueId = (m.metadata?.queue?.id ?? "").toLowerCase();
      const queueName = (m.metadata?.queue?.name ?? "").toLowerCase();
      switch (modeFilter) {
        case "competitive": return queueId === "competitive" || queueName === "competitive";
        case "unrated": return queueId === "unrated" || queueName === "unrated";
        case "deathmatch": return queueId === "deathmatch" || queueName === "deathmatch";
        case "swiftplay": return queueId === "swiftplay" || queueName === "swiftplay";
        default: return true;
      }
    });
  }, [matches, modeFilter]);

  const computed = useMemo(() => {
    if (!account || filteredMatches.length === 0) return null;
    return computeStats(filteredMatches, account.name, account.tag);
  }, [filteredMatches, account]);

  const isOwnProfile =
    user &&
    account &&
    `${account.name}#${account.tag}`.toLowerCase() === user.riotId.toLowerCase();

  const handleVerify = () => {
    if (!mmr?.current?.tier?.name) return;
    const rank = tierToRank(mmr.current.tier.name);
    if (!rank) {
      toast({ title: "Could not determine rank", variant: "destructive" });
      return;
    }
    setVerifying(true);
    updateProfile({ verifiedRank: rank });
    toast({ title: `Rank verified: ${rank}` });
    setVerifying(false);
  };

  const tabs = [
    { id: "overview" as const, label: "OVERVIEW" },
    { id: "matches" as const, label: "MATCHES" },
    { id: "agents" as const, label: "AGENTS" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Riot ID (e.g. Player#NA1)"
              className="bg-white/[0.03] border-white/[0.08] h-10 text-sm flex-1"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-5 bg-primary text-primary-foreground font-display text-xs tracking-[0.15em] clip-angle-sm hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              SEARCH
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 clip-angle mb-4">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-display text-xs tracking-[0.2em] text-muted-foreground/40">LOADING PROFILE...</p>
            </div>
          )}

          {/* Empty state */}
          {!account && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="relative">
                <Crosshair className="h-16 w-16 text-white/[0.04]" strokeWidth={0.5} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg text-muted-foreground/30 tracking-[0.2em]">PLAYER LOOKUP</h3>
                <p className="text-sm text-muted-foreground/20 max-w-xs">
                  Search any Riot ID to see their rank, stats, and match history
                </p>
              </div>
            </div>
          )}

          {/* ─── Profile Results ─── */}
          {account && !loading && (
            <div className="space-y-4">
              {/* ─── Hero Banner ─── */}
              <div className="bg-card border border-white/[0.06] clip-angle overflow-hidden relative">
                {/* Banner background from player card */}
                {account.card?.wide && (
                  <div className="absolute inset-0 opacity-20">
                    <img src={account.card.wide} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-card" />
                  </div>
                )}
                <div className="h-0.5 bg-primary" />
                <div className="relative p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
                  {/* Player card */}
                  {account.card?.large && (
                    <div className="shrink-0 w-16 h-20 sm:w-20 sm:h-24 clip-angle-sm overflow-hidden border border-white/[0.08]">
                      <img src={account.card.large} alt="Player card" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 justify-between">
                      <div className="min-w-0">
                        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-wide text-foreground truncate leading-tight">
                          {account.name}
                          <span className="text-muted-foreground/50 font-normal text-base sm:text-lg">#{account.tag}</span>
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-muted-foreground/50 font-display tracking-wider">
                            LVL {account.account_level}
                          </span>
                          {account.region && (
                            <span className="text-[11px] text-muted-foreground/30 font-display tracking-wider uppercase">
                              {account.region}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rank inline */}
                    {mmr && (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-2 bg-white/[0.04] px-3 py-1.5 clip-angle-sm">
                          <span className="font-display text-sm font-bold tracking-wider text-foreground">
                            {mmr.current?.tier?.name ?? "Unranked"}
                          </span>
                          {mmr.current?.rr != null && (
                            <span className="text-[11px] text-muted-foreground font-display tracking-wider">
                              {mmr.current.rr} RR
                            </span>
                          )}
                          {mmr.current?.last_change != null && (
                            <span className={`text-[11px] font-display tracking-wider flex items-center gap-0.5 ${mmr.current.last_change >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {mmr.current.last_change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {mmr.current.last_change >= 0 ? "+" : ""}{mmr.current.last_change}
                            </span>
                          )}
                        </div>
                        {mmr.peak?.tier?.name && (
                          <span className="text-[10px] text-muted-foreground/30 font-display tracking-wider hidden sm:inline">
                            PEAK: {mmr.peak.tier.name}{mmr.peak.season?.short ? ` (${mmr.peak.season.short})` : ""}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Verify button */}
                {isOwnProfile && (
                  <div className="relative px-5 sm:px-6 pb-4">
                    <button
                      onClick={handleVerify}
                      disabled={verifying}
                      className="inline-flex items-center gap-2 h-9 px-5 bg-primary text-primary-foreground font-display text-xs tracking-[0.15em] clip-angle-sm hover:opacity-90 transition-opacity glow-red"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {verifying ? "VERIFYING..." : user?.verifiedRank ? "RE-VERIFY RANK" : "VERIFY RANK"}
                    </button>
                    {user?.verifiedRank && (
                      <span className="ml-3 text-[10px] text-green-400/60 font-display tracking-wider">
                        VERIFIED: {user.verifiedRank.toUpperCase()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* ─── Tabs + Mode Filter ─── */}
              {matches.length > 0 && (
                <>
                  <div className="flex gap-1 bg-white/[0.02] border border-white/[0.06] p-1 clip-angle-sm">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 h-9 font-display text-xs tracking-[0.15em] transition-all clip-angle-sm ${
                          activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Mode filter */}
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[10px] tracking-[0.2em] text-muted-foreground/40 shrink-0">MODE</span>
                    <div className="flex gap-1 flex-wrap">
                      {MODE_FILTERS.map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setModeFilter(mode.id)}
                          className={`h-7 px-3 font-display text-[10px] tracking-[0.15em] transition-all clip-angle-sm ${
                            modeFilter === mode.id
                              ? "bg-white/[0.1] text-foreground border border-white/[0.15]"
                              : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-white/[0.04] border border-transparent"
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                    {filteredMatches.length !== matches.length && (
                      <span className="text-[10px] text-muted-foreground/30 font-display tracking-wider ml-auto shrink-0">
                        {filteredMatches.length}/{matches.length}
                      </span>
                    )}
                  </div>

                  {/* No matches for filter */}
                  {filteredMatches.length === 0 && activeTab !== "matches" && (
                    <div className="bg-card border border-white/[0.06] clip-angle overflow-hidden">
                      <div className="h-0.5 bg-primary" />
                      <div className="p-8 text-center">
                        <p className="font-display text-sm tracking-wider text-muted-foreground/40">
                          No matches found for this mode
                        </p>
                        <button
                          onClick={() => setModeFilter("all")}
                          className="mt-3 text-[11px] text-primary/60 hover:text-primary font-display tracking-wider transition-colors"
                        >
                          SHOW ALL MODES
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ─── Overview Tab ─── */}
                  {activeTab === "overview" && computed && (
                    <div className="space-y-4">
                      {/* Key Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <StatBox
                          label="WIN RATE"
                          value={`${computed.stats.winRate.toFixed(1)}%`}
                          sub={`${computed.stats.wins}W ${computed.stats.losses}L`}
                          color={computed.stats.winRate >= 50 ? "text-green-400" : "text-red-400"}
                        />
                        <StatBox
                          label="K/D RATIO"
                          value={computed.stats.kd.toFixed(2)}
                          sub={`${computed.stats.totalKills}K ${computed.stats.totalDeaths}D`}
                          color={computed.stats.kd >= 1 ? "text-green-400" : "text-red-400"}
                        />
                        <StatBox
                          label="KDA"
                          value={computed.stats.kda.toFixed(2)}
                          sub={`${computed.stats.avgKills.toFixed(1)} / ${computed.stats.avgDeaths.toFixed(1)} / ${computed.stats.avgAssists.toFixed(1)}`}
                        />
                        <StatBox
                          label="HEADSHOT %"
                          value={`${computed.stats.headshotPct.toFixed(1)}%`}
                          sub={`${computed.stats.totalHeadshots} headshots`}
                          color={computed.stats.headshotPct >= 25 ? "text-primary" : "text-foreground"}
                        />
                      </div>

                      {/* Secondary Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <StatBox label="AVG SCORE" value={Math.round(computed.stats.avgScore).toLocaleString()} />
                        <StatBox label="AVG DAMAGE" value={Math.round(computed.stats.avgDamage).toLocaleString()} />
                        <StatBox label="MATCHES" value={computed.stats.totalMatches.toString()} />
                      </div>

                      {/* Hit Distribution */}
                      <div className="bg-card border border-white/[0.06] clip-angle overflow-hidden">
                        <div className="h-0.5 bg-primary" />
                        <div className="p-5">
                          <h3 className="font-display text-xs tracking-[0.15em] text-muted-foreground/60 mb-3 flex items-center gap-2">
                            <Target className="h-3.5 w-3.5 text-primary/60" />
                            SHOT DISTRIBUTION
                          </h3>
                          <HitsBar
                            hs={computed.stats.totalHeadshots}
                            bs={computed.stats.totalBodyshots}
                            ls={computed.stats.totalLegshots}
                          />
                        </div>
                      </div>

                      {/* Top Agents Preview */}
                      {computed.agents.length > 0 && (
                        <div className="bg-card border border-white/[0.06] clip-angle overflow-hidden">
                          <div className="h-0.5 bg-primary" />
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-display text-xs tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                                <Flame className="h-3.5 w-3.5 text-primary/60" />
                                TOP AGENTS
                              </h3>
                              <button
                                onClick={() => setActiveTab("agents")}
                                className="text-[10px] text-primary/60 hover:text-primary font-display tracking-wider transition-colors"
                              >
                                VIEW ALL
                              </button>
                            </div>
                            <div className="space-y-2">
                              {computed.agents.slice(0, 3).map((agent) => (
                                <AgentCard key={agent.name} agent={agent} maxMatches={computed.agents[0]?.matches ?? 1} />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recent matches preview */}
                      {filteredMatches.length > 0 && (
                        <div className="bg-card border border-white/[0.06] clip-angle overflow-hidden">
                          <div className="h-0.5 bg-primary" />
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-display text-xs tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                                <Swords className="h-3.5 w-3.5 text-primary/60" />
                                RECENT MATCHES
                              </h3>
                              <button
                                onClick={() => setActiveTab("matches")}
                                className="text-[10px] text-primary/60 hover:text-primary font-display tracking-wider transition-colors"
                              >
                                VIEW ALL
                              </button>
                            </div>
                            <div className="space-y-1.5">
                              {filteredMatches.slice(0, 5).map((match) => (
                                <MatchRow key={match.metadata.match_id} match={match} accountName={account.name} accountTag={account.tag} />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── Matches Tab ─── */}
                  {activeTab === "matches" && (
                    <div className="bg-card border border-white/[0.06] clip-angle overflow-hidden">
                      <div className="h-0.5 bg-primary" />
                      <div className="p-5">
                        <h3 className="font-display text-xs tracking-[0.15em] text-muted-foreground/60 mb-3 flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-primary/60" />
                          MATCH HISTORY ({filteredMatches.length})
                        </h3>
                        <div className="space-y-1.5">
                          {filteredMatches.map((match) => (
                            <MatchRow key={match.metadata.match_id} match={match} accountName={account.name} accountTag={account.tag} />
                          ))}
                        </div>
                        {filteredMatches.length === 0 && (
                          <p className="text-sm text-muted-foreground/30 text-center py-8">No matches for this mode</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ─── Agents Tab ─── */}
                  {activeTab === "agents" && computed && (
                    <div className="bg-card border border-white/[0.06] clip-angle overflow-hidden">
                      <div className="h-0.5 bg-primary" />
                      <div className="p-5">
                        <h3 className="font-display text-xs tracking-[0.15em] text-muted-foreground/60 mb-3 flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5 text-primary/60" />
                          AGENT PERFORMANCE ({computed.agents.length})
                        </h3>

                        {/* Agent table header */}
                        <div className="hidden sm:grid grid-cols-[1fr_60px_60px_60px_60px_60px] gap-2 px-3 py-2 text-[9px] text-muted-foreground/30 font-display tracking-[0.2em]">
                          <span>AGENT</span>
                          <span className="text-center">PLAYED</span>
                          <span className="text-center">WIN %</span>
                          <span className="text-center">KD</span>
                          <span className="text-center">HS %</span>
                          <span className="text-center">AVG SCR</span>
                        </div>

                        <div className="space-y-1.5 sm:space-y-1">
                          {computed.agents.map((agent) => {
                            const wr = agent.matches > 0 ? (agent.wins / agent.matches) * 100 : 0;
                            const kd = agent.deaths > 0 ? agent.kills / agent.deaths : agent.kills;
                            const barWidth = computed.agents[0]?.matches ? (agent.matches / computed.agents[0].matches) * 100 : 0;

                            return (
                              <div key={agent.name}>
                                {/* Mobile */}
                                <div className="sm:hidden">
                                  <AgentCard agent={agent} maxMatches={computed.agents[0]?.matches ?? 1} />
                                </div>
                                {/* Desktop table row */}
                                <div className="hidden sm:grid grid-cols-[1fr_60px_60px_60px_60px_60px] gap-2 items-center p-2.5 bg-white/[0.02] border border-white/[0.04] clip-angle-sm hover:border-white/[0.08] transition-colors">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 bg-white/[0.04] clip-angle-sm flex items-center justify-center shrink-0 overflow-hidden">
                                      <img
                                        src={`https://media.valorant-api.com/agents/${agent.agentId}/displayicon.png`}
                                        alt={agent.name}
                                        className="w-7 h-7 object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-display text-xs font-bold tracking-wider text-foreground truncate">{agent.name.toUpperCase()}</p>
                                      {/* Usage bar */}
                                      <div className="h-0.5 w-20 bg-white/[0.04] mt-1 overflow-hidden">
                                        <div className="h-full bg-primary/40" style={{ width: `${barWidth}%` }} />
                                      </div>
                                    </div>
                                  </div>
                                  <span className="font-display text-xs text-center text-muted-foreground">{agent.matches}</span>
                                  <span className={`font-display text-xs text-center font-bold ${wr >= 50 ? "text-green-400" : "text-red-400"}`}>{wr.toFixed(0)}%</span>
                                  <span className={`font-display text-xs text-center font-bold ${kd >= 1 ? "text-green-400" : "text-red-400"}`}>{kd.toFixed(2)}</span>
                                  <span className="font-display text-xs text-center text-foreground">{agent.headshotPct.toFixed(0)}%</span>
                                  <span className="font-display text-xs text-center text-muted-foreground">{Math.round(agent.avgScore)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {computed.agents.length === 0 && (
                          <p className="text-sm text-muted-foreground/30 text-center py-8">No agent data available</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* If account found but no matches at all */}
              {matches.length === 0 && (
                <div className="bg-card border border-white/[0.06] clip-angle overflow-hidden">
                  <div className="h-0.5 bg-primary" />
                  <div className="p-8 text-center">
                    <p className="font-display text-sm tracking-wider text-muted-foreground/40">
                      No recent match data available
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
