using System.Text.Json.Serialization;

namespace Technical.Application.DTOs;

public class BuscaProfessoresResponse
{
    private IReadOnlyList<ProfessorElegivelDto> _professores = Array.Empty<ProfessorElegivelDto>();

    [JsonPropertyName("professores")]
    public IReadOnlyList<ProfessorElegivelDto> Professores
    {
        get => _professores;
        set => _professores = value ?? Array.Empty<ProfessorElegivelDto>();
    }

    [JsonPropertyName("elegiveis")]
    public IReadOnlyList<ProfessorElegivelDto> Elegiveis
    {
        get => _professores;
        set => _professores = value ?? Array.Empty<ProfessorElegivelDto>();
    }

    [JsonPropertyName("naoElegiveis")]
    public IReadOnlyList<ProfessorInelegivelDto> NaoElegiveis { get; set; } = Array.Empty<ProfessorInelegivelDto>();

    public BuscaProfessoresResponse() { }

    public BuscaProfessoresResponse(
        IReadOnlyList<ProfessorElegivelDto> professores,
        IReadOnlyList<ProfessorInelegivelDto> naoElegiveis)
    {
        Professores = professores;
        NaoElegiveis = naoElegiveis;
    }
}
