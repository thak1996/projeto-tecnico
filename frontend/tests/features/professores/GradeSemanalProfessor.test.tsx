import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GradeSemanalProfessor } from "@/features/professores/components/GradeSemanalProfessor";
import type { ProfessorElegivel } from "@/features/professores/types/busca";

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
        horarioSelecionado={null}
        onSelectHorario={vi.fn()}
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
        horarioSelecionado={null}
        onSelectHorario={vi.fn()}
      />
    );

    // Horário com aula marcada (19:00 na segunda)
    const ocupadoBadge = screen.getByText(/19:00 \(Ocupado\)/i);
    expect(ocupadoBadge).toBeInTheDocument();

    // Horários livres viáveis
    expect(screen.getAllByText("18:00")[0]).toBeInTheDocument();
    expect(screen.getAllByText("20:00")[0]).toBeInTheDocument();
  });

  it("permite selecionar um horário disponível clicando nele e dispara o callback", () => {
    const onSelect = vi.fn();
    render(
      <GradeSemanalProfessor
        professor={mockProfessor}
        diasPesquisados={["segunda", "quarta"]}
        horarioSelecionado="18:00"
        onSelectHorario={onSelect}
      />
    );

    const btnHorario = screen.getAllByRole("button", { name: /18:00/i })[0];
    fireEvent.click(btnHorario);

    expect(onSelect).toHaveBeenCalledWith("18:00");
    expect(screen.getByText(/Horário Selecionado: 18:00/i)).toBeInTheDocument();
  });
});
