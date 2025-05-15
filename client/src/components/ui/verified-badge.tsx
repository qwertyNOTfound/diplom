import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

interface VerifiedBadgeProps {
  verified: boolean;
  className?: string;
}

export function VerifiedBadge({ verified, className = "" }: VerifiedBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={className}>
          {verified ? (
            <ShieldCheck className="h-4 w-4 text-green-500" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{verified ? "Перевірений користувач" : "Неперевірений користувач"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
