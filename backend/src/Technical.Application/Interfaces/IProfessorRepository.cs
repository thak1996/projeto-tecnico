using Technical.Domain.Entities;

namespace Technical.Application.Interfaces;

public interface IProfessorRepository
{
    Task<IReadOnlyList<Professor>> ObterTodosAsync(CancellationToken cancellationToken = default);
}
