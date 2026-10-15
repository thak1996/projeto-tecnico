using System.Globalization;
using System.Text;
using Technical.Domain.Constants;
using Technical.Domain.Entities;
using Technical.Domain.Models;
using Technical.Domain.ValueObjects;

namespace Technical.Domain.Services;

public class ProfessorMatcher
{
    public ResultadoAvaliacaoBusca Avaliar(IEnumerable<Professor> professores, CriterioBusca criterio)
    {
        var elegiveis = new List<ProfessorElegivelResultado>();
        var naoElegiveis = new List<ProfessorInelegivelResultado>();
        var diasNormalizados = criterio.Dias.Select(NormalizarTexto).ToHashSet();

        foreach (var professor in professores)
        {
            // Precedência 1: Não ensina o idioma
            if (!EnsinaIdioma(professor, criterio.Idioma))
            {
                naoElegiveis.Add(new ProfessorInelegivelResultado(professor, MotivosInelegibilidade.NaoEnsinaIdioma));
                continue;
            }

            // Precedência 2: Agenda bloqueada
            if (professor.AgendaBloqueada)
            {
                naoElegiveis.Add(new ProfessorInelegivelResultado(professor, MotivosInelegibilidade.AgendaBloqueada));
                continue;
            }

            // Precedência 3: Sem horário em comum nos dias pedidos
            var horariosEmComum = ObterHorariosEmComum(professor, criterio);
            if (horariosEmComum.Count == 0)
            {
                naoElegiveis.Add(new ProfessorInelegivelResultado(professor, MotivosInelegibilidade.SemHorarioEmComum));
                continue;
            }

            // Elegível: total de aulas marcadas do professor em toda a semana
            var quantidadeAulas = professor.AulasMarcadas.Count;

            elegiveis.Add(new ProfessorElegivelResultado(
                professor,
                quantidadeAulas,
                horariosEmComum.Select(t => t.ToString("HH:mm")).ToList()
            ));
        }

        var elegiveisOrdenados = elegiveis
            .OrderBy(e => e.QuantidadeAulasNaSemana)
            .ThenBy(e => e.Professor.Nome, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return new ResultadoAvaliacaoBusca(elegiveisOrdenados, naoElegiveis);
    }

    private static bool EnsinaIdioma(Professor professor, string idiomaBuscado)
    {
        var idiomaNormalizado = NormalizarTexto(idiomaBuscado);
        return professor.Idiomas.Any(i => NormalizarTexto(i) == idiomaNormalizado);
    }

    private static List<TimeOnly> ObterHorariosEmComum(Professor professor, CriterioBusca criterio)
    {
        if (criterio.Dias.Count == 0)
        {
            return new List<TimeOnly>();
        }

        HashSet<TimeOnly>? intersecaoHorarios = null;

        foreach (var dia in criterio.Dias)
        {
            var diaNormalizado = NormalizarTexto(dia);
            var disponibilidades = professor.Disponibilidade
                .Where(d => NormalizarTexto(d.Dia) == diaNormalizado)
                .ToList();

            var aulasMarcadas = professor.AulasMarcadas
                .Where(a => NormalizarTexto(a.Dia) == diaNormalizado)
                .ToList();

            var slotsDoDia = ObterSlotsValidosDoDia(
                disponibilidades,
                aulasMarcadas,
                criterio.InicioFaixa,
                criterio.FimFaixa,
                criterio.DuracaoMinutos
            );

            if (intersecaoHorarios == null)
            {
                intersecaoHorarios = new HashSet<TimeOnly>(slotsDoDia);
            }
            else
            {
                intersecaoHorarios.IntersectWith(slotsDoDia);
            }

            // Se em algum dia a interseção já for vazia, não haverá horário em comum
            if (intersecaoHorarios.Count == 0)
            {
                return new List<TimeOnly>();
            }
        }

        return (intersecaoHorarios?.OrderBy(t => t).ToList()) ?? new List<TimeOnly>();
    }

    private static List<TimeOnly> ObterSlotsValidosDoDia(
        List<Disponibilidade> disponibilidades,
        List<AulaMarcada> aulasMarcadas,
        TimeOnly inicioFaixa,
        TimeOnly fimFaixa,
        int duracaoMinutos)
    {
        var slotsValidos = new List<TimeOnly>();
        if (disponibilidades.Count == 0)
        {
            return slotsValidos;
        }

        // Gera candidatos de 30 em 30 minutos terminados em :00 ou :30 dentro de [inicioFaixa, fimFaixa]
        var slotAtual = ArredondarParaProximoSlot30Min(inicioFaixa);

        while (true)
        {
            // Verifica se o slot atual mais a duração ultrapassa o fim da faixa
            if (!CabeNaJanela(slotAtual, duracaoMinutos, fimFaixa))
            {
                break;
            }

            var inicioSlot = slotAtual;
            var fimSlot = inicioSlot.AddMinutes(duracaoMinutos);

            // 1. Deve estar inteiramente dentro de pelo menos uma disponibilidade
            var cabeEmDisponibilidade = disponibilidades.Any(d =>
                d.Inicio <= inicioSlot && fimSlot <= d.Fim);

            if (cabeEmDisponibilidade)
            {
                // 2. Não pode sobrepor com nenhuma aula marcada
                // Intervalos [inicioSlot, fimSlot) e [aula.Inicio, aula.Fim) sobrepõem se Max(inicioSlot, aula.Inicio) < Min(fimSlot, aula.Fim)
                var sobrepoeAula = aulasMarcadas.Any(aula =>
                {
                    var aulaInicio = aula.Inicio;
                    var aulaFim = aula.Fim;
                    return inicioSlot < aulaFim && aulaInicio < fimSlot;
                });

                if (!sobrepoeAula)
                {
                    slotsValidos.Add(inicioSlot);
                }
            }

            // Avança para o próximo intervalo de 30 minutos
            if (slotAtual >= new TimeOnly(23, 30))
            {
                break;
            }

            slotAtual = slotAtual.AddMinutes(30);
        }

        return slotsValidos;
    }

    private static TimeOnly ArredondarParaProximoSlot30Min(TimeOnly time)
    {
        if (time.Minute == 0 || time.Minute == 30)
        {
            return time;
        }

        if (time.Minute < 30)
        {
            return new TimeOnly(time.Hour, 30);
        }

        if (time.Hour == 23)
        {
            return new TimeOnly(23, 30);
        }

        return new TimeOnly(time.Hour + 1, 0);
    }

    private static bool CabeNaJanela(TimeOnly inicioSlot, int duracaoMinutos, TimeOnly fimFaixa)
    {
        // Se a adição passar da meia-noite, não cabe
        var minutosAteMeiaNoite = (24 * 60) - (inicioSlot.Hour * 60 + inicioSlot.Minute);
        if (duracaoMinutos > minutosAteMeiaNoite)
        {
            return false;
        }

        var fimSlot = inicioSlot.AddMinutes(duracaoMinutos);
        return fimSlot <= fimFaixa && fimSlot >= inicioSlot;
    }

    private static string NormalizarTexto(string texto)
    {
        if (string.IsNullOrWhiteSpace(texto))
        {
            return string.Empty;
        }

        var normalizedString = texto.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder(normalizedString.Length);

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
    }
}
