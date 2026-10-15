import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buscarProfessores,
  obterTodosProfessores,
  ApiError,
} from "../../../src/features/professores/services/professoresService";
import type { BuscaProfessoresFiltros } from "../../../src/features/professores/types/busca";

describe("professoresService", () => {
  const filtrosValidos: BuscaProfessoresFiltros = {
    idioma: "Inglês",
    dias: ["segunda"],
    inicioFaixa: "18:00",
    fimFaixa: "20:00",
    duracaoMinutos: 60,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve retornar o resultado da busca com sucesso (HTTP 200) contendo chaves literais e compatíveis", async () => {
    const mockApi = {
      professores: [
        {
          id: 1,
          nome: "Ana",
          idiomas: ["Inglês"],
          aulasNaSemana: 0,
          quantidadeAulasNaSemana: 0,
          horarios: ["18:00", "19:00"],
          horariosDisponiveis: ["18:00", "19:00"],
        },
      ],
      elegiveis: [
        {
          id: 1,
          nome: "Ana",
          idiomas: ["Inglês"],
          aulasNaSemana: 0,
          quantidadeAulasNaSemana: 0,
          horarios: ["18:00", "19:00"],
          horariosDisponiveis: ["18:00", "19:00"],
        },
      ],
      naoElegiveis: [],
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockApi,
    } as Response);

    const resultado = await buscarProfessores(filtrosValidos);

    expect(resultado).toEqual(mockApi);
    expect(global.fetch).toHaveBeenCalledWith("/api/professores/busca", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filtrosValidos),
    });
  });

  it("deve normalizar resposta que venha exclusivamente no formato literal do desafio", async () => {
    const payloadLiteralDesafio = {
      professores: [
        {
          id: 1,
          nome: "Ana",
          idiomas: ["Inglês"],
          aulasNaSemana: 2,
          horarios: ["18:00"],
        },
      ],
      naoElegiveis: [],
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => payloadLiteralDesafio,
    } as Response);

    const resultado = await buscarProfessores(filtrosValidos);

    expect(resultado.professores).toBeDefined();
    expect(resultado.elegiveis).toBeDefined();
    expect(resultado.elegiveis[0].quantidadeAulasNaSemana).toBe(2);
    expect(resultado.elegiveis[0].aulasNaSemana).toBe(2);
    expect(resultado.elegiveis[0].horariosDisponiveis).toEqual(["18:00"]);
    expect(resultado.elegiveis[0].horarios).toEqual(["18:00"]);
  });

  it("deve lançar ApiError com mensagem descritiva ao receber HTTP 400 com ProblemDetails", async () => {
    const mockProblemDetails = {
      status: 400,
      title: "Dados de busca inválidos",
      errors: {
        faixa: ["A faixa de horário selecionada deve comportar ao menos a duração da aula."],
      },
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockProblemDetails,
    } as Response);

    let capturedError: ApiError | null = null;
    try {
      await buscarProfessores(filtrosValidos);
    } catch (e) {
      capturedError = e as ApiError;
    }

    expect(capturedError).toBeInstanceOf(ApiError);
    expect(capturedError?.status).toBe(400);
    expect(capturedError?.message).toContain("deve comportar ao menos a duração");
  });

  it("deve retornar todos os professores com sucesso ao chamar obterTodosProfessores (GET /api/professores)", async () => {
    const mockCatalogo = {
      professores: [
        { id: 1, nome: "Ana", idiomas: ["Inglês"], aulasNaSemana: 0, quantidadeAulasNaSemana: 0, horarios: [], horariosDisponiveis: [] },
      ],
      elegiveis: [
        { id: 1, nome: "Ana", idiomas: ["Inglês"], aulasNaSemana: 0, quantidadeAulasNaSemana: 0, horarios: [], horariosDisponiveis: [] },
      ],
      naoElegiveis: [
        { id: 3, nome: "Carla", idiomas: ["Inglês"], motivo: "Agenda bloqueada" },
      ],
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockCatalogo,
    } as Response);

    const resultado = await obterTodosProfessores();

    expect(resultado).toEqual(mockCatalogo);
    expect(global.fetch).toHaveBeenCalledWith("/api/professores", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  });
});
