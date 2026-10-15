using Technical.Application.DTOs;
using Technical.Application.Interfaces;
using Technical.Domain.Services;
using Technical.Domain.ValueObjects;

namespace Technical.Application.UseCases;

public class BuscarProfessoresUseCase : IBuscarProfessoresUseCase
{
    private readonly IProfessorRepository _repository;
    private readonly ProfessorMatcher _matcher;

    public BuscarProfessoresUseCase(IProfessorRepository repository, ProfessorMatcher? matcher = null)
    {
        _repository = repository;
        _matcher = matcher ?? new ProfessorMatcher();
    }

    public async Task<BuscaProfessoresResponse> ExecutarAsync(BuscaProfessoresRequest request, CancellationToken cancellationToken = default)
    {
        if (!TimeOnly.TryParse(request.InicioFaixa, out var inicioFaixa))
        {
            throw new ArgumentException("Horário de início da faixa inválido.", nameof(request.InicioFaixa));
        }

        if (!TimeOnly.TryParse(request.FimFaixa, out var fimFaixa))
        {
            throw new ArgumentException("Horário de término da faixa inválido.", nameof(request.FimFaixa));
        }

        var criterio = new CriterioBusca(
            request.Idioma,
            request.Dias,
            inicioFaixa,
            fimFaixa,
            request.DuracaoMinutos
        );

        var todosProfessores = await _repository.ObterTodosAsync(cancellationToken);
        var resultadoAvaliacao = _matcher.Avaliar(todosProfessores, criterio);

        var elegiveisDto = resultadoAvaliacao.Elegiveis
            .Select(e => new ProfessorElegivelDto
            {
                Id = e.Professor.Id,
                Nome = e.Professor.Nome,
                Idiomas = e.Professor.Idiomas,
                QuantidadeAulasNaSemana = e.QuantidadeAulasNaSemana,
                HorariosDisponiveis = e.HorariosDisponiveis,
                Disponibilidade = e.Professor.Disponibilidade.Select(d => new DisponibilidadeItemDto
                {
                    Dia = d.Dia,
                    Inicio = d.Inicio.ToString("HH:mm"),
                    Fim = d.Fim.ToString("HH:mm")
                }).ToList(),
                AulasMarcadas = e.Professor.AulasMarcadas.Select(a => new AulaMarcadaItemDto
                {
                    Dia = a.Dia,
                    Inicio = a.Inicio.ToString("HH:mm"),
                    DuracaoMinutos = a.DuracaoMinutos
                }).ToList()
            })
            .ToList();

        var naoElegiveisDto = resultadoAvaliacao.NaoElegiveis
            .Select(ne => new ProfessorInelegivelDto
            {
                Id = ne.Professor.Id,
                Nome = ne.Professor.Nome,
                Idiomas = ne.Professor.Idiomas,
                Motivo = ne.Motivo
            })
            .ToList();

        return new BuscaProfessoresResponse(elegiveisDto, naoElegiveisDto);
    }
}
