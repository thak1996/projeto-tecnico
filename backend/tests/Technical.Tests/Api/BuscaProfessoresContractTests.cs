using System.Text.Json;
using Technical.Application.DTOs;
using Xunit;

namespace Technical.Tests.Api;

public class BuscaProfessoresContractTests
{
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    [Fact]
    public void Serializacao_DeveConterChavesLiteraisDoDesafioEChavesLegadas()
    {
        var professor = new ProfessorElegivelDto
        {
            Id = 1,
            Nome = "Ana",
            Idiomas = new List<string> { "Inglês", "Espanhol" },
            AulasNaSemana = 1,
            Horarios = new List<string> { "18:00", "20:00" },
            Disponibilidade = new List<DisponibilidadeItemDto>
            {
                new() { Dia = "segunda", Inicio = "18:00", Fim = "22:00" }
            },
            AulasMarcadas = new List<AulaMarcadaItemDto>
            {
                new() { Dia = "segunda", Inicio = "19:00", DuracaoMinutos = 60 }
            }
        };

        var inelegivel = new ProfessorInelegivelDto
        {
            Id = 3,
            Nome = "Carla",
            Idiomas = new List<string> { "Inglês" },
            Motivo = "Agenda bloqueada"
        };

        var response = new BuscaProfessoresResponse(
            new List<ProfessorElegivelDto> { professor },
            new List<ProfessorInelegivelDto> { inelegivel }
        );

        var json = JsonSerializer.Serialize(response, _jsonOptions);

        // Chaves literais do desafio
        Assert.Contains("\"professores\":", json);
        Assert.Contains("\"aulasNaSemana\":1", json);
        Assert.Contains("\"horarios\":[\"18:00\",\"20:00\"]", json);
        Assert.Contains("\"naoElegiveis\":", json);

        // Chaves de retrocompatibilidade com UI e clientes existentes
        Assert.Contains("\"elegiveis\":", json);
        Assert.Contains("\"quantidadeAulasNaSemana\":1", json);
        Assert.Contains("\"horariosDisponiveis\":[\"18:00\",\"20:00\"]", json);
    }

    [Fact]
    public void Desserializacao_ComChavesLiteraisDoDesafio_DevePreencherPropriedades()
    {
        var json = """
        {
            "professores": [
                {
                    "id": 1,
                    "nome": "Ana",
                    "idiomas": ["Inglês"],
                    "aulasNaSemana": 2,
                    "horarios": ["18:00", "19:00"]
                }
            ],
            "naoElegiveis": []
        }
        """;

        var response = JsonSerializer.Deserialize<BuscaProfessoresResponse>(json, _jsonOptions);

        Assert.NotNull(response);
        Assert.Single(response.Professores);
        Assert.Single(response.Elegiveis);
        Assert.Equal(1, response.Professores[0].Id);
        Assert.Equal("Ana", response.Professores[0].Nome);
        Assert.Equal(2, response.Professores[0].AulasNaSemana);
        Assert.Equal(2, response.Professores[0].QuantidadeAulasNaSemana);
        Assert.Equal(2, response.Professores[0].Horarios.Count);
        Assert.Equal(2, response.Professores[0].HorariosDisponiveis.Count);
    }

    [Fact]
    public void Desserializacao_ComChavesLegadas_DevePreencherPropriedades()
    {
        var json = """
        {
            "elegiveis": [
                {
                    "id": 2,
                    "nome": "Bruno",
                    "idiomas": ["Espanhol"],
                    "quantidadeAulasNaSemana": 3,
                    "horariosDisponiveis": ["14:00"]
                }
            ],
            "naoElegiveis": []
        }
        """;

        var response = JsonSerializer.Deserialize<BuscaProfessoresResponse>(json, _jsonOptions);

        Assert.NotNull(response);
        Assert.Single(response.Professores);
        Assert.Single(response.Elegiveis);
        Assert.Equal(2, response.Elegiveis[0].Id);
        Assert.Equal("Bruno", response.Elegiveis[0].Nome);
        Assert.Equal(3, response.Elegiveis[0].AulasNaSemana);
        Assert.Equal(3, response.Elegiveis[0].QuantidadeAulasNaSemana);
        Assert.Single(response.Elegiveis[0].Horarios);
        Assert.Single(response.Elegiveis[0].HorariosDisponiveis);
    }
}
