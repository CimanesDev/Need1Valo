import { useState, useEffect, useCallback } from "react";
import type { LFGPost, Joiner, GameMode, Rank, Region } from "@/lib/types";

const STORAGE_KEY = "need1valo_posts";
const RIOT_ID_KEY = "need1valo_riot_id";
const MY_POST_KEY = "need1valo_my_post_id";
const MY_JOINS_KEY = "need1valo_my_joins";
const EXPIRE_MINUTES = 20;

function loadPosts(): LFGPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePosts(posts: LFGPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function getSavedRiotId(): string {
  return localStorage.getItem(RIOT_ID_KEY) || "";
}

export function saveRiotId(id: string) {
  localStorage.setItem(RIOT_ID_KEY, id);
}

function getMyPostId(): string | null {
  return localStorage.getItem(MY_POST_KEY);
}

function setMyPostId(id: string | null) {
  if (id) localStorage.setItem(MY_POST_KEY, id);
  else localStorage.removeItem(MY_POST_KEY);
}

function getMyJoins(): string[] {
  try {
    const raw = localStorage.getItem(MY_JOINS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function setMyJoins(joins: string[]) {
  localStorage.setItem(MY_JOINS_KEY, JSON.stringify(joins));
}

export function useLFGStore() {
  const [posts, setPosts] = useState<LFGPost[]>(loadPosts);
  const [myPostId, setMyPostIdState] = useState<string | null>(getMyPostId);
  const [myJoinedPostIds, setMyJoinedPostIds] = useState<string[]>(getMyJoins);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosts(prev => {
        const now = Date.now();
        const cleaned = prev.filter(p => {
          if (p.status === "completed" || p.status === "expired") return false;
          if (p.status === "active" && p.slotsFilled === 0 && now - p.lastActivityAt > EXPIRE_MINUTES * 60 * 1000) return false;
          return true;
        });
        if (cleaned.length !== prev.length) savePosts(cleaned);
        return cleaned;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { savePosts(posts); }, [posts]);
  useEffect(() => { setMyPostId(myPostId); }, [myPostId]);
  useEffect(() => { setMyJoins(myJoinedPostIds); }, [myJoinedPostIds]);

  const createPost = useCallback((data: {
    riotId: string; partyCode: string; gameMode: GameMode;
    rankMin: Rank | "Any"; rankMax: Rank | "Any"; slotsTotal: number;
    region: Region; authorId?: string; isVerified?: boolean;
  }) => {
    const post: LFGPost = {
      id: crypto.randomUUID(),
      ...data,
      slotsFilled: 0,
      status: "active",
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      joiners: [],
    };
    setPosts(prev => [post, ...prev]);
    setMyPostIdState(post.id);
    saveRiotId(data.riotId);
    return post;
  }, []);

  const joinPost = useCallback((postId: string, riotId: string) => {
    const joiner: Joiner = { id: crypto.randomUUID(), riotId, joinedAt: Date.now() };
    setPosts(prev => prev.map(p => {
      if (p.id !== postId || p.slotsFilled >= p.slotsTotal) return p;
      const updated = { ...p, slotsFilled: p.slotsFilled + 1, lastActivityAt: Date.now(), joiners: [...p.joiners, joiner] };
      if (updated.slotsFilled >= updated.slotsTotal) updated.status = "full";
      return updated;
    }));
    setMyJoinedPostIds(prev => [...prev, postId]);
    saveRiotId(riotId);
  }, []);

  const leavePost = useCallback((postId: string, riotId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const updated = { ...p, slotsFilled: Math.max(0, p.slotsFilled - 1), joiners: p.joiners.filter(j => j.riotId !== riotId), lastActivityAt: Date.now() };
      if (updated.status === "full" && updated.slotsFilled < updated.slotsTotal) updated.status = "active";
      return updated;
    }));
    setMyJoinedPostIds(prev => prev.filter(id => id !== postId));
  }, []);

  const kickJoiner = useCallback((postId: string, joinerId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const updated = { ...p, slotsFilled: Math.max(0, p.slotsFilled - 1), joiners: p.joiners.filter(j => j.id !== joinerId), lastActivityAt: Date.now() };
      if (updated.status === "full" && updated.slotsFilled < updated.slotsTotal) updated.status = "active";
      return updated;
    }));
  }, []);

  const completePost = useCallback((postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    if (myPostId === postId) setMyPostIdState(null);
  }, [myPostId]);

  const activePosts = posts
    .filter(p => p.status === "active" || p.status === "full")
    .sort((a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0));
  const myPost = posts.find(p => p.id === myPostId) || null;

  return { posts: activePosts, myPost, myJoinedPostIds, createPost, joinPost, leavePost, kickJoiner, completePost };
}
