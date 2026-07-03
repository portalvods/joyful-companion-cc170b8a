import { Bell, Cpu, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/60 backdrop-blur px-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-3 rounded-md border border-border bg-card px-3 py-1.5 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground"><Cpu className="h-3.5 w-3.5" /> 34%</span>
          <span className="h-4 w-px bg-border" />
          <span className="flex items-center gap-1.5 text-muted-foreground"><HardDrive className="h-3.5 w-3.5" /> 1.2 TB livres</span>
        </div>
        <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
      </div>
    </header>
  );
}
