using Technical.Application.DTOs;

namespace Technical.Application.Validators;

public static class BuscaProfessoresRequestValidator
{
    private static readonly HashSet<string> DiasValidos = new(StringComparer.OrdinalIgnoreCase)
    {
        "segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"
    };

    public static Dictionary<string, string[]> Validar(BuscaProfessoresRequest? request)
    {
        var errors = new Dictionary<string, string[]>();

        if (request == null)
        {
            errors["request"] = new[] { "O corpo da requisição não pode ser nulo." };
            return errors;
        }

        if (string.IsNullOrWhiteSpace(request.Idioma))
        {
            errors["idioma"] = new[] { "O idioma é obrigatório." };
        }

        if (request.Dias == null || request.Dias.Count == 0)
        {
            errors["dias"] = new[] { "É necessário selecionar ao menos um dia da semana." };
        }
        else
        {
            var diasInvalidos = request.Dias.Where(d => !DiasValidos.Contains(d)).ToList();
            if (diasInvalidos.Count > 0)
            {
                errors["dias"] = new[] { $"Dias da semana inválidos: {string.Join(", ", diasInvalidos)}" };
            }
        }

        var inicioValido = TimeOnly.TryParse(request.InicioFaixa, out var inicio);
        if (!inicioValido)
        {
            errors["inicioFaixa"] = new[] { "Horário de início da faixa deve estar no formato HH:mm válido." };
        }

        var fimValido = TimeOnly.TryParse(request.FimFaixa, out var fim);
        if (!fimValido)
        {
            errors["fimFaixa"] = new[] { "Horário de término da faixa deve estar no formato HH:mm válido." };
        }

        if (request.DuracaoMinutos is not (30 or 60 or 90))
        {
            errors["duracaoMinutos"] = new[] { "A duração da aula deve ser 30, 60 ou 90 minutos." };
        }

        if (errors.Count == 0 && inicioValido && fimValido)
        {
            if (fim <= inicio)
            {
                errors["fimFaixa"] = new[] { "O horário de término da faixa deve ser estritamente posterior ao horário de início." };
            }
            else
            {
                var amplitudeMinutos = (fim.Hour * 60 + fim.Minute) - (inicio.Hour * 60 + inicio.Minute);
                if (amplitudeMinutos < request.DuracaoMinutos)
                {
                    errors["faixa"] = new[] { "A faixa de horário selecionada deve comportar ao menos a duração da aula informada." };
                }
            }
        }

        return errors;
    }
}
