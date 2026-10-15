import React from "react";
import { UserX, BookOpen, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProfessorInelegivel } from "../types/busca";

interface CardProfessorInelegivelProps {
  professor: ProfessorInelegivel;
}

export const CardProfessorInelegivel: React.FC<CardProfessorInelegivelProps> = ({
  professor,
}) => {
  const getBadgeVariant = (motivo: string) => {
    switch (motivo) {
      case "Não ensina o idioma":
        return "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300";
      case "Agenda bloqueada":
        return "border-destructive/30 bg-destructive/10 text-destructive";
      case "Sem horário em comum nos dias pedidos":
        return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
      default:
        return "border-muted bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border-border/60 bg-card/60 opacity-90 transition-opacity hover:opacity-100 flex flex-col justify-between">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <UserX className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              {professor.nome}
            </CardTitle>
            <div className="mt-1 flex flex-wrap gap-1">
              {professor.idiomas.map((idioma) => (
                <span
                  key={idioma}
                  className="inline-flex items-center text-xs text-muted-foreground"
                >
                  <BookOpen className="mr-1 h-3 w-3" aria-hidden="true" />
                  {idioma}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="pt-2 border-t border-border/40">
          <Badge
            variant="outline"
            className={`w-full justify-start text-xs font-normal py-1 px-2.5 leading-snug whitespace-normal break-words ${getBadgeVariant(
              professor.motivo
            )}`}
          >
            <AlertCircle className="mr-1.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{professor.motivo}</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
