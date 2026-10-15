import React from "react";
import { Calendar, Clock, CheckCircle2, UserCheck, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProfessorElegivel, DiaSemana } from "../types/busca";

interface GradeSemanalProfessorProps {
  professor: ProfessorElegivel;
  diasPesquisados: DiaSemana[];
  horarioSelecionado: string | null;
  onSelectHorario: (horario: string) => void;
}

const DIAS_SEMANA_ORDEM: { id: DiaSemana; label: string }[] = [
  { id: "segunda", label: "Segunda" },
  { id: "terca", label: "Terça" },
  { id: "quarta", label: "Quarta" },
  { id: "quinta", label: "Quinta" },
  { id: "sexta", label: "Sexta" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

export const GradeSemanalProfessor: React.FC<GradeSemanalProfessorProps> = ({
  professor,
  diasPesquisados,
  horarioSelecionado,
  onSelectHorario,
}) => {
  return (
    <Card className="border-emerald-500/40 bg-card/90 shadow-md transition-all">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
              <Calendar className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground sm:text-lg">
                Grade Semanal de {professor.nome}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Selecione um dos horários viáveis em verde para agendar com o professor
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs w-fit"
          >
            <UserCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            {professor.idiomas.join(", ")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Grade dos 7 Dias da Semana */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {DIAS_SEMANA_ORDEM.map((diaInfo) => {
            const isDiaPesquisado = diasPesquisados.includes(diaInfo.id);
            const janelasDisponibilidade =
              professor.disponibilidade?.filter((d) => d.dia.toLowerCase() === diaInfo.id) ?? [];
            const aulasMarcadas =
              professor.aulasMarcadas?.filter((a) => a.dia.toLowerCase() === diaInfo.id) ?? [];
            const temAtendimento = janelasDisponibilidade.length > 0;

            return (
              <div
                key={diaInfo.id}
                className={`flex flex-col rounded-lg border p-2.5 sm:p-3 transition-colors ${
                  !temAtendimento
                    ? "border-dashed border-border/40 bg-muted/20 opacity-50"
                    : isDiaPesquisado
                      ? "border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20"
                      : "border-border/60 bg-card"
                }`}
              >
                {/* Cabeçalho do Dia */}
                <div className="flex items-center justify-between border-b border-border/40 pb-1.5 mb-2">
                  <span className="font-semibold text-xs sm:text-sm text-foreground">
                    {diaInfo.label}
                  </span>
                  {isDiaPesquisado && (
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      Busca
                    </span>
                  )}
                </div>

                {/* Conteúdo do Dia */}
                {!temAtendimento ? (
                  <div className="flex-1 flex items-center justify-center py-2 text-[10px] text-muted-foreground/80 italic">
                    Sem expediente
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    {/* Janelas cadastradas */}
                    <div className="text-[11px] text-muted-foreground">
                      {janelasDisponibilidade.map((j, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span>
                            {j.inicio} - {j.fim}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Aulas Marcadas (Ocupado em Vermelho) */}
                    {aulasMarcadas.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-border/30">
                        {aulasMarcadas.map((a, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center rounded bg-rose-500/10 px-1.5 py-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-500/30"
                          >
                            <AlertCircle className="mr-1 h-3 w-3 shrink-0" aria-hidden="true" />
                            <span>{a.inicio} (Ocupado)</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Horários em Comum Disponíveis para a Busca (Verde) */}
                    {isDiaPesquisado && professor.horariosDisponiveis.length > 0 && (
                      <div className="pt-2 border-t border-border/30">
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                          Horários Livres:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {professor.horariosDisponiveis.map((slot) => {
                            const isSelected = horarioSelecionado === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => onSelectHorario(slot)}
                                className={`rounded px-2 py-0.5 text-xs font-mono font-medium transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500 ring-offset-1 ring-offset-background font-bold"
                                    : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/30 hover:bg-emerald-500/30"
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Resumo da Escolha */}
        {horarioSelecionado && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-emerald-700 dark:text-emerald-300">
            <div className="flex items-start sm:items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
              <span className="text-xs sm:text-sm font-medium break-words">
                {`Horário Selecionado: ${horarioSelecionado} com ${professor.nome} nos dias solicitados.`}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0 w-fit self-start sm:self-auto">
              Disponível em todos os dias
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
