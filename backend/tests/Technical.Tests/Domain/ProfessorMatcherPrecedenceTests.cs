using Technical.Domain.Constants;
using Technical.Domain.Entities;
using Technical.Domain.Services;
using Technical.Domain.ValueObjects;
using Xunit;

namespace Technical.Tests.Domain;

public class ProfessorMatcherPrecedenceTests
{
    private readonly ProfessorMatcher _matcher = new();

    [Fact]
    public void Precedencia1_NaoEnsinaIdioma_TemPrioridadeSobreAgendaBloqueada()
    {
        // Professor não ensina o idioma E possui agenda bloqueada
        var professor = new Professor
        {
            Id = 4,
            Nome = "Diego",
            Idiomas = new[] { "Espanhol" },
            AgendaBloqueada = true,
            Disponibilidade = Array.Empty<Disponibilidade>(),
            AulasMarcadas = Array.Empty<AulaMarcada>()
        };

        var criterio = new CriterioBusca(
            idioma: "Inglês",
            dias: new[] { "segunda" },
            inicioFaixa: new TimeOnly(18, 0),
            fimFaixa: new TimeOnly(20, 0),
            duracaoMinutos: 60
        );

        var resultado = _matcher.Avaliar(new[] { professor }, criterio);

        Assert.Empty(resultado.Elegiveis);
        Assert.Single(resultado.NaoElegiveis);

        var inelegivel = resultado.NaoElegiveis[0];
        Assert.Equal("Diego", inelegivel.Professor.Nome);
        // Precedência máxima: Não ensina o idioma
        Assert.Equal(MotivosInelegibilidade.NaoEnsinaIdioma, inelegivel.Motivo);
    }

    [Fact]
    public void Precedencia2_AgendaBloqueada_TemPrioridadeSobreSemHorario()
    {
        // Professor ensina o idioma, mas possui agenda bloqueada (e não tem disponibilidade)
        var professor = new Professor
        {
            Id = 3,
            Nome = "Carla",
            Idiomas = new[] { "Inglês" },
            AgendaBloqueada = true,
            Disponibilidade = Array.Empty<Disponibilidade>(),
            AulasMarcadas = Array.Empty<AulaMarcada>()
        };

        var criterio = new CriterioBusca(
            idioma: "Inglês",
            dias: new[] { "segunda" },
            inicioFaixa: new TimeOnly(18, 0),
            fimFaixa: new TimeOnly(20, 0),
            duracaoMinutos: 60
        );

        var resultado = _matcher.Avaliar(new[] { professor }, criterio);

        Assert.Empty(resultado.Elegiveis);
        Assert.Single(resultado.NaoElegiveis);

        var inelegivel = resultado.NaoElegiveis[0];
        Assert.Equal("Carla", inelegivel.Professor.Nome);
        Assert.Equal(MotivosInelegibilidade.AgendaBloqueada, inelegivel.Motivo);
    }

    [Fact]
    public void Precedencia3_SemHorarioEmComum_QuandoProfessorTemHorariosDesencontrados()
    {
        // Cenário do professor Heitor de professores.json:
        // Segunda livre apenas das 18:00 às 19:00 (aulas às 19:00 e 20:00)
        // Quarta livre apenas das 20:00 às 21:00 (aulas às 18:00 e 19:00)
        var heitor = new Professor
        {
            Id = 8,
            Nome = "Heitor",
            Idiomas = new[] { "Inglês" },
            AgendaBloqueada = false,
            Disponibilidade = new[]
            {
                new Disponibilidade("segunda", new TimeOnly(18, 0), new TimeOnly(21, 0)),
                new Disponibilidade("quarta", new TimeOnly(18, 0), new TimeOnly(21, 0))
            },
            AulasMarcadas = new[]
            {
                new AulaMarcada("segunda", new TimeOnly(19, 0), 60),
                new AulaMarcada("segunda", new TimeOnly(20, 0), 60),
                new AulaMarcada("quarta", new TimeOnly(18, 0), 60),
                new AulaMarcada("quarta", new TimeOnly(19, 0), 60)
            }
        };

        var criterio = new CriterioBusca(
            idioma: "Inglês",
            dias: new[] { "segunda", "quarta" },
            inicioFaixa: new TimeOnly(18, 0),
            fimFaixa: new TimeOnly(21, 0),
            duracaoMinutos: 60
        );

        var resultado = _matcher.Avaliar(new[] { heitor }, criterio);

        Assert.Empty(resultado.Elegiveis);
        Assert.Single(resultado.NaoElegiveis);

        var inelegivel = resultado.NaoElegiveis[0];
        Assert.Equal("Heitor", inelegivel.Professor.Nome);
        Assert.Equal(MotivosInelegibilidade.SemHorarioEmComum, inelegivel.Motivo);
    }
}
