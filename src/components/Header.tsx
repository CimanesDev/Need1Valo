import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Crosshair, Plus, User, LogOut, Menu, X, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/AuthModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/60 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative flex items-center justify-center w-8 h-8">
              <Crosshair className="h-5 w-5 text-primary transition-transform duration-300 group-hover:rotate-90" />
            </div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-[0.15em] text-foreground">
              NEED<span className="text-primary">1</span>VALO
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-2">
            {isHome && (
              <a
                href="#feed"
                className="font-display text-xs tracking-[0.15em] text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors"
              >
                LOBBIES
              </a>
            )}
            <Link
              to="/profile"
              className="font-display text-xs tracking-[0.15em] text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors"
            >
              PROFILE
            </Link>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-xs tracking-[0.15em] h-9 px-5 clip-angle-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" />
              POST
            </Link>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-2 border border-white/[0.08] bg-white/[0.03] text-foreground font-display text-xs tracking-[0.15em] h-9 px-4 clip-angle-sm hover:bg-white/[0.06] transition-colors">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="max-w-[80px] truncate">{user?.username.toUpperCase()}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border min-w-[160px]">
                  <DropdownMenuItem className="text-xs text-muted-foreground font-display tracking-wider">
                    {user?.riotId || "No Riot ID set"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-xs font-display tracking-wider text-primary">
                    <LogOut className="h-3 w-3 mr-1.5" /> SIGN OUT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="inline-flex items-center gap-2 border border-white/[0.08] bg-white/[0.03] text-foreground font-display text-xs tracking-[0.15em] h-9 px-4 clip-angle-sm hover:bg-white/[0.06] transition-colors"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                SIGN IN
              </button>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden flex items-center justify-center w-9 h-9 text-foreground"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-white/[0.06] bg-background/95 backdrop-blur-xl">
            <div className="flex flex-col p-4 gap-2">
              {isHome && (
                <a
                  href="#feed"
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-sm tracking-[0.15em] text-muted-foreground hover:text-foreground px-3 py-3 transition-colors"
                >
                  LOBBIES
                </a>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 font-display text-sm tracking-[0.15em] text-muted-foreground hover:text-foreground px-3 py-3 transition-colors"
              >
                <Search className="h-4 w-4" />
                PROFILE
              </Link>
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
                  className="inline-flex items-center gap-2 border border-white/[0.08] text-foreground font-display text-sm tracking-[0.15em] h-11 px-5 clip-angle-sm justify-center"
                >
                  <LogOut className="h-4 w-4 text-primary" />
                  SIGN OUT
                </button>
              ) : (
                <button
                  onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                  className="inline-flex items-center gap-2 border border-white/[0.08] text-foreground font-display text-sm tracking-[0.15em] h-11 px-5 clip-angle-sm justify-center"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
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
