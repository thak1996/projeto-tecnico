import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BuscaProfessoresForm } from "../../../src/features/professores/components/BuscaProfessoresForm";

describe("BuscaProfessoresForm - Validação", () => {
  it("deve permitir a submissão com dados válidos", () => {
    const onBuscar = vi.fn();
    render(<BuscaProfessoresForm onBuscar={onBuscar} />);

    const botaoBuscar = screen.getByRole("button", { name: /buscar professores/i });
    fireEvent.click(botaoBuscar);

    expect(onBuscar).toHaveBeenCalledWith({
      idioma: "Inglês",
      dias: ["segunda", "quarta"],
      inicioFaixa: "18:00",
      fimFaixa: "22:00",
      duracaoMinutos: 60,
    });
  });

  it("deve bloquear a submissão quando nenhum dia da semana estiver selecionado", () => {
    const onBuscar = vi.fn();
    render(<BuscaProfessoresForm onBuscar={onBuscar} />);

    // Desmarca os dias padrão "Segunda" e "Quarta"
    const botaoSegunda = screen.getByRole("button", { name: /segunda/i });
    const botaoQuarta = screen.getByRole("button", { name: /quarta/i });
    fireEvent.click(botaoSegunda);
    fireEvent.click(botaoQuarta);

    const botaoBuscar = screen.getByRole("button", { name: /buscar professores/i });
    fireEvent.click(botaoBuscar);

    expect(onBuscar).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      /selecione ao menos um dia da semana/i
    );
  });

  it("deve bloquear a submissão se a faixa horária for menor que a duração da aula", () => {
    const onBuscar = vi.fn();
    render(<BuscaProfessoresForm onBuscar={onBuscar} />);

    // Define faixa 18:00 às 18:30 (30 min) para aula de 60 min
    const inputInicio = screen.getByLabelText(/início da faixa/i);
    const inputFim = screen.getByLabelText(/término da faixa/i);

    fireEvent.change(inputInicio, { target: { value: "18:00" } });
    fireEvent.change(inputFim, { target: { value: "18:30" } });

    const botaoBuscar = screen.getByRole("button", { name: /buscar professores/i });
    fireEvent.click(botaoBuscar);

    expect(onBuscar).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      /deve comportar ao menos a duração da aula/i
    );
  });
});
