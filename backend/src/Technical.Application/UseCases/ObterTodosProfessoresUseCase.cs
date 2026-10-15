using Technical.Application.DTOs;
using Technical.Application.Interfaces;
using Technical.Domain.Constants;

namespace Technical.Application.UseCases;

public class ObterTodosProfessoresUseCase : IObterTodosProfessoresUseCase
{
    private readonly IProfessorRepository _repository;

    public ObterTodosProfessoresUseCase(IProfessorRepository repository)
    {
        _repository = repository;
    }

    public async Task<BuscaProfessoresResponse> ExecutarAsync(CancellationToken cancellationToken = default)
    {
        var todos = await _repository.ObterTodosAsync(cancellationToken);

        var elegiveis = todos
            .Where(p => !p.AgendaBloqueada)
            .OrderBy(p => p.Nome)
            .Select(p => new ProfessorElegivelDto
            {
                Id = p.Id,
                Nome = p.Nome,
                Idiomas = p.Idiomas,
                QuantidadeAulasNaSemana = p.AulasMarcadas.Count,
                HorariosDisponiveis = p.Disponibilidade
                    .Select(d => d.Inicio.ToString("HH:mm"))
                    .Distinct()
                    .OrderBy(h => h)
                    .ToList(),
                Disponibilidade = p.Disponibilidade.Select(d => new DisponibilidadeItemDto
                {
                    Dia = d.Dia,
                    Inicio = d.Inicio.ToString("HH:mm"),
                    Fim = d.Fim.ToString("HH:mm")
                }).ToList(),
                AulasMarcadas = p.AulasMarcadas.Select(a => new AulaMarcadaItemDto
                {
                    Dia = a.Dia,
                    Inicio = a.Inicio.ToString("HH:mm"),
                    DuracaoMinutos = a.DuracaoMinutos
                }).ToList()
            })
            .ToList();

        var naoElegiveis = todos
            .Where(p => p.AgendaBloqueada)
            .OrderBy(p => p.Nome)
            .Select(p => new ProfessorInelegivelDto
            {
                Id = p.Id,
                Nome = p.Nome,
                Idiomas = p.Idiomas,
                Motivo = MotivosInelegibilidade.AgendaBloqueada
            })
            .ToList();

        return new BuscaProfessoresResponse(elegiveis, naoElegiveis);
    }
}
