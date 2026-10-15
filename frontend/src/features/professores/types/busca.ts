export type DiaSemana =
  | 'segunda'
  | 'terca'
  | 'quarta'
  | 'quinta'
  | 'sexta'
  | 'sabado'
  | 'domingo';

export type DuracaoAula = 30 | 60 | 90;

export interface BuscaProfessoresFiltros {
  idioma: string;
  dias: DiaSemana[];
  inicioFaixa: string;
  fimFaixa: string;
  duracaoMinutos: DuracaoAula;
}

export interface DisponibilidadeItem {
  dia: DiaSemana | string;
  inicio: string;
  fim: string;
}

export interface AulaMarcadaItem {
  dia: DiaSemana | string;
  inicio: string;
  duracaoMinutos: number;
}

export interface ProfessorElegivel {
  id: number;
  nome: string;
  idiomas: string[];
  aulasNaSemana?: number;
  quantidadeAulasNaSemana: number;
  horarios?: string[];
  horariosDisponiveis: string[];
  disponibilidade?: DisponibilidadeItem[];
  aulasMarcadas?: AulaMarcadaItem[];
}

export interface ProfessorInelegivel {
  id: number;
  nome: string;
  idiomas: string[];
  motivo: string;
}

export interface BuscaProfessoresResultado {
  professores?: ProfessorElegivel[];
  elegiveis: ProfessorElegivel[];
  naoElegiveis: ProfessorInelegivel[];
}

export interface ProblemDetailsError {
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
