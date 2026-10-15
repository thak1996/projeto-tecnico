using Technical.Application.DTOs;
using Technical.Application.Interfaces;
using Technical.Application.UseCases;
using Technical.Domain.Entities;
using Xunit;

namespace Technical.Tests.Application;

public class ObterTodosProfessoresUseCaseTests
{
    private class FakeProfessorRepository : IProfessorRepository
    {
        private readonly IReadOnlyList<Professor> _professores;

        public FakeProfessorRepository(IReadOnlyList<Professor> professores)
        {
            _professores = professores;
        }

        public Task<IReadOnlyList<Professor>> ObterTodosAsync(CancellationToken cancellationToken = default)
        {
            return Task.FromResult(_professores);
        }
    }

    [Fact]
    public async Task ExecutarAsync_DeveRetornarProfessoresAtivosComoElegiveisEBloqueadosComoInelegiveis()
    {
        var professores = new List<Professor>
        {
            new Professor
            {
                Id = 1,
                Nome = "Ana",
                Idiomas = new List<string> { "Inglês" },
                AgendaBloqueada = false,
                Disponibilidade = new List<Disponibilidade>
                {
                    new Disponibilidade("segunda", new TimeOnly(18, 0), new TimeOnly(22, 0))
                },
                AulasMarcadas = new List<AulaMarcada>
                {
                    new AulaMarcada("segunda", new TimeOnly(19, 0), 60)
                }
            },
            new Professor
            {
                Id = 2,
                Nome = "Carla",
                Idiomas = new List<string> { "Inglês" },
                AgendaBloqueada = true,
                Disponibilidade = new List<Disponibilidade>(),
                AulasMarcadas = new List<AulaMarcada>()
            }
        };

        var fakeRepo = new FakeProfessorRepository(professores);
        var useCase = new ObterTodosProfessoresUseCase(fakeRepo);

        var resultado = await useCase.ExecutarAsync();

        Assert.NotNull(resultado);
        Assert.Single(resultado.Elegiveis);
        Assert.Single(resultado.NaoElegiveis);

        var elegivel = resultado.Elegiveis[0];
        Assert.Equal(1, elegivel.Id);
        Assert.Equal("Ana", elegivel.Nome);
        Assert.Single(elegivel.Disponibilidade);
        Assert.Single(elegivel.AulasMarcadas);

        var inelegivel = resultado.NaoElegiveis[0];
        Assert.Equal(2, inelegivel.Id);
        Assert.Equal("Carla", inelegivel.Nome);
        Assert.Equal("Agenda bloqueada", inelegivel.Motivo);
    }

    [Fact]
    public async Task ExecutarAsync_ProfessoresElegiveisDevemEstarOrdenadosPorNome()
    {
        var professores = new List<Professor>
        {
            new Professor { Id = 2, Nome = "Bruno", Idiomas = new List<string> { "Inglês" }, AgendaBloqueada = false },
            new Professor { Id = 1, Nome = "Ana", Idiomas = new List<string> { "Inglês" }, AgendaBloqueada = false },
            new Professor { Id = 3, Nome = "Diego", Idiomas = new List<string> { "Espanhol" }, AgendaBloqueada = false }
        };

        var fakeRepo = new FakeProfessorRepository(professores);
        var useCase = new ObterTodosProfessoresUseCase(fakeRepo);

        var resultado = await useCase.ExecutarAsync();

        Assert.Equal(3, resultado.Elegiveis.Count);
        Assert.Equal("Ana", resultado.Elegiveis[0].Nome);
        Assert.Equal("Bruno", resultado.Elegiveis[1].Nome);
        Assert.Equal("Diego", resultado.Elegiveis[2].Nome);
    }
}
