import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BuscaProfessoresForm } from "../../../src/features/professores/components/BuscaProfessoresForm";

describe("BuscaProfessoresForm - Responsividade Mobile", () => {
  it("deve conter classes responsivas de empilhamento e largura total nos botões de ação", () => {
    const onBuscar = vi.fn();
    const onLimpar = vi.fn();
    render(<BuscaProfessoresForm onBuscar={onBuscar} onLimpar={onLimpar} />);

    const botaoBuscar = screen.getByRole("button", { name: /buscar professores/i });
    const botaoLimpar = screen.getByRole("button", { name: /limpar busca/i });

    // O contêiner pai das ações deve usar flex-col no mobile e sm:flex-row
    const containerAcoes = botaoBuscar.parentElement;
    expect(containerAcoes).not.toBeNull();
    expect(containerAcoes?.className).toContain("flex-col");
    expect(containerAcoes?.className).toContain("sm:flex-row");

    // Ambos os botões devem ter classe w-full no mobile
    expect(botaoBuscar.className).toContain("w-full");
    expect(botaoLimpar.className).toContain("w-full");
  });

  it("deve garantir alvo de toque confortável (min-h-[44px]) nos seletores de dias da semana", () => {
    const onBuscar = vi.fn();
    render(<BuscaProfessoresForm onBuscar={onBuscar} />);

    const botaoSegunda = screen.getByRole("button", { name: /segunda/i });
    expect(botaoSegunda.className).toContain("min-h-[44px]");
  });
});
