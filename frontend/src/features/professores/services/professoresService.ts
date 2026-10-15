import type {
  BuscaProfessoresFiltros,
  BuscaProfessoresResultado,
  ProblemDetailsError,
  ProfessorElegivel,
  RawBuscaProfessoresResponse,
  RawProfessorDto,
} from "../types/busca";

export class ApiError extends Error {
  status: number;
  problemDetails?: ProblemDetailsError;

  constructor(message: string, status: number, problemDetails?: ProblemDetailsError) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.problemDetails = problemDetails;
  }
}

export function normalizarResultado(data: RawBuscaProfessoresResponse): BuscaProfessoresResultado {
  const lista: RawProfessorDto[] = data.professores ?? data.elegiveis ?? [];
  const elegiveis: ProfessorElegivel[] = lista.map((p: RawProfessorDto) => {
    const aulas = p.aulasNaSemana ?? p.quantidadeAulasNaSemana ?? 0;
    const horarios = p.horarios ?? p.horariosDisponiveis ?? [];
    return {
      ...p,
      aulasNaSemana: p.aulasNaSemana ?? aulas,
      quantidadeAulasNaSemana: p.quantidadeAulasNaSemana ?? aulas,
      horarios: p.horarios ?? horarios,
      horariosDisponiveis: p.horariosDisponiveis ?? horarios,
    };
  });

  return {
    ...data,
    professores: elegiveis,
    elegiveis,
    naoElegiveis: data.naoElegiveis ?? [],
  };
}

export async function buscarProfessores(
  filtros: BuscaProfessoresFiltros
): Promise<BuscaProfessoresResultado> {
  const response = await fetch("/api/professores/busca", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filtros),
  });

  if (!response.ok) {
    let problemDetails: ProblemDetailsError | undefined;
    try {
      problemDetails = (await response.json()) as ProblemDetailsError;
    } catch {
      // Ignora erro de parsing JSON
    }

    let errorMessage = `Erro HTTP ${response.status}`;
    if (problemDetails?.errors) {
      const messages = Object.values(problemDetails.errors).flat();
      if (messages.length > 0) {
        errorMessage = messages.join(" ");
      }
    } else if (problemDetails?.title) {
      errorMessage = problemDetails.title;
    }

    throw new ApiError(errorMessage, response.status, problemDetails);
  }

  const data = (await response.json()) as RawBuscaProfessoresResponse;
  return normalizarResultado(data);
}

export async function obterTodosProfessores(): Promise<BuscaProfessoresResultado> {
  const response = await fetch("/api/professores", {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    let problemDetails: ProblemDetailsError | undefined;
    try {
      problemDetails = (await response.json()) as ProblemDetailsError;
    } catch {
      // Ignora erro de parsing JSON
    }

    let errorMessage = `Erro HTTP ${response.status}`;
    if (problemDetails?.title) {
      errorMessage = problemDetails.title;
    }

    throw new ApiError(errorMessage, response.status, problemDetails);
  }

  const data = (await response.json()) as RawBuscaProfessoresResponse;
  return normalizarResultado(data);
}
