namespace Technical.Application.DTOs;

public class BuscaProfessoresRequest
{
    public string Idioma { get; set; } = string.Empty;
    public List<string> Dias { get; set; } = new();
    public string InicioFaixa { get; set; } = string.Empty;
    public string FimFaixa { get; set; } = string.Empty;
    public int DuracaoMinutos { get; set; }
}
