using Technical.Application.DTOs;
using Technical.Application.Validators;
using Xunit;

namespace Technical.Tests.Application;

public class BuscaProfessoresValidationTests
{
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validar_IdiomaAusenteOuVazio_DeveRetornarErro(string? idioma)
    {
        var request = new BuscaProfessoresRequest
        {
            Idioma = idioma!,
            Dias = new() { "segunda" },
            InicioFaixa = "18:00",
            FimFaixa = "20:00",
            DuracaoMinutos = 60
        };

        var errors = BuscaProfessoresRequestValidator.Validar(request);

        Assert.True(errors.ContainsKey("idioma"));
    }

    [Fact]
    public void Validar_DiasVazioOuNulo_DeveRetornarErro()
    {
        var request = new BuscaProfessoresRequest
        {
            Idioma = "Inglês",
            Dias = new(),
            InicioFaixa = "18:00",
            FimFaixa = "20:00",
            DuracaoMinutos = 60
        };

        var errors = BuscaProfessoresRequestValidator.Validar(request);

        Assert.True(errors.ContainsKey("dias"));
    }

    [Fact]
    public void Validar_DiaInvalido_DeveRetornarErro()
    {
        var request = new BuscaProfessoresRequest
        {
            Idioma = "Inglês",
            Dias = new() { "segunda", "feriado" },
            InicioFaixa = "18:00",
            FimFaixa = "20:00",
            DuracaoMinutos = 60
        };

        var errors = BuscaProfessoresRequestValidator.Validar(request);

        Assert.True(errors.ContainsKey("dias"));
    }

    [Theory]
    [InlineData(15)]
    [InlineData(45)]
    [InlineData(120)]
    [InlineData(0)]
    public void Validar_DuracaoInvalida_DeveRetornarErro(int duracao)
    {
        var request = new BuscaProfessoresRequest
        {
            Idioma = "Inglês",
            Dias = new() { "segunda" },
            InicioFaixa = "18:00",
            FimFaixa = "20:00",
            DuracaoMinutos = duracao
        };

        var errors = BuscaProfessoresRequestValidator.Validar(request);

        Assert.True(errors.ContainsKey("duracaoMinutos"));
    }

    [Fact]
    public void Validar_FimFaixaAnteriorOuIgualAoInicio_DeveRetornarErro()
    {
        var request = new BuscaProfessoresRequest
        {
            Idioma = "Inglês",
            Dias = new() { "segunda" },
            InicioFaixa = "19:00",
            FimFaixa = "18:00",
            DuracaoMinutos = 60
        };

        var errors = BuscaProfessoresRequestValidator.Validar(request);

        Assert.True(errors.ContainsKey("fimFaixa"));
    }

    [Fact]
    public void Validar_FaixaMenorQueDuracao_DeveRetornarErro()
    {
        // Faixa de 30 minutos (18:00 às 18:30) para aula de 60 minutos
        var request = new BuscaProfessoresRequest
        {
            Idioma = "Inglês",
            Dias = new() { "segunda" },
            InicioFaixa = "18:00",
            FimFaixa = "18:30",
            DuracaoMinutos = 60
        };

        var errors = BuscaProfessoresRequestValidator.Validar(request);

        Assert.True(errors.ContainsKey("faixa"));
    }

    [Theory]
    [InlineData("18:00:00")]
    [InlineData("8:00")]
    [InlineData("18:0")]
    [InlineData("25:00")]
    [InlineData("invalid")]
    public void Validar_InicioFaixaFormatoInvalidoOuComSegundos_DeveRetornarErro(string inicioInvalido)
    {
        var request = new BuscaProfessoresRequest
        {
            Idioma = "Inglês",
            Dias = new() { "segunda" },
            InicioFaixa = inicioInvalido,
            FimFaixa = "20:00",
            DuracaoMinutos = 60
        };

        var errors = BuscaProfessoresRequestValidator.Validar(request);

        Assert.True(errors.ContainsKey("inicioFaixa"));
        Assert.Contains("HH:mm", errors["inicioFaixa"][0]);
    }

    [Theory]
    [InlineData("20:00:00")]
    [InlineData("9:00")]
    [InlineData("20:0")]
    [InlineData("20:60")]
    [InlineData("invalid")]
    public void Validar_FimFaixaFormatoInvalidoOuComSegundos_DeveRetornarErro(string fimInvalido)
    {
        var request = new BuscaProfessoresRequest
        {
            Idioma = "Inglês",
            Dias = new() { "segunda" },
            InicioFaixa = "18:00",
            FimFaixa = fimInvalido,
            DuracaoMinutos = 60
        };

        var errors = BuscaProfessoresRequestValidator.Validar(request);

        Assert.True(errors.ContainsKey("fimFaixa"));
        Assert.Contains("HH:mm", errors["fimFaixa"][0]);
    }

    [Fact]
    public void Validar_RequisicaoValida_NaoDeveRetornarErros()
    {
        var request = new BuscaProfessoresRequest
        {
            Idioma = "Inglês",
            Dias = new() { "segunda", "quarta" },
            InicioFaixa = "18:00",
            FimFaixa = "22:00",
            DuracaoMinutos = 60
        };

        var errors = BuscaProfessoresRequestValidator.Validar(request);

        Assert.Empty(errors);
    }
}
