using Technical.Domain.Entities;
using Technical.Domain.Services;
using Technical.Domain.ValueObjects;
using Xunit;

namespace Technical.Tests.Domain;

public class ProfessorMatcherEligibilityTests
{
    private readonly ProfessorMatcher _matcher = new();

    [Fact]
    public void Avaliar_ProfessorElegivelComHorariosEmComum_DeveRetornarHorariosCorretosEQuantidadeAulas()
    {
        // Cenário baseado na professora Ana
        var professor = new Professor
        {
            Id = 1,
            Nome = "Ana",
            Idiomas = new[] { "Inglês", "Espanhol" },
            AgendaBloqueada = false,
            Disponibilidade = new[]
            {
                new Disponibilidade("segunda", new TimeOnly(18, 0), new TimeOnly(22, 0)),
                new Disponibilidade("quarta", new TimeOnly(18, 0), new TimeOnly(22, 0))
            },
            AulasMarcadas = new[]
            {
                new AulaMarcada("segunda", new TimeOnly(19, 0), 60)
            }
        };

        var criterio = new CriterioBusca(
            idioma: "Inglês",
            dias: new[] { "segunda", "quarta" },
            inicioFaixa: new TimeOnly(18, 0),
            fimFaixa: new TimeOnly(22, 0),
            duracaoMinutos: 60
        );

        var resultado = _matcher.Avaliar(new[] { professor }, criterio);

        Assert.Single(resultado.Elegiveis);
        Assert.Empty(resultado.NaoElegiveis);

        var elegivel = resultado.Elegiveis[0];
        Assert.Equal("Ana", elegivel.Professor.Nome);
        Assert.Equal(1, elegivel.QuantidadeAulasNaSemana);
        // Horários em comum para aula de 60 min entre 18h e 22h: 18:00, 20:00, 20:30 e 21:00
        Assert.Equal(new[] { "18:00", "20:00", "20:30", "21:00" }, elegivel.HorariosDisponiveis);
    }

    [Fact]
    public void Avaliar_AulasConsecutivas_PermiteSlotExatamenteNoFimDeAulaAnterior()
    {
        var professor = new Professor
        {
            Id = 1,
            Nome = "Carlos",
            Idiomas = new[] { "Inglês" },
            AgendaBloqueada = false,
            Disponibilidade = new[]
            {
                new Disponibilidade("segunda", new TimeOnly(18, 0), new TimeOnly(21, 0))
            },
            AulasMarcadas = new[]
            {
                new AulaMarcada("segunda", new TimeOnly(18, 0), 60) // 18:00 às 19:00
            }
        };

        var criterio = new CriterioBusca(
            idioma: "Inglês",
            dias: new[] { "segunda" },
            inicioFaixa: new TimeOnly(18, 0),
            fimFaixa: new TimeOnly(21, 0),
            duracaoMinutos: 60
        );

        var resultado = _matcher.Avaliar(new[] { professor }, criterio);

        Assert.Single(resultado.Elegiveis);
        var elegivel = resultado.Elegiveis[0];
        // Slot das 19:00 às 20:00 e 20:00 às 21:00 são válidos consecutivamente
        Assert.Contains("19:00", elegivel.HorariosDisponiveis);
        Assert.Contains("20:00", elegivel.HorariosDisponiveis);
        Assert.DoesNotContain("18:00", elegivel.HorariosDisponiveis);
    }

    [Fact]
    public void Avaliar_HorarioQuebrado_IniciaApenasEm00Ou30()
    {
        // Cenário baseado no Fábio com disponibilidade 18:15 às 20:00
        var professor = new Professor
        {
            Id = 6,
            Nome = "Fábio",
            Idiomas = new[] { "Inglês" },
            AgendaBloqueada = false,
            Disponibilidade = new[]
            {
                new Disponibilidade("segunda", new TimeOnly(18, 15), new TimeOnly(20, 0))
            },
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

        Assert.Single(resultado.Elegiveis);
        var elegivel = resultado.Elegiveis[0];
        // 18:15 não pode iniciar (:00 ou :30). 18:30-19:30 e 19:00-20:00 cabem dentro de 18:15 a 20:00.
        Assert.Equal(new[] { "18:30", "19:00" }, elegivel.HorariosDisponiveis);
    }

    [Fact]
    public void Avaliar_OrdenacaoElegiveis_MenorQuantidadeAulasEDesempateAlfabetico()
    {
        var profA = new Professor
        {
            Id = 1,
            Nome = "Zulmira",
            Idiomas = new[] { "Inglês" },
            AgendaBloqueada = false,
            Disponibilidade = new[] { new Disponibilidade("segunda", new TimeOnly(18, 0), new TimeOnly(22, 0)) },
            AulasMarcadas = new[]
            {
                new AulaMarcada("segunda", new TimeOnly(18, 0), 30),
                new AulaMarcada("segunda", new TimeOnly(19, 0), 30)
            } // 2 aulas na segunda
        };

        var profB = new Professor
        {
            Id = 2,
            Nome = "Beatriz",
            Idiomas = new[] { "Inglês" },
            AgendaBloqueada = false,
            Disponibilidade = new[] { new Disponibilidade("segunda", new TimeOnly(18, 0), new TimeOnly(22, 0)) },
            AulasMarcadas = Array.Empty<AulaMarcada>() // 0 aulas
        };

        var profC = new Professor
        {
            Id = 3,
            Nome = "Alberto",
            Idiomas = new[] { "Inglês" },
            AgendaBloqueada = false,
            Disponibilidade = new[] { new Disponibilidade("segunda", new TimeOnly(18, 0), new TimeOnly(22, 0)) },
            AulasMarcadas = Array.Empty<AulaMarcada>() // 0 aulas
        };

        var criterio = new CriterioBusca(
            idioma: "Inglês",
            dias: new[] { "segunda" },
            inicioFaixa: new TimeOnly(20, 0),
            fimFaixa: new TimeOnly(22, 0),
            duracaoMinutos: 60
        );

        var resultado = _matcher.Avaliar(new[] { profA, profB, profC }, criterio);

        Assert.Equal(3, resultado.Elegiveis.Count);
        // Menor número de aulas primeiro (0 aulas), com empate desempatado por nome alfabético: Alberto antes de Beatriz
        Assert.Equal("Alberto", resultado.Elegiveis[0].Professor.Nome);
        Assert.Equal(0, resultado.Elegiveis[0].QuantidadeAulasNaSemana);

        Assert.Equal("Beatriz", resultado.Elegiveis[1].Professor.Nome);
        Assert.Equal(0, resultado.Elegiveis[1].QuantidadeAulasNaSemana);

        Assert.Equal("Zulmira", resultado.Elegiveis[2].Professor.Nome);
        Assert.Equal(2, resultado.Elegiveis[2].QuantidadeAulasNaSemana);
    }
}
