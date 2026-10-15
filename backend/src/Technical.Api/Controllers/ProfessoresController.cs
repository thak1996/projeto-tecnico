using Microsoft.AspNetCore.Mvc;
using Technical.Application.DTOs;
using Technical.Application.Interfaces;
using Technical.Application.Validators;

namespace Technical.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfessoresController : ControllerBase
{
    private readonly IBuscarProfessoresUseCase _buscarProfessoresUseCase;
    private readonly IObterTodosProfessoresUseCase _obterTodosProfessoresUseCase;
    private readonly ILogger<ProfessoresController> _logger;

    public ProfessoresController(
        IBuscarProfessoresUseCase buscarProfessoresUseCase,
        IObterTodosProfessoresUseCase obterTodosProfessoresUseCase,
        ILogger<ProfessoresController> logger)
    {
        _buscarProfessoresUseCase = buscarProfessoresUseCase;
        _obterTodosProfessoresUseCase = obterTodosProfessoresUseCase;
        _logger = logger;
    }

    /// <summary>
    /// Obtém a listagem geral de todos os professores cadastrados e suas disponibilidades semanais completas.
    /// </summary>
    /// <param name="cancellationToken">Token de cancelamento da operação.</param>
    /// <returns>Resultado com todos os professores ativos e bloqueados.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(BuscaProfessoresResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObterTodos(CancellationToken cancellationToken)
    {
        var resultado = await _obterTodosProfessoresUseCase.ExecutarAsync(cancellationToken);
        return Ok(resultado);
    }

    /// <summary>
    /// Busca e avalia a elegibilidade de professores com base no idioma, dias da semana, faixa de horário e duração da aula.
    /// </summary>
    /// <param name="request">Critérios de pesquisa informados.</param>
    /// <param name="cancellationToken">Token de cancelamento da operação.</param>
    /// <returns>Resultado contendo os professores elegíveis ordenados e os professores inelegíveis com motivos padronizados.</returns>
    [HttpPost("busca")]
    [ProducesResponseType(typeof(BuscaProfessoresResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Buscar([FromBody] BuscaProfessoresRequest request, CancellationToken cancellationToken)
    {
        var validationErrors = BuscaProfessoresRequestValidator.Validar(request);
        if (validationErrors.Count > 0)
        {
            var problemDetails = new ValidationProblemDetails(validationErrors)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Dados de busca inválidos"
            };
            return BadRequest(problemDetails);
        }

        try
        {
            var resultado = await _buscarProfessoresUseCase.ExecutarAsync(request, cancellationToken);
            return Ok(resultado);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Erro de argumento na busca de professores.");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Dados de busca inválidos",
                Detail = ex.Message
            });
        }
    }
}
