import ironIcon from "@/assets/ranks/iron.png";
import bronzeIcon from "@/assets/ranks/bronze.png";
import silverIcon from "@/assets/ranks/silver.png";
import goldIcon from "@/assets/ranks/gold.png";
import platinumIcon from "@/assets/ranks/platinum.png";
import diamondIcon from "@/assets/ranks/diamond.png";
import ascendantIcon from "@/assets/ranks/ascendant.png";
import immortalIcon from "@/assets/ranks/immortal.png";
import radiantIcon from "@/assets/ranks/radiant.png";
import unrankedIcon from "@/assets/ranks/unranked.png";

export const RANKS = [
  "Iron", "Bronze", "Silver", "Gold", "Platinum",
  "Diamond", "Ascendant", "Immortal", "Radiant",
] as const;

export type Rank = typeof RANKS[number];

export const RANK_ICONS: Record<Rank, string> = {
  Iron: ironIcon,
  Bronze: bronzeIcon,
  Silver: silverIcon,
  Gold: goldIcon,
  Platinum: platinumIcon,
  Diamond: diamondIcon,
  Ascendant: ascendantIcon,
  Immortal: immortalIcon,
  Radiant: radiantIcon,
};

export const UNRANKED_ICON = unrankedIcon;

export const GAME_MODES = ["Competitive", "Unrated", "Others"] as const;
export type GameMode = typeof GAME_MODES[number];

export const REGIONS = [
  { id: "manila", label: "Manila" },
  { id: "hongkong", label: "Hong Kong" },
  { id: "singapore", label: "Singapore" },
  { id: "tokyo", label: "Tokyo" },
  { id: "sydney", label: "Sydney" },
  { id: "others", label: "Others" },
] as const;

export type Region = typeof REGIONS[number]["id"];

export type PostStatus = "active" | "full" | "completed" | "expired";

export interface LFGPost {
  id: string;
  riotId: string;
  partyCode: string;
  gameMode: GameMode;
  rankRequirement: Rank | "Any";
  region?: Region;
  slotsTotal: number;
  slotsFilled: number;
  status: PostStatus;
  createdAt: number;
  lastActivityAt: number;
  joiners: Joiner[];
  authorId?: string;
}

export interface Joiner {
  id: string;
  riotId: string;
  joinedAt: number;
}

export interface UserProfile {
  id: string;
  username: string;
  riotId: string;
  email: string;
  createdAt: number;
}
