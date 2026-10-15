namespace Technical.Domain.Entities;

public class AulaMarcada
{
    public string Dia { get; set; } = string.Empty;
    public TimeOnly Inicio { get; set; }
    public int DuracaoMinutos { get; set; }

    public TimeOnly Fim => Inicio.AddMinutes(DuracaoMinutos);

    public AulaMarcada() { }

    public AulaMarcada(string dia, TimeOnly inicio, int duracaoMinutos)
    {
        Dia = dia;
        Inicio = inicio;
        DuracaoMinutos = duracaoMinutos;
    }
}
