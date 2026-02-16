import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Crosshair, Plus, User, LogOut, Menu, X, Search, Target } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/AuthModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const navLinkClass = (active: boolean) =>
    `relative font-display text-[11px] tracking-[0.18em] px-3 py-1.5 transition-all ${
      active
        ? "text-foreground"
        : "text-muted-foreground/60 hover:text-foreground"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/50 backdrop-blur-2xl">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative flex items-center justify-center w-7 h-7">
              <Crosshair className="h-[18px] w-[18px] text-primary transition-transform duration-500 group-hover:rotate-90" strokeWidth={1.5} />
            </div>
            <span className="font-display text-base sm:text-lg font-bold tracking-[0.12em] text-foreground">
              NEED<span className="text-primary">1</span>VALO
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {isHome && (
              <a href="#feed" className={navLinkClass(false)}>
                LOBBIES
              </a>
            )}
            <Link to="/profile" className={navLinkClass(location.pathname === "/profile")}>
              <span className="flex items-center gap-1.5">
                <Target className="h-3 w-3" />
                STATS
              </span>
            </Link>

            <div className="w-px h-4 bg-white/[0.06] mx-1.5" />

            <Link
              to="/create"
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-display text-[11px] tracking-[0.15em] h-8 px-4 clip-angle-sm hover:opacity-90 active:scale-[0.97] transition-all"
            >
              <Plus className="h-3 w-3" />
              POST
            </Link>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 border border-white/[0.06] bg-white/[0.02] text-foreground font-display text-[11px] tracking-[0.15em] h-8 px-3.5 clip-angle-sm hover:bg-white/[0.05] hover:border-white/[0.1] transition-all ml-1">
                    <User className="h-3 w-3 text-muted-foreground/60" />
                    <span className="max-w-[80px] truncate">{user?.username.toUpperCase()}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-white/[0.06] min-w-[160px]">
                  <DropdownMenuItem className="text-[11px] text-muted-foreground/50 font-display tracking-wider">
                    {user?.riotId || "No Riot ID set"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-[11px] font-display tracking-wider text-primary cursor-pointer">
                    <LogOut className="h-3 w-3 mr-1.5" /> SIGN OUT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="inline-flex items-center gap-1.5 border border-white/[0.06] bg-white/[0.02] text-foreground/80 font-display text-[11px] tracking-[0.15em] h-8 px-3.5 clip-angle-sm hover:bg-white/[0.05] hover:border-white/[0.1] hover:text-foreground transition-all ml-1"
              >
                <User className="h-3 w-3 text-muted-foreground/60" />
                SIGN IN
              </button>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden flex items-center justify-center w-8 h-8 text-foreground/70 hover:text-foreground transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Bottom border — subtle gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden bg-background/95 backdrop-blur-2xl border-b border-white/[0.06]">
            <div className="flex flex-col p-4 gap-1">
              {isHome && (
                <a
                  href="#feed"
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-sm tracking-[0.15em] text-muted-foreground/60 hover:text-foreground px-3 py-3 transition-colors"
                >
                  LOBBIES
                </a>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2.5 font-display text-sm tracking-[0.15em] text-muted-foreground/60 hover:text-foreground px-3 py-3 transition-colors"
              >
                <Target className="h-4 w-4" />
                STAT CHECKER
              </Link>

              <div className="h-px bg-white/[0.04] my-1" />

              <Link
                to="/create"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-sm tracking-[0.15em] h-11 px-5 clip-angle-sm hover:opacity-90 transition-opacity justify-center"
              >
                <Plus className="h-4 w-4" />
                CREATE POST
              </Link>
              {isLoggedIn ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="inline-flex items-center gap-2 border border-white/[0.06] bg-white/[0.02] text-foreground/80 font-display text-sm tracking-[0.15em] h-11 px-5 clip-angle-sm justify-center hover:bg-white/[0.05] transition-all"
                >
                  <LogOut className="h-4 w-4 text-primary" />
                  SIGN OUT
                </button>
              ) : (
                <button
                  onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                  className="inline-flex items-center gap-2 border border-white/[0.06] bg-white/[0.02] text-foreground/80 font-display text-sm tracking-[0.15em] h-11 px-5 clip-angle-sm justify-center hover:bg-white/[0.05] transition-all"
                >
                  <User className="h-4 w-4 text-muted-foreground/60" />
                  SIGN IN
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
