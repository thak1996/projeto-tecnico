using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Technical.Api.Controllers;
using Technical.Application.DTOs;
using Technical.Application.Interfaces;
using Xunit;

namespace Technical.Tests.Api;

public class ProfessoresControllerTests
{
    private class FakeBuscarUseCase : IBuscarProfessoresUseCase
    {
        public Task<BuscaProfessoresResponse> ExecutarAsync(BuscaProfessoresRequest request, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new BuscaProfessoresResponse(
                new List<ProfessorElegivelDto>(),
                new List<ProfessorInelegivelDto>()
            ));
        }
    }

    private class FakeObterTodosUseCase : IObterTodosProfessoresUseCase
    {
        public Task<BuscaProfessoresResponse> ExecutarAsync(CancellationToken cancellationToken = default)
        {
            var elegiveis = new List<ProfessorElegivelDto>
            {
                new ProfessorElegivelDto { Id = 1, Nome = "Ana", Idiomas = new List<string> { "Inglês" } }
            };
            var naoElegiveis = new List<ProfessorInelegivelDto>
            {
                new ProfessorInelegivelDto { Id = 2, Nome = "Carla", Idiomas = new List<string> { "Inglês" }, Motivo = "Agenda bloqueada" }
            };
            return Task.FromResult(new BuscaProfessoresResponse(elegiveis, naoElegiveis));
        }
    }

    [Fact]
    public async Task ObterTodos_DeveRetornarOkComTodosOsProfessores()
    {
        var controller = new ProfessoresController(
            new FakeBuscarUseCase(),
            new FakeObterTodosUseCase(),
            NullLogger<ProfessoresController>.Instance
        );

        var actionResult = await controller.ObterTodos(CancellationToken.None);

        var okResult = Assert.IsType<OkObjectResult>(actionResult);
        var response = Assert.IsType<BuscaProfessoresResponse>(okResult.Value);

        Assert.Single(response.Elegiveis);
        Assert.Single(response.NaoElegiveis);
        Assert.Equal("Ana", response.Elegiveis[0].Nome);
        Assert.Equal("Carla", response.NaoElegiveis[0].Nome);
    }
}
