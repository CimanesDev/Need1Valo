import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { Crosshair, LogIn, UserPlus } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [riotId, setRiotId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      const res = login(email, password);
      if (res.success) { toast({ title: "Welcome back!" }); onOpenChange(false); }
      else toast({ title: res.error, variant: "destructive" });
    } else {
      if (!username.trim()) { toast({ title: "Enter a username", variant: "destructive" }); return; }
      const res = signup({ username: username.trim(), riotId: riotId.trim(), email, password });
      if (res.success) { toast({ title: "Account created!" }); onOpenChange(false); }
      else toast({ title: res.error, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border clip-angle sm:max-w-md">
        <div className="h-0.5 bg-primary -mx-6 -mt-6 mb-2" />
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-[0.15em] flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-primary" />
            {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {mode === "signup" && (
            <>
              <div className="space-y-1.5">
                <Label className="font-display text-xs tracking-wider">USERNAME</Label>
                <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your display name" className="bg-secondary border-border" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-display text-xs tracking-wider">RIOT ID <span className="text-muted-foreground">(optional)</span></Label>
                <Input value={riotId} onChange={e => setRiotId(e.target.value)} placeholder="Player#TAG" className="bg-secondary border-border" />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label className="font-display text-xs tracking-wider">EMAIL</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="bg-secondary border-border" required />
          </div>
          <div className="space-y-1.5">
            <Label className="font-display text-xs tracking-wider">PASSWORD</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-secondary border-border" required />
          </div>

          <Button type="submit" className="w-full clip-angle-sm font-display tracking-[0.15em] h-11">
            {mode === "login" ? <><LogIn className="h-4 w-4" /> SIGN IN</> : <><UserPlus className="h-4 w-4" /> CREATE ACCOUNT</>}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-primary hover:underline font-display tracking-wider">
              {mode === "login" ? "SIGN UP" : "SIGN IN"}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
