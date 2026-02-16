import { useState } from "react";
import { Link } from "react-router-dom";
import { Crosshair, Plus, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/AuthModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Crosshair className="h-5 w-5 text-primary transition-transform group-hover:rotate-90" />
            <span className="font-display text-xl font-bold tracking-wider text-foreground">
              NEED<span className="text-primary">1</span>VALO
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="clip-angle-sm font-display text-xs tracking-wider h-8">
              <Link to="/create">
                <Plus className="h-3.5 w-3.5" />
                POST
              </Link>
            </Button>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="clip-angle-sm font-display text-xs tracking-wider h-8 gap-1.5 border-border">
                    <User className="h-3.5 w-3.5" />
                    {user?.username.toUpperCase()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem className="text-xs text-muted-foreground font-display tracking-wider">
                    {user?.riotId || "No Riot ID set"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-xs font-display tracking-wider text-primary">
                    <LogOut className="h-3 w-3 mr-1.5" /> SIGN OUT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setAuthOpen(true)} className="clip-angle-sm font-display text-xs tracking-wider h-8 border-border">
                <User className="h-3.5 w-3.5" />
                SIGN IN
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
