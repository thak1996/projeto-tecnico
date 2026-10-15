namespace Technical.Application.DTOs;

public class ProfessorInelegivelDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public IReadOnlyList<string> Idiomas { get; set; } = Array.Empty<string>();
    public string Motivo { get; set; } = string.Empty;
}
