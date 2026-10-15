import React from "react";
import { Calendar, Clock, CheckCircle2, UserCheck, AlertCircle, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProfessorElegivel, DiaSemana, HorarioAgendado } from "../types/busca";

export interface GradeSemanalProfessorProps {
  professor: ProfessorElegivel;
  diasPesquisados: DiaSemana[];
  horariosSelecionados?: HorarioAgendado[];
  horarioSelecionado?: string | null;
  duracaoAulaMinutos?: number;
  onToggleHorario?: (dia: DiaSemana, horario: string) => void;
  onSelectHorario?: (horario: string) => void;
  onRemoverHorario?: (dia: DiaSemana, horario: string) => void;
  onLimparHorarios?: () => void;
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
  horariosSelecionados = [],
  horarioSelecionado,
  duracaoAulaMinutos = 60,
  onToggleHorario,
  onSelectHorario,
  onRemoverHorario,
  onLimparHorarios,
}) => {
  // Normaliza lista de selecionados aceitando tanto a prop moderna quanto a legada
  const itemsSelecionados: HorarioAgendado[] =
    horariosSelecionados.length > 0
      ? horariosSelecionados
      : horarioSelecionado
        ? [{ dia: diasPesquisados[0] ?? "segunda", horario: horarioSelecionado }]
        : [];

  const isSlotSelected = (dia: DiaSemana, slot: string) =>
    itemsSelecionados.some((item) => item.dia === dia && item.horario === slot);

  const handleClickSlot = (dia: DiaSemana, slot: string) => {
    if (onToggleHorario) {
      onToggleHorario(dia, slot);
    } else if (onSelectHorario) {
      onSelectHorario(slot);
    }
  };

  const totalMinutos = itemsSelecionados.length * duracaoAulaMinutos;

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
                Selecione os horários viáveis em verde para agendar com o professor
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

                    {/* Horários Livres Disponíveis para a Busca (Verde) */}
                    {isDiaPesquisado && professor.horariosDisponiveis.length > 0 && (
                      <div className="pt-2 border-t border-border/30">
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                          Horários Livres:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {professor.horariosDisponiveis.map((slot) => {
                            const isSelected = isSlotSelected(diaInfo.id, slot);
                            return (
                              <button
                                key={slot}
                                type="button"
                                aria-pressed={isSelected}
                                data-slot={`${diaInfo.id}-${slot}`}
                                onClick={() => handleClickSlot(diaInfo.id, slot)}
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

        {/* Resumo e Somatório da Escolha */}
        {itemsSelecionados.length > 0 ? (
          <div
            data-testid="resumo-agendamentos"
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-emerald-800 dark:text-emerald-200"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" aria-hidden="true" />
                <span className="text-xs sm:text-sm font-semibold break-words">
                  {itemsSelecionados.length === 1
                    ? `Horário Selecionado: ${itemsSelecionados[0].horario} com ${professor.nome}`
                    : `Horários Selecionados (${itemsSelecionados.length} aulas) com ${professor.nome}`}
                </span>
              </div>

              {/* Lista discriminada de agendamentos com chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {itemsSelecionados.map((item) => {
                  const diaLabel = DIAS_SEMANA_ORDEM.find((d) => d.id === item.dia)?.label ?? item.dia;
                  return (
                    <span
                      key={`${item.dia}-${item.horario}`}
                      className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200 border border-emerald-500/30"
                    >
                      <span>
                        {diaLabel}, {item.horario}
                      </span>
                      {onRemoverHorario && (
                        <button
                          type="button"
                          onClick={() => onRemoverHorario(item.dia, item.horario)}
                          aria-label={`Remover ${diaLabel} ${item.horario}`}
                          className="ml-0.5 rounded-full p-0.5 text-emerald-700 hover:bg-emerald-500/30 hover:text-destructive dark:text-emerald-300 cursor-pointer inline-flex items-center justify-center"
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs">
                {itemsSelecionados.length === 1 ? "1 aula selecionada" : `${itemsSelecionados.length} aulas selecionadas`}
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono">
                {totalMinutos} min total
              </Badge>
              {onLimparHorarios && (
                <button
                  type="button"
                  onClick={onLimparHorarios}
                  className="text-xs text-muted-foreground hover:text-destructive underline cursor-pointer ml-1"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>
              Nenhum horário selecionado. Clique nos horários livres em verde para agendar com {professor.nome}.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
