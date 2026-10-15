import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ListaResultadosProfessores } from "../../../src/features/professores/components/ListaResultadosProfessores";

describe("ListaResultadosProfessores - Estados Visuais", () => {
  it("deve renderizar o estado de carregamento (loading)", () => {
    render(
      <ListaResultadosProfessores
        resultado={null}
        isLoading={true}
        erro={null}
      />
    );

    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });

  it("deve renderizar o estado de erro e acionar o botão de tentar novamente", () => {
    const onTentarNovamente = vi.fn();
    render(
      <ListaResultadosProfessores
        resultado={null}
        isLoading={false}
        erro="Não foi possível conectar ao servidor"
        onTentarNovamente={onTentarNovamente}
      />
    );

    expect(screen.getByTestId("error-state")).toBeInTheDocument();
    expect(screen.getByText("Falha na consulta")).toBeInTheDocument();
    expect(
      screen.getByText("Não foi possível conectar ao servidor")
    ).toBeInTheDocument();

    const botaoTentar = screen.getByRole("button", { name: /tentar novamente/i });
    fireEvent.click(botaoTentar);
    expect(onTentarNovamente).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar o estado vazio quando nenhum professor for encontrado", () => {
    render(
      <ListaResultadosProfessores
        resultado={{ elegiveis: [], naoElegiveis: [] }}
        isLoading={false}
        erro={null}
      />
    );

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("Nenhum professor cadastrado")).toBeInTheDocument();
  });

  it("deve exibir aviso quando não houver professores elegíveis, mas houver não elegíveis", () => {
    render(
      <ListaResultadosProfessores
        resultado={{
          elegiveis: [],
          naoElegiveis: [
            {
              id: 3,
              nome: "Carla",
              idiomas: ["Inglês"],
              motivo: "Agenda bloqueada",
            },
          ],
        }}
        isLoading={false}
        erro={null}
      />
    );

    expect(screen.getByTestId("empty-elegiveis")).toBeInTheDocument();
    expect(screen.getByText(/Professores Não Disponíveis \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText("Carla")).toBeInTheDocument();
  });

  it("deve resetar a seleção de horários ao trocar de professor", () => {
    const profAna = {
      id: 1,
      nome: "Ana",
      idiomas: ["Inglês"],
      quantidadeAulasNaSemana: 1,
      horariosDisponiveis: ["18:00"],
      disponibilidade: [{ dia: "segunda", inicio: "18:00", fim: "22:00" }],
    };
    const profBruno = {
      id: 2,
      nome: "Bruno",
      idiomas: ["Inglês"],
      quantidadeAulasNaSemana: 2,
      horariosDisponiveis: ["20:00"],
      disponibilidade: [{ dia: "segunda", inicio: "18:00", fim: "22:00" }],
    };

    render(
      <ListaResultadosProfessores
        resultado={{
          elegiveis: [profAna, profBruno],
          naoElegiveis: [],
        }}
        isLoading={false}
        erro={null}
        diasPesquisados={["segunda"]}
      />
    );

    // Ana está ativa por padrão. Seleciona 18:00
    const btn18 = screen.getByRole("button", { name: /18:00/i });
    fireEvent.click(btn18);

    // Verifica que 18:00 está selecionado
    expect(screen.getByText(/Horário Selecionado: 18:00 com Ana/i)).toBeInTheDocument();

    // Clica no card de Bruno
    const cardBruno = screen.getByText("Bruno").closest(".cursor-pointer");
    expect(cardBruno).not.toBeNull();
    fireEvent.click(cardBruno!);

    // Agora a grade exibe Bruno e a seleção de horários foi resetada
    expect(screen.getByText(/Grade Semanal de Bruno/i)).toBeInTheDocument();
    expect(screen.queryByText(/Horário Selecionado: 18:00/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Nenhum horário selecionado/i)).toBeInTheDocument();
  });
});
