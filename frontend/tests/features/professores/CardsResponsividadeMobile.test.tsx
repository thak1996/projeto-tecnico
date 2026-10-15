import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CardProfessorElegivel } from "../../../src/features/professores/components/CardProfessorElegivel";
import { CardProfessorInelegivel } from "../../../src/features/professores/components/CardProfessorInelegivel";
import type { ProfessorElegivel, ProfessorInelegivel } from "../../../src/features/professores/types/busca";

const mockElegivel: ProfessorElegivel = {
  id: "prof-1",
  nome: "Bruno Silva",
  idiomas: ["Inglês", "Espanhol"],
  totalAulasNaSemana: 0,
  quantidadeAulasNaSemana: 0,
  horariosDisponiveis: ["18:00", "19:00", "20:00"],
  disponibilidade: [],
  aulasMarcadas: [],
};

const mockInelegivel: ProfessorInelegivel = {
  id: "prof-2",
  nome: "Carlos Eduardo",
  idiomas: ["Francês"],
  motivo: "Sem horário em comum nos dias pedidos",
};

describe("Cards de Professores - Responsividade Mobile", () => {
  it("CardProfessorElegivel deve suportar quebra flexível de badges de horários e idiomas", () => {
    const { container } = render(<CardProfessorElegivel professor={mockElegivel} />);

    // Container de idiomas deve ter flex-wrap
    const badgesIdiomaContainer = container.querySelector(".flex.flex-wrap");
    expect(badgesIdiomaContainer).not.toBeNull();

    // Ver Grade do Professor deve estar visível e acessível
    expect(screen.getByText(/ver grade do professor/i)).toBeInTheDocument();
  });

  it("CardProfessorInelegivel deve aplicar break-words e whitespace-normal no badge de motivo", () => {
    render(<CardProfessorInelegivel professor={mockInelegivel} />);

    const badgeMotivo = screen.getByText(/sem horário em comum nos dias pedidos/i).closest("span")?.parentElement;
    expect(badgeMotivo).not.toBeNull();
    expect(badgeMotivo?.className).toContain("whitespace-normal");
    expect(badgeMotivo?.className).toContain("break-words");
    expect(badgeMotivo?.className).not.toContain("truncate");
  });
});
