using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Technical.Application.Interfaces;
using Technical.Domain.Entities;

namespace Technical.Infrastructure.Repositories;

public class JsonProfessorRepository : IProfessorRepository
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<JsonProfessorRepository> _logger;
    private IReadOnlyList<Professor>? _cachedProfessores;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public JsonProfessorRepository(IConfiguration configuration, ILogger<JsonProfessorRepository> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<IReadOnlyList<Professor>> ObterTodosAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedProfessores != null)
        {
            return _cachedProfessores;
        }

        await _lock.WaitAsync(cancellationToken);
        try
        {
            if (_cachedProfessores != null)
            {
                return _cachedProfessores;
            }

            var filePath = ResolveFilePath();
            if (string.IsNullOrEmpty(filePath) || !File.Exists(filePath))
            {
                _logger.LogError("Arquivo de professores não encontrado nos caminhos pesquisados.");
                throw new FileNotFoundException("Arquivo de dados professores.json não foi encontrado.", filePath);
            }

            _logger.LogInformation("Carregando professores a partir de: {FilePath}", filePath);
            await using var stream = File.OpenRead(filePath);
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new Converters.TimeOnlyJsonConverter() }
            };

            var data = await JsonSerializer.DeserializeAsync<ProfessoresCatalog>(stream, options, cancellationToken);
            _cachedProfessores = (IReadOnlyList<Professor>?)data?.Professores ?? Array.Empty<Professor>();
            _logger.LogInformation("Carregados {Count} professores com sucesso.", _cachedProfessores.Count);

            return _cachedProfessores;
        }
        finally
        {
            _lock.Release();
        }
    }

    private string? ResolveFilePath()
    {
        var configuredPath = _configuration["ProfessoresJsonPath"];
        if (!string.IsNullOrWhiteSpace(configuredPath) && File.Exists(configuredPath))
        {
            return configuredPath;
        }

        var candidatePaths = new[]
        {
            Path.Combine(AppContext.BaseDirectory, "Data", "professores.json"),
            Path.Combine(AppContext.BaseDirectory, "data", "professores.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "data", "professores.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "..", "data", "professores.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "data", "professores.json"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "data", "professores.json"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "data", "professores.json"),
            "/data/professores.json",
            "data/professores.json"
        };

        foreach (var candidate in candidatePaths)
        {
            try
            {
                var full = Path.GetFullPath(candidate);
                if (File.Exists(full))
                {
                    return full;
                }
            }
            catch
            {
                // Ignora caminhos inválidos
            }
        }

        return null;
    }

    private class ProfessoresCatalog
    {
        public List<Professor> Professores { get; set; } = new();
    }
}
