namespace Technical.Application.DTOs;

public class BuscaProfessoresResponse
{
    public IReadOnlyList<ProfessorElegivelDto> Elegiveis { get; set; } = Array.Empty<ProfessorElegivelDto>();
    public IReadOnlyList<ProfessorInelegivelDto> NaoElegiveis { get; set; } = Array.Empty<ProfessorInelegivelDto>();

    public BuscaProfessoresResponse() { }

    public BuscaProfessoresResponse(
        IReadOnlyList<ProfessorElegivelDto> elegiveis,
        IReadOnlyList<ProfessorInelegivelDto> naoElegiveis)
    {
        Elegiveis = elegiveis;
        NaoElegiveis = naoElegiveis;
    }
}
