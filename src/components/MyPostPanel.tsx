import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, Copy, Users } from "lucide-react";
import type { LFGPost } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface MyPostPanelProps {
  post: LFGPost;
  onKick: (joinerId: string) => void;
  onComplete: () => void;
}

export function MyPostPanel({ post, onKick, onComplete }: MyPostPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(post.partyCode);
    setCopied(true);
    toast({ title: "Party code copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="clip-angle bg-card border-primary/30 glow-red">
      <div className="h-0.5 bg-primary" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="font-display tracking-wider">YOUR LOBBY</span>
          <span className="text-xs text-muted-foreground font-display">
            {post.slotsFilled}/{post.slotsTotal} FILLED
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-secondary px-3 py-2 font-mono text-sm text-primary tracking-widest">
            {post.partyCode}
          </code>
          <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
            {copied ? <CheckCircle className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        {post.joiners.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-display tracking-wider flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> PLAYERS
            </p>
            {post.joiners.map(j => (
              <div key={j.id} className="flex items-center justify-between bg-secondary px-3 py-2 text-sm">
                <span className="text-foreground">{j.riotId}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => onKick(j.id)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">Waiting for players...</p>
        )}

        <Button onClick={onComplete} variant="outline" className="w-full font-display text-xs tracking-wider border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
          <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> MARK DONE
        </Button>
      </CardContent>
    </Card>
  );
}
