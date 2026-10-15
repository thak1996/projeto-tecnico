using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Technical.Infrastructure.Converters;

public class TimeOnlyJsonConverter : JsonConverter<TimeOnly>
{
    private static readonly string[] Formats = { "HH:mm", "HH:mm:ss", "H:mm", "H:mm:ss" };

    public override TimeOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        if (string.IsNullOrWhiteSpace(value))
        {
            return default;
        }

        if (TimeOnly.TryParseExact(value, Formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var time))
        {
            return time;
        }

        if (TimeOnly.TryParse(value, CultureInfo.InvariantCulture, out time))
        {
            return time;
        }

        throw new JsonException($"Formato de horário inválido: '{value}'. Formatos aceitos: HH:mm ou HH:mm:ss.");
    }

    public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("HH:mm", CultureInfo.InvariantCulture));
    }
}
