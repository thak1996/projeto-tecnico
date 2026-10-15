using Technical.Application.Interfaces;
using Technical.Application.UseCases;
using Technical.Domain.Services;
using Technical.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRouting(options => options.LowercaseUrls = true);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Encontre um Professor API",
        Version = "v1",
        Description = "API REST para busca e consulta de professores de idiomas com base em disponibilidade semanal, regras de agendamento e critérios de elegibilidade."
    });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

builder.Services.AddSingleton<IProfessorRepository, JsonProfessorRepository>();
builder.Services.AddSingleton<ProfessorMatcher>();
builder.Services.AddScoped<IBuscarProfessoresUseCase, BuscarProfessoresUseCase>();
builder.Services.AddScoped<IObterTodosProfessoresUseCase, ObterTodosProfessoresUseCase>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Encontre um Professor API v1");
    });
}

app.UseAuthorization();

app.MapControllers();

app.Run();