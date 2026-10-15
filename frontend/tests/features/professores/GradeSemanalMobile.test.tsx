import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GradeSemanalProfessor } from "../../../src/features/professores/components/GradeSemanalProfessor";
import type { ProfessorElegivel } from "../../../src/features/professores/types/busca";

const mockProfessor: ProfessorElegivel = {
  id: "prof-1",
  nome: "Bruno Silva",
  idiomas: ["Inglês"],
  totalAulasNaSemana: 0,
  horariosDisponiveis: ["20:00"],
  disponibilidade: [
    { dia: "segunda", inicio: "18:00", fim: "22:00" },
    { dia: "quarta", inicio: "18:00", fim: "22:00" },
  ],
  aulasMarcadas: [],
};

describe("GradeSemanalProfessor - Responsividade Mobile", () => {
  it("deve conter layout de 2 colunas no mobile para os dias da semana", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <GradeSemanalProfessor
        professor={mockProfessor}
        diasPesquisados={["segunda", "quarta"]}
        horarioSelecionado={null}
        onSelectHorario={onSelect}
      />
    );

    // O container dos 7 dias deve usar grid-cols-2 no mobile
    const gridDias = container.querySelector(".grid.grid-cols-2");
    expect(gridDias).not.toBeNull();
    expect(gridDias?.className).toContain("grid-cols-2");
    expect(gridDias?.className).toContain("gap-2");
  });

  it("deve conter classes flex-col e sm:flex-row na caixa de resumo do horário selecionado", () => {
    const onSelect = vi.fn();
    render(
      <GradeSemanalProfessor
        professor={mockProfessor}
        diasPesquisados={["segunda", "quarta"]}
        horarioSelecionado="20:00"
        onSelectHorario={onSelect}
      />
    );

    const textoResumo = screen.getByText(/horário selecionado: 20:00 com bruno silva/i);
    // Encontra o container da caixa de resumo
    const containerResumo = textoResumo.closest(".rounded-lg.border");
    expect(containerResumo).not.toBeNull();
    expect(containerResumo?.className).toContain("flex-col");
    expect(containerResumo?.className).toContain("sm:flex-row");
  });
});
