import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CardProfessorInelegivel } from "../../../src/features/professores/components/CardProfessorInelegivel";
import type { ProfessorInelegivel } from "../../../src/features/professores/types/busca";

describe("CardProfessorInelegivel", () => {
  it("deve renderizar o motivo 'Não ensina o idioma'", () => {
    const professor: ProfessorInelegivel = {
      id: 4,
      nome: "Diego",
      idiomas: ["Espanhol"],
      motivo: "Não ensina o idioma",
    };

    render(<CardProfessorInelegivel professor={professor} />);

    expect(screen.getByText("Diego")).toBeInTheDocument();
    expect(screen.getByText("Espanhol")).toBeInTheDocument();
    expect(screen.getByText("Não ensina o idioma")).toBeInTheDocument();
  });

  it("deve renderizar o motivo 'Agenda bloqueada'", () => {
    const professor: ProfessorInelegivel = {
      id: 3,
      nome: "Carla",
      idiomas: ["Inglês"],
      motivo: "Agenda bloqueada",
    };

    render(<CardProfessorInelegivel professor={professor} />);

    expect(screen.getByText("Carla")).toBeInTheDocument();
    expect(screen.getByText("Agenda bloqueada")).toBeInTheDocument();
  });

  it("deve renderizar o motivo 'Sem horário em comum nos dias pedidos'", () => {
    const professor: ProfessorInelegivel = {
      id: 8,
      nome: "Heitor",
      idiomas: ["Inglês"],
      motivo: "Sem horário em comum nos dias pedidos",
    };

    render(<CardProfessorInelegivel professor={professor} />);

    expect(screen.getByText("Heitor")).toBeInTheDocument();
    expect(screen.getByText("Sem horário em comum nos dias pedidos")).toBeInTheDocument();
  });
});
