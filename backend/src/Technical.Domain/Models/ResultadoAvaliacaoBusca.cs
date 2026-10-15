using Technical.Domain.Entities;

namespace Technical.Domain.Models;

public class ProfessorElegivelResultado
{
    public Professor Professor { get; set; } = null!;
    public int QuantidadeAulasNaSemana { get; set; }
    public IReadOnlyList<string> HorariosDisponiveis { get; set; } = Array.Empty<string>();

    public ProfessorElegivelResultado() { }

    public ProfessorElegivelResultado(Professor professor, int quantidadeAulasNaSemana, IReadOnlyList<string> horariosDisponiveis)
    {
        Professor = professor;
        QuantidadeAulasNaSemana = quantidadeAulasNaSemana;
        HorariosDisponiveis = horariosDisponiveis;
    }
}

public class ProfessorInelegivelResultado
{
    public Professor Professor { get; set; } = null!;
    public string Motivo { get; set; } = string.Empty;

    public ProfessorInelegivelResultado() { }

    public ProfessorInelegivelResultado(Professor professor, string motivo)
    {
        Professor = professor;
        Motivo = motivo;
    }
}

public class ResultadoAvaliacaoBusca
{
    public IReadOnlyList<ProfessorElegivelResultado> Elegiveis { get; set; }
    public IReadOnlyList<ProfessorInelegivelResultado> NaoElegiveis { get; set; }

    public ResultadoAvaliacaoBusca(
        IReadOnlyList<ProfessorElegivelResultado> elegiveis,
        IReadOnlyList<ProfessorInelegivelResultado> naoElegiveis)
    {
        Elegiveis = elegiveis;
        NaoElegiveis = naoElegiveis;
    }
}
