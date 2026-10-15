import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BuscaProfessoresForm } from "@/features/professores/components/BuscaProfessoresForm";
import App from "@/app/App";


vi.mock("@/features/professores/services/professoresService", () => ({
  buscarProfessores: vi.fn().mockResolvedValue({
    elegiveis: [
      {
        id: 1,
        nome: "Ana",
        idiomas: ["Inglês"],
        quantidadeAulasNaSemana: 1,
        horariosDisponiveis: ["18:00"],
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
  obterTodosProfessores: vi.fn().mockResolvedValue({
    elegiveis: [
      {
        id: 1,
        nome: "Ana",
        idiomas: ["Inglês", "Espanhol"],
        quantidadeAulasNaSemana: 1,
        horariosDisponiveis: ["18:00", "20:00"],
        disponibilidade: [
          { dia: "segunda", inicio: "18:00", fim: "22:00" },
          { dia: "quarta", inicio: "18:00", fim: "22:00" },
        ],
        aulasMarcadas: [],
      },
      {
        id: 2,
        nome: "Bruno",
        idiomas: ["Inglês"],
        quantidadeAulasNaSemana: 2,
        horariosDisponiveis: ["18:00", "20:00"],
        disponibilidade: [
          { dia: "segunda", inicio: "18:00", fim: "21:00" },
          { dia: "terca", inicio: "18:00", fim: "20:00" },
        ],
        aulasMarcadas: [],
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

describe("Funcionalidade Limpar Busca e Catálogo Geral", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o botão Limpar Busca no formulário e redefine os campos ao ser clicado", () => {
    const onBuscar = vi.fn();
    const onLimpar = vi.fn();

    render(<BuscaProfessoresForm onBuscar={onBuscar} onLimpar={onLimpar} />);

    const inputInicio = screen.getByLabelText(/início da faixa horária/i) as HTMLInputElement;
    const inputFim = screen.getByLabelText(/término da faixa horária/i) as HTMLInputElement;

    // Inicialmente possuem valores padrão
    expect(inputInicio.value).toBe("18:00");
    expect(inputFim.value).toBe("22:00");

    const botaoLimpar = screen.getByRole("button", { name: /limpar busca/i });
    expect(botaoLimpar).toBeInTheDocument();

    fireEvent.click(botaoLimpar);
    expect(onLimpar).toHaveBeenCalledTimes(1);

    // Campos de horário devem ser resetados para vazio
    expect(inputInicio.value).toBe("");
    expect(inputFim.value).toBe("");

    // Botões de dias da semana devem estar desmarcados (aria-pressed === 'false')
    const botaoSegunda = screen.getByRole("button", { name: "Segunda" });
    const botaoQuarta = screen.getByRole("button", { name: "Quarta" });
    expect(botaoSegunda).toHaveAttribute("aria-pressed", "false");
    expect(botaoQuarta).toHaveAttribute("aria-pressed", "false");
  });

  it("ao clicar em Limpar Busca na aplicação, obtém todos os professores e apresenta os disponíveis", async () => {
    render(<App />);

    // Espera inicialização
    expect(await screen.findByText(/Passo 1/i)).toBeInTheDocument();

    const botaoLimpar = screen.getByRole("button", { name: /limpar busca/i });
    fireEvent.click(botaoLimpar);

    // Deve renderizar ambos os professores mockados do catálogo geral
    await waitFor(() => {
      expect(screen.getByText("Bruno")).toBeInTheDocument();
      expect(screen.getByText("Ana")).toBeInTheDocument();
      expect(screen.getByText("Carla")).toBeInTheDocument();
    });
  });
});
