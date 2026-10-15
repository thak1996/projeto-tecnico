namespace Technical.Application.DTOs;

public class DisponibilidadeItemDto
{
    public string Dia { get; set; } = string.Empty;
    public string Inicio { get; set; } = string.Empty;
    public string Fim { get; set; } = string.Empty;
}

public class AulaMarcadaItemDto
{
    public string Dia { get; set; } = string.Empty;
    public string Inicio { get; set; } = string.Empty;
    public int DuracaoMinutos { get; set; }
}

public class ProfessorElegivelDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public IReadOnlyList<string> Idiomas { get; set; } = Array.Empty<string>();
    public int QuantidadeAulasNaSemana { get; set; }
    public IReadOnlyList<string> HorariosDisponiveis { get; set; } = Array.Empty<string>();
    public IReadOnlyList<DisponibilidadeItemDto> Disponibilidade { get; set; } = Array.Empty<DisponibilidadeItemDto>();
    public IReadOnlyList<AulaMarcadaItemDto> AulasMarcadas { get; set; } = Array.Empty<AulaMarcadaItemDto>();
}
