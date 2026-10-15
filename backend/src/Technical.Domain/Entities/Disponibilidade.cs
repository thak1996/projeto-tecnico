namespace Technical.Domain.Entities;

public class Disponibilidade
{
    public string Dia { get; set; } = string.Empty;
    public TimeOnly Inicio { get; set; }
    public TimeOnly Fim { get; set; }

    public Disponibilidade() { }

    public Disponibilidade(string dia, TimeOnly inicio, TimeOnly fim)
    {
        Dia = dia;
        Inicio = inicio;
        Fim = fim;
    }
}
