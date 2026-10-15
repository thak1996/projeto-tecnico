import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "@/app/App";


vi.mock("@/features/professores/services/professoresService", () => ({
  buscarProfessores: vi.fn().mockResolvedValue({
    elegiveis: [
      {
        id: 1,
        nome: "Ana",
        idiomas: ["Inglês", "Espanhol"],
        quantidadeAulasNaSemana: 1,
        horariosDisponiveis: ["18:00", "20:00"],
      },
    ],
    naoElegiveis: [
      {
        id: 3,
        nome: "Carla",
        idiomas: ["Inglês"],
        motivo: "Agenda bloqueada",
      },
    ],
  }),
}));

describe("LayoutPassoAPasso", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza os 3 passos de cima para baixo no fluxo vertical contínuo", async () => {
    render(<App />);

    // Passo 1 no topo
    expect(await screen.findByText(/Passo 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Filtros de Pesquisa/i)).toBeInTheDocument();

    // Passo 2 no meio
    expect(await screen.findByText(/Passo 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Professores Elegíveis/i)).toBeInTheDocument();

    // Passo 3 na base
    expect(await screen.findByText(/Passo 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Professores Não Disponíveis/i)).toBeInTheDocument();
  });
});
