import React from "react";
import { UserCheck, BookOpen, Calendar, Clock, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProfessorElegivel } from "../types/busca";

interface CardProfessorElegivelProps {
  professor: ProfessorElegivel;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const CardProfessorElegivel: React.FC<CardProfessorElegivelProps> = ({
  professor,
  isSelected = false,
  onSelect,
}) => {
  const labelAulas =
    professor.quantidadeAulasNaSemana === 1
      ? "1 aula na semana"
      : `${professor.quantidadeAulasNaSemana} aulas na semana`;

  return (
    <Card
      onClick={onSelect}
      className={`border transition-all duration-200 cursor-pointer ${
        isSelected
          ? "border-emerald-500 bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/50"
          : "border-border/60 bg-card hover:border-emerald-500/50 hover:bg-emerald-950/10 shadow-sm"
      }`}
    >
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isSelected
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20"
              }`}
            >
              <UserCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-foreground">
                  {professor.nome}
                </CardTitle>
                {isSelected && (
                  <Badge variant="default" className="bg-emerald-600 text-[10px] h-5 px-1.5 font-semibold">
                    Selecionado
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {professor.idiomas.map((idioma) => (
                  <Badge
                    key={idioma}
                    variant="secondary"
                    className="text-xs font-normal"
                  >
                    <BookOpen className="mr-1 h-3 w-3" aria-hidden="true" />
                    {idioma}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-xs w-fit shrink-0 py-1 whitespace-normal break-words"
          >
            <Calendar className="mr-1.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{labelAulas}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0">
        <div className="mt-2 border-t border-border/50 pt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground mr-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Horários em comum:</span>
            </div>
            {professor.horariosDisponiveis.map((horario) => (
              <span
                key={horario}
                className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-mono font-medium text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/30"
              >
                {horario}
              </span>
            ))}
          </div>

          <div className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 mt-2 sm:mt-0 py-1">
            <span>{isSelected ? "Ver Grade Aberta" : "Ver Grade do Professor"}</span>
            <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
