import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GradeSemanalProfessor } from "@/features/professores/components/GradeSemanalProfessor";
import type { ProfessorElegivel, HorarioAgendado } from "@/features/professores/types/busca";

const mockProfessor: ProfessorElegivel = {
  id: 1,
  nome: "Ana",
  idiomas: ["Inglês", "Espanhol"],
  quantidadeAulasNaSemana: 1,
  horariosDisponiveis: ["18:00", "20:00", "20:30", "21:00"],
  disponibilidade: [
    { dia: "segunda", inicio: "18:00", fim: "22:00" },
    { dia: "quarta", inicio: "18:00", fim: "22:00" },
  ],
  aulasMarcadas: [
    { dia: "segunda", inicio: "19:00", duracaoMinutos: 60 },
  ],
};

describe("GradeSemanalProfessor", () => {
  it("renderiza a grade com o nome do professor e os dias da semana", () => {
    render(
      <GradeSemanalProfessor
        professor={mockProfessor}
        diasPesquisados={["segunda", "quarta"]}
        horariosSelecionados={[]}
        onToggleHorario={vi.fn()}
      />
    );

    expect(screen.getByText(/Grade Semanal de Ana/i)).toBeInTheDocument();
    expect(screen.getByText(/Segunda/i)).toBeInTheDocument();
    expect(screen.getByText(/Quarta/i)).toBeInTheDocument();
    expect(screen.getByText(/Domingo/i)).toBeInTheDocument();
  });

  it("exibe horários ocupados em vermelho e horários livres disponíveis em verde", () => {
    render(
      <GradeSemanalProfessor
        professor={mockProfessor}
        diasPesquisados={["segunda", "quarta"]}
        horariosSelecionados={[]}
        onToggleHorario={vi.fn()}
      />
    );

    // Horário com aula marcada (19:00 na segunda)
    const ocupadoBadge = screen.getByText(/19:00 \(Ocupado\)/i);
    expect(ocupadoBadge).toBeInTheDocument();

    // Horários livres viáveis
    expect(screen.getAllByText("18:00")[0]).toBeInTheDocument();
    expect(screen.getAllByText("20:00")[0]).toBeInTheDocument();
  });

  it("permite selecionar um horário disponível clicando nele e dispara onToggleHorario com dia e horário", () => {
    const onToggle = vi.fn();
    render(
      <GradeSemanalProfessor
        professor={mockProfessor}
        diasPesquisados={["segunda", "quarta"]}
        horariosSelecionados={[]}
        onToggleHorario={onToggle}
      />
    );

    // Clica no primeiro botão de 18:00 (coluna da Segunda-feira)
    const botoes18 = screen.getAllByRole("button", { name: /18:00/i });
    expect(botoes18.length).toBeGreaterThan(1); // Segunda e Quarta

    fireEvent.click(botoes18[0]);
    expect(onToggle).toHaveBeenCalledWith("segunda", "18:00");
  });

  it("destaca visualmente apenas o horário do dia selecionado sem marcar o mesmo horário em outro dia", () => {
    const horariosSelecionados: HorarioAgendado[] = [
      { dia: "segunda", horario: "18:00" },
    ];

    render(
      <GradeSemanalProfessor
        professor={mockProfessor}
        diasPesquisados={["segunda", "quarta"]}
        horariosSelecionados={horariosSelecionados}
        onToggleHorario={vi.fn()}
      />
    );

    const botoes18 = screen.getAllByRole("button", { name: /18:00/i });
    const btnSegunda18 = botoes18[0];
    const btnQuarta18 = botoes18[1];

    // Segunda-feira 18:00 deve estar selecionado
    expect(btnSegunda18).toHaveAttribute("aria-pressed", "true");
    expect(btnSegunda18.className).toContain("bg-emerald-500");

    // Quarta-feira 18:00 NÃO deve estar selecionado
    expect(btnQuarta18).toHaveAttribute("aria-pressed", "false");
    expect(btnQuarta18.className).not.toContain("text-white font-bold");
  });

  it("exibe o somatório acumulado de aulas e tempo total quando múltiplos horários estão selecionados", () => {
    const horariosSelecionados: HorarioAgendado[] = [
      { dia: "segunda", horario: "18:00" },
      { dia: "quarta", horario: "20:00" },
    ];

    render(
      <GradeSemanalProfessor
        professor={mockProfessor}
        diasPesquisados={["segunda", "quarta"]}
        horariosSelecionados={horariosSelecionados}
        duracaoAulaMinutos={60}
        onToggleHorario={vi.fn()}
        onRemoverHorario={vi.fn()}
        onLimparHorarios={vi.fn()}
      />
    );

    expect(screen.getByText(/Horários Selecionados \(2 aulas\) com Ana/i)).toBeInTheDocument();
    expect(screen.getByText("2 aulas selecionadas")).toBeInTheDocument();
    expect(screen.getByText("120 min total")).toBeInTheDocument();
    expect(screen.getByText(/Segunda, 18:00/i)).toBeInTheDocument();
    expect(screen.getByText(/Quarta, 20:00/i)).toBeInTheDocument();
  });

  it("permite remover um horário individual a partir do chip de resumo", () => {
    const onRemover = vi.fn();
    const horariosSelecionados: HorarioAgendado[] = [
      { dia: "segunda", horario: "18:00" },
      { dia: "quarta", horario: "20:00" },
    ];

    render(
      <GradeSemanalProfessor
        professor={mockProfessor}
        diasPesquisados={["segunda", "quarta"]}
        horariosSelecionados={horariosSelecionados}
        onToggleHorario={vi.fn()}
        onRemoverHorario={onRemover}
      />
    );

    const btnRemover = screen.getByRole("button", { name: /Remover Segunda 18:00/i });
    fireEvent.click(btnRemover);

    expect(onRemover).toHaveBeenCalledWith("segunda", "18:00");
  });

  it("permite limpar toda a seleção ao clicar no botão Limpar", () => {
    const onLimpar = vi.fn();
    const horariosSelecionados: HorarioAgendado[] = [
      { dia: "segunda", horario: "18:00" },
    ];

    render(
      <GradeSemanalProfessor
        professor={mockProfessor}
        diasPesquisados={["segunda", "quarta"]}
        horariosSelecionados={horariosSelecionados}
        onToggleHorario={vi.fn()}
        onLimparHorarios={onLimpar}
      />
    );

    const btnLimpar = screen.getByRole("button", { name: /Limpar/i });
    fireEvent.click(btnLimpar);

    expect(onLimpar).toHaveBeenCalledTimes(1);
  });
});
