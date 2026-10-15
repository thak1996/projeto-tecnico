using Technical.Application.DTOs;

namespace Technical.Application.Interfaces;

public interface IObterTodosProfessoresUseCase
{
    Task<BuscaProfessoresResponse> ExecutarAsync(CancellationToken cancellationToken = default);
}
