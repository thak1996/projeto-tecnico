import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CardProfessorElegivel } from "../../../src/features/professores/components/CardProfessorElegivel";
import type { ProfessorElegivel } from "../../../src/features/professores/types/busca";

describe("CardProfessorElegivel", () => {
  const mockProfessor: ProfessorElegivel = {
    id: 1,
    nome: "Ana",
    idiomas: ["Inglês", "Espanhol"],
    quantidadeAulasNaSemana: 1,
    horariosDisponiveis: ["18:00", "20:00", "21:00"],
  };

  it("deve renderizar o nome, idiomas, quantidade de aulas e horários disponíveis", () => {
    render(<CardProfessorElegivel professor={mockProfessor} />);

    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Inglês")).toBeInTheDocument();
    expect(screen.getByText("Espanhol")).toBeInTheDocument();
    expect(screen.getByText(/1 aula na semana/i)).toBeInTheDocument();

    expect(screen.getByText("18:00")).toBeInTheDocument();
    expect(screen.getByText("20:00")).toBeInTheDocument();
    expect(screen.getByText("21:00")).toBeInTheDocument();
  });

  it("deve tratar o plural corretamente para quantidade de aulas", () => {
    render(
      <CardProfessorElegivel
        professor={{
          ...mockProfessor,
          quantidadeAulasNaSemana: 3,
        }}
      />
    );

    expect(screen.getByText(/3 aulas na semana/i)).toBeInTheDocument();
  });
});
