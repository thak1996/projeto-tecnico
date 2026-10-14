# Encontre um Professor

Aplicação Full Stack para pesquisa de professores de idiomas, considerando disponibilidade semanal, horários e organização de agenda.

O projeto integra uma interface web com uma API REST, mantendo a lógica de negócio separada da comunicação HTTP e priorizando organização, testabilidade e facilidade de manutenção.

## Tecnologias

### Front-end
- React
- TypeScript
- Vite
- Tailwind CSS 4
- shadcn/ui
- Lucide React

### Back-end
- C#
- .NET 8
- ASP.NET Core Web API

### Infraestrutura
- Docker
- Docker Compose
- PostgreSQL configurado no ambiente de desenvolvimento

## Arquitetura

O projeto é organizado em camadas para separar as responsabilidades e reduzir o acoplamento entre os componentes.

```text
projeto-tecnico/
├── backend/
│   ├── src/
│   │   ├── Technical.Api/
│   │   ├── Technical.Application/
│   │   ├── Technical.Domain/
│   │   └── Technical.Infrastructure/
│   └── tests/
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       │   └── ui/
│       ├── features/
│       ├── lib/
│       ├── services/
│       └── styles/
├── docker-compose.yml
├── README.md
└── USO_DE_IA.md
```

A estrutura acima representa a organização planejada e deve ser mantida alinhada aos diretórios existentes no repositório.

### Back-end

| Camada | Responsabilidade |
|---|---|
| `Technical.Api` | Endpoints, configuração HTTP e composição da aplicação |
| `Technical.Application` | Casos de uso e orquestração das operações |
| `Technical.Domain` | Entidades e regras de negócio |
| `Technical.Infrastructure` | Acesso a dados e implementações técnicas |

### Front-end

- `app/`: composição e inicialização da aplicação.
- `components/ui/`: componentes visuais reutilizáveis.
- `features/`: funcionalidades organizadas por domínio.
- `lib/`: funções utilitárias compartilhadas.
- `services/`: comunicação com a API.
- `styles/`: estilos globais.

## Funcionalidades

A aplicação é voltada à consulta de professores com base em critérios de busca, permitindo:

- Selecionar um idioma.
- Informar um ou mais dias da semana.
- Definir uma faixa de horário.
- Selecionar a duração da aula.
- Consultar professores disponíveis.
- Visualizar os horários possíveis e a quantidade de aulas na semana.
- Identificar professores não disponíveis e os respectivos motivos.

A interface deve fornecer feedback durante o carregamento, apresentar resultados vazios e tratar erros de comunicação e validação.

## Regras de negócio

A lógica de busca considera:

- Idiomas ensinados pelo professor.
- Situação da agenda.
- Disponibilidade em todos os dias selecionados.
- Compatibilidade entre a duração da aula e os intervalos disponíveis.
- Conflitos com aulas existentes.
- Horários de início em intervalos de meia hora.
- Ordenação dos resultados por quantidade de aulas e nome.

Os motivos de indisponibilidade são centralizados na lógica de negócio para manter o comportamento consistente entre as diferentes camadas.

## Pré-requisitos

Para executar o ambiente completo:

- Docker Desktop ou Docker Engine.
- Docker Compose.
- Git.

Para executar os projetos individualmente:

- SDK do .NET 8.
- Node.js em versão compatível com as dependências do front-end.
- Gerenciador de pacotes utilizado pelo projeto.

## Como executar

### 1. Clonar o repositório

```bash
git clone <https://github.com/thak1996/projeto-tecnico>
cd projeto-tecnico
```

### 2. Iniciar a aplicação

Na raiz do projeto, execute:

```bash
docker compose up --build -d
```

### 3. Verificar os serviços

```bash
docker compose ps
```

Para acompanhar os logs:

```bash
docker compose logs -f
```

Para consultar os logs individualmente:

```bash
docker compose logs -f api
docker compose logs -f frontend
```

Os nomes dos serviços devem corresponder aos definidos no arquivo `docker-compose.yml`.

### 4. Encerrar a aplicação

```bash
docker compose down
```

Esse comando encerra os serviços e remove os containers, preservando os volumes nomeados por padrão.

Para remover também os volumes:

```bash
docker compose down -v
```

Esse último comando pode apagar dados persistidos. Utilize-o somente quando isso for intencional.

## API REST

A API disponibiliza operações HTTP para realizar consultas de disponibilidade de professores.

### Endpoint Health Check

```http
GET /api/health
```

### Endpoint de busca

```http
POST /api/professores/busca
Content-Type: application/json
```

Exemplo de requisição:

```json
{
  "idioma": "Espanhol",
  "dias": ["segunda"],
  "inicioFaixa": "18:00",
  "fimFaixa": "20:00",
  "duracaoMinutos": 60
}
```

A resposta contém a relação de professores disponíveis, seus horários possíveis e informações sobre professores que não atendem aos critérios informados.

### Verificação de saúde

A aplicação pode disponibilizar um endpoint de health check para verificar se a API está respondendo.

A rota e a porta efetivamente utilizadas devem ser consultadas na configuração atual do back-end e do Docker Compose.

## Dados

Os dados dos professores são carregados de um arquivo JSON e podem permanecer em memória durante a execução da aplicação.

A camada de infraestrutura é responsável pelo carregamento dos dados, enquanto as regras de negócio permanecem independentes da origem dessas informações.

## Testes automatizados

Os testes de back-end verificam o comportamento das regras de negócio sem depender da inicialização do servidor HTTP.

Para executar os testes:

```bash
dotnet test
```

Execute o comando na raiz da solução ou informe o caminho do arquivo `.sln` ou do projeto de testes, conforme a estrutura do repositório.

## Decisões de arquitetura

- **Separação de responsabilidades:** cada camada possui uma função definida.
- **Baixo acoplamento:** as regras de negócio não dependem diretamente de detalhes de HTTP ou da interface.
- **Testabilidade:** os casos de uso e as regras podem ser verificados isoladamente.
- **Simplicidade:** a estrutura evita dependências desnecessárias para funcionalidades que podem ser resolvidas em memória.
- **Componentização:** a interface utiliza componentes reutilizáveis e organização por funcionalidades.
- **Execução reproduzível:** Docker Compose centraliza a inicialização dos serviços de desenvolvimento.

## Limitações conhecidas

As limitações devem ser atualizadas conforme a implementação evoluir. Registre aqui funcionalidades ainda não concluídas, dependências externas, restrições de execução e decisões relevantes sobre comportamentos não definidos.

## Uso de inteligência artificial

As ferramentas de inteligência artificial utilizadas no desenvolvimento, suas aplicações e os casos em que resultados precisaram ser revisados estão documentados em [`USO_DE_IA.md`](USO_DE_IA.md).