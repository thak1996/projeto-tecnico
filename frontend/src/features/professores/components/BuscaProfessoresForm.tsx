import React, { useState } from "react";
import { Search, Calendar, Clock, Globe2, AlertCircle, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { BuscaProfessoresFiltros, DiaSemana, DuracaoAula } from "../types/busca";

interface BuscaProfessoresFormProps {
  onBuscar: (filtros: BuscaProfessoresFiltros) => void;
  onLimpar?: () => void;
  isLoading?: boolean;
}

const DIAS_SEMANA: { valor: DiaSemana; rotulo: string }[] = [
  { valor: "segunda", rotulo: "Segunda" },
  { valor: "terca", rotulo: "Terça" },
  { valor: "quarta", rotulo: "Quarta" },
  { valor: "quinta", rotulo: "Quinta" },
  { valor: "sexta", rotulo: "Sexta" },
  { valor: "sabado", rotulo: "Sábado" },
  { valor: "domingo", rotulo: "Domingo" },
];

const DURACOES: DuracaoAula[] = [30, 60, 90];

export const BuscaProfessoresForm: React.FC<BuscaProfessoresFormProps> = ({
  onBuscar,
  onLimpar,
  isLoading = false,
}) => {
  const [idioma, setIdioma] = useState("Inglês");
  const [dias, setDias] = useState<DiaSemana[]>(["segunda", "quarta"]);
  const [inicioFaixa, setInicioFaixa] = useState("18:00");
  const [fimFaixa, setFimFaixa] = useState("22:00");
  const [duracaoMinutos, setDuracaoMinutos] = useState<DuracaoAula>(60);
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);

  const handleLimpar = () => {
    setIdioma("");
    setDias([]);
    setInicioFaixa("");
    setFimFaixa("");
    setDuracaoMinutos(60);
    setErroValidacao(null);
    onLimpar?.();
  };

  const toggleDia = (dia: DiaSemana) => {
    setDias((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErroValidacao(null);

    if (!idioma.trim()) {
      setErroValidacao("Por favor, selecione ou informe o idioma desejado.");
      return;
    }

    if (dias.length === 0) {
      setErroValidacao("Por favor, selecione ao menos um dia da semana.");
      return;
    }

    if (!inicioFaixa || !fimFaixa) {
      setErroValidacao("Informe o horário inicial e final da faixa desejada.");
      return;
    }

    const [hInicio, mInicio] = inicioFaixa.split(":").map(Number);
    const [hFim, mFim] = fimFaixa.split(":").map(Number);

    if (
      isNaN(hInicio) ||
      isNaN(mInicio) ||
      isNaN(hFim) ||
      isNaN(mFim)
    ) {
      setErroValidacao("Os horários devem estar no formato válido HH:mm.");
      return;
    }

    const minutosInicio = hInicio * 60 + mInicio;
    const minutosFim = hFim * 60 + mFim;

    if (minutosFim <= minutosInicio) {
      setErroValidacao("O horário de término da faixa deve ser posterior ao horário de início.");
      return;
    }

    const amplitudeMinutos = minutosFim - minutosInicio;
    if (amplitudeMinutos < duracaoMinutos) {
      setErroValidacao(
        `A faixa de horário selecionada (${amplitudeMinutos} min) deve comportar ao menos a duração da aula (${duracaoMinutos} min).`
      );
      return;
    }

    onBuscar({
      idioma: idioma.trim(),
      dias,
      inicioFaixa,
      fimFaixa,
      duracaoMinutos,
    });
  };

  return (
    <Card className="w-full border-border/80 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 text-primary font-medium text-sm">
          <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5">
            Passo 1
          </Badge>
          <span className="font-semibold text-muted-foreground flex items-center gap-1">
            <Search className="h-4 w-4" aria-hidden="true" />
            Filtros de Pesquisa
          </span>
        </div>
        <CardTitle className="text-xl sm:text-2xl">Defina os Critérios da sua Aula</CardTitle>
        <CardDescription>
          Informe o idioma, os dias da semana em que você tem disponibilidade, a faixa de horário de preferência e a duração da aula.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {erroValidacao && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{erroValidacao}</span>
            </div>
          )}

          {/* Grid Superior: Idioma e Duração */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Idioma */}
            <div className="space-y-2">
              <Label htmlFor="idioma-input" className="flex items-center gap-1.5 text-sm font-medium">
                <Globe2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                Idioma desejado
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {["Inglês", "Espanhol", "Francês"].map((opcao) => (
                  <button
                    type="button"
                    key={opcao}
                    onClick={() => setIdioma(opcao)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
                      idioma.toLowerCase() === opcao.toLowerCase()
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/50 shadow-sm font-bold"
                        : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {opcao}
                  </button>
                ))}
              </div>
            </div>

            {/* Duração da aula */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Clock className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                Duração da aula
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {DURACOES.map((duracao) => (
                  <button
                    type="button"
                    key={duracao}
                    onClick={() => setDuracaoMinutos(duracao)}
                    className={`rounded-lg border py-2 text-center text-sm font-semibold transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
                      duracaoMinutos === duracao
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/50 shadow-sm font-bold"
                        : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {duracao} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dias da Semana */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Calendar className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              Dias da semana disponíveis (seleção múltipla)
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
              {DIAS_SEMANA.map(({ valor, rotulo }) => {
                const isSelected = dias.includes(valor);
                return (
                  <button
                    type="button"
                    key={valor}
                    onClick={() => toggleDia(valor)}
                    aria-pressed={isSelected}
                    className={`rounded-lg border px-3 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/50 shadow-sm font-bold"
                        : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {rotulo}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Faixa de Horário */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inicio-faixa" className="flex items-center gap-1.5 text-sm font-medium">
                <Clock className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                Início da faixa horária
              </Label>
              <Input
                id="inicio-faixa"
                type="time"
                value={inicioFaixa}
                onChange={(e) => setInicioFaixa(e.target.value)}
                required
                className="font-mono text-center text-base py-2.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fim-faixa" className="flex items-center gap-1.5 text-sm font-medium">
                <Clock className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                Término da faixa horária
              </Label>
              <Input
                id="fim-faixa"
                type="time"
                value={fimFaixa}
                onChange={(e) => setFimFaixa(e.target.value)}
                required
                className="font-mono text-center text-base py-2.5"
              />
            </div>
          </div>

          {/* Ações: Buscar Professores e Limpar Busca */}
          <div className="flex flex-col sm:flex-row w-full gap-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:flex-1 text-sm sm:text-base font-semibold py-5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all min-h-[44px]"
            >
              <Search className="mr-2 h-4 w-4" aria-hidden="true" />
              {isLoading ? "Buscando..." : "Buscar Professores"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleLimpar}
              disabled={isLoading}
              className="w-full sm:w-auto text-sm sm:text-base font-semibold py-5 px-6 cursor-pointer border-border hover:bg-accent transition-all min-h-[44px]"
            >
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Limpar Busca
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
