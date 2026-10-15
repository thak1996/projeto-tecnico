using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Technical.Infrastructure.Repositories;
using Xunit;

namespace Technical.Tests.Infrastructure;

public class JsonProfessorRepositoryTests
{
    [Fact]
    public async Task ObterTodosAsync_DeveDesserializarProfessoresComHorariosCorretamente()
    {
        // Arrange
        var configuration = new ConfigurationBuilder().Build();
        var logger = NullLogger<JsonProfessorRepository>.Instance;
        var repository = new JsonProfessorRepository(configuration, logger);

        // Act
        var professores = await repository.ObterTodosAsync();

        // Assert
        Assert.NotNull(professores);
        Assert.NotEmpty(professores);

        var ana = professores.FirstOrDefault(p => p.Nome == "Ana");
        Assert.NotNull(ana);
        Assert.Contains("Inglês", ana.Idiomas);
        Assert.NotEmpty(ana.Disponibilidade);
        Assert.Equal(new TimeOnly(18, 0), ana.Disponibilidade[0].Inicio);
        Assert.Equal(new TimeOnly(22, 0), ana.Disponibilidade[0].Fim);

        Assert.NotEmpty(ana.AulasMarcadas);
        Assert.Equal(new TimeOnly(19, 0), ana.AulasMarcadas[0].Inicio);
        Assert.Equal(60, ana.AulasMarcadas[0].DuracaoMinutos);
    }
}
