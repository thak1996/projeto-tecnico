using Technical.Application.DTOs;

namespace Technical.Application.Interfaces;

public interface IBuscarProfessoresUseCase
{
    Task<BuscaProfessoresResponse> ExecutarAsync(BuscaProfessoresRequest request, CancellationToken cancellationToken = default);
}
