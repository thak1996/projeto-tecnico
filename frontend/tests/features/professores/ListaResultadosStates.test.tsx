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
});
