namespace Technical.Domain.ValueObjects;

public class CriterioBusca
{
    public string Idioma { get; }
    public IReadOnlyList<string> Dias { get; }
    public TimeOnly InicioFaixa { get; }
    public TimeOnly FimFaixa { get; }
    public int DuracaoMinutos { get; }

    public CriterioBusca(
        string idioma,
        IReadOnlyList<string> dias,
        TimeOnly inicioFaixa,
        TimeOnly fimFaixa,
        int duracaoMinutos)
    {
        Idioma = idioma?.Trim() ?? string.Empty;
        Dias = dias ?? Array.Empty<string>();
        InicioFaixa = inicioFaixa;
        FimFaixa = fimFaixa;
        DuracaoMinutos = duracaoMinutos;
    }
}
