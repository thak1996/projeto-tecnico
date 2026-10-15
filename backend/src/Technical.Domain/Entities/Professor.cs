namespace Technical.Domain.Entities;

public class Professor
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public IReadOnlyList<string> Idiomas { get; set; } = Array.Empty<string>();
    public bool AgendaBloqueada { get; set; }
    public IReadOnlyList<Disponibilidade> Disponibilidade { get; set; } = Array.Empty<Disponibilidade>();
    public IReadOnlyList<AulaMarcada> AulasMarcadas { get; set; } = Array.Empty<AulaMarcada>();

    public Professor() { }

    public Professor(
        int id,
        string nome,
        IReadOnlyList<string> idiomas,
        bool agendaBloqueada,
        IReadOnlyList<Disponibilidade> disponibilidade,
        IReadOnlyList<AulaMarcada> aulasMarcadas)
    {
        Id = id;
        Nome = nome;
        Idiomas = idiomas;
        AgendaBloqueada = agendaBloqueada;
        Disponibilidade = disponibilidade;
        AulasMarcadas = aulasMarcadas;
    }
}
