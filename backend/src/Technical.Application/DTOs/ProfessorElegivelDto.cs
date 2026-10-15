using System.Text.Json.Serialization;

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
    private int _aulasNaSemana;
    private IReadOnlyList<string> _horarios = Array.Empty<string>();

    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public IReadOnlyList<string> Idiomas { get; set; } = Array.Empty<string>();

    [JsonPropertyName("aulasNaSemana")]
    public int AulasNaSemana
    {
        get => _aulasNaSemana;
        set => _aulasNaSemana = value;
    }

    [JsonPropertyName("quantidadeAulasNaSemana")]
    public int QuantidadeAulasNaSemana
    {
        get => _aulasNaSemana;
        set => _aulasNaSemana = value;
    }

    [JsonPropertyName("horarios")]
    public IReadOnlyList<string> Horarios
    {
        get => _horarios;
        set => _horarios = value ?? Array.Empty<string>();
    }

    [JsonPropertyName("horariosDisponiveis")]
    public IReadOnlyList<string> HorariosDisponiveis
    {
        get => _horarios;
        set => _horarios = value ?? Array.Empty<string>();
    }

    public IReadOnlyList<DisponibilidadeItemDto> Disponibilidade { get; set; } = Array.Empty<DisponibilidadeItemDto>();
    public IReadOnlyList<AulaMarcadaItemDto> AulasMarcadas { get; set; } = Array.Empty<AulaMarcadaItemDto>();
}
