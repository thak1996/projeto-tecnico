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
- Docker Compose (`docker-compose.yaml`)
- PostgreSQL disponível no ambiente de desenvolvimento (serviço de banco configurado no scaffold Docker do projeto)

## Arquitetura

O projeto é organizado em camadas para separar as responsabilidades e reduzir o acoplamento entre os componentes.

```text
projeto-tecnico/
├── backend/
│   ├── data/
│   │   └── professores.json
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
│       │   └── professores/
│       └── styles/
├── docker-compose.yaml
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
git clone https://github.com/thak1996/projeto-tecnico
cd projeto-tecnico
```

### 2. Configurar as variáveis de ambiente

Crie o arquivo `.env` a partir do modelo `.env.example` para que as variáveis do Docker Compose e do PostgreSQL sejam carregadas adequadamente:

```bash
cp .env.example .env
```

### 3. Iniciar a aplicação

Na raiz do projeto, execute:

```bash
docker compose up --build -d
```

### 4. Verificar os serviços

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

Os nomes dos serviços devem corresponder aos definidos no arquivo `docker-compose.yaml`.

### 5. Encerrar a aplicação

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

A API disponibiliza operações HTTP para realizar consultas de disponibilidade de professores e catálogo geral.

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

### Endpoint de Catálogo Geral de Professores

```http
GET /api/professores
```

Retorna todos os professores cadastrados e suas disponibilidades semanais completas, divididos entre professores ativos (elegíveis, ordenados alfabeticamente) e indisponíveis com agenda bloqueada (no caso Carla). Utilizado pelo botão "Limpar Busca" na interface web.

## Dados e Persistência

Os dados dos professores são carregados a partir do arquivo JSON localizado em `backend/data/professores.json` e permanecem em memória durante a execução da aplicação, atendendo diretamente à especificação do desafio técnico.

A camada de infraestrutura (`JsonProfessorRepository`) é responsável pela leitura, desserialização com suporte a horários flexíveis (`TimeOnlyJsonConverter`) e injeção assíncrona, enquanto as regras de negócio de elegibilidade (`ProfessorMatcher`) permanecem desacopladas e puras na camada de domínio. O container do PostgreSQL (`db`) fornecido no `docker-compose.yaml` faz parte da infraestrutura de scaffold do projeto e opera de forma isolada, não sendo acoplado à consulta de professores.

## Testes automatizados

O projeto conta com **65 testes automatizados** (28 no front-end com Vitest e 37 no back-end com xUnit) aprovados com 100% de sucesso, cobrindo regras de negócio, contratos de API literais e legados, validações estritas de formato, precedência de motivos e usabilidade da interface.

### Testes de Back-end (C# / xUnit)

Os testes de back-end verificam a elegibilidade, precedência de motivos, aulas consecutivas, horários em comum e ordenação sem depender de banco de dados ou servidor HTTP:

```bash
cd backend
dotnet test
```

### Testes de Front-end (React / TypeScript / Vitest)

Os testes de front-end verificam a validação de formulário, formatação de requisições, renderização de cards, estados visuais (loading, empty state, erro), responsividade mobile e isolamento do serviço de API:

```bash
cd frontend
npm test
```

## Premissas e Decisões sobre Casos Não Cobertos

Em conformidade com a instrução do desafio técnico de registrar formalmente as decisões tomadas sobre situações não cobertas ou com margem a interpretação, foram estabelecidas as seguintes definições de modelagem:

1. **Horário de Início Compartilhado entre Múltiplos Dias**:
   - *Cenário*: O aluno seleciona mais de um dia da semana (ex: segunda e quarta-feira).
   - *Decisão*: A aula deve iniciar no mesmo horário em todos os dias solicitados (ex: 18:00 em ambos os dias). A busca retorna os slots de início temporalmente coincidentes nos dias escolhidos, evitando agendas fragmentadas em horários discrepantes.
2. **Validação Defensiva de Amplitude Mínima da Faixa Horária**:
   - *Cenário*: O intervalo entre o início e o término da faixa selecionada é inferior à duração da aula (ex: faixa das 18:00 às 18:30 para uma aula de 60 minutos).
   - *Decisão*: A API rejeita a requisição defensivamente com HTTP 400 (Bad Request), apontando no campo `faixa` que o intervalo deve comportar ao menos a duração informada, prevenindo buscas matematicamente impossíveis.
3. **Alinhamento a Slots Regulares de 30 Minutos (`:00` ou `:30`)**:
   - *Cenário*: O professor possui janelas de disponibilidade ou aulas terminando em minutos quebrados (ex: disponibilidade iniciando às 18:15).
   - *Decisão*: Os slots candidatos a início de aula são gerados exclusivamente em múltiplos de 30 minutos (terminados em `:00` ou `:30`), desde que o intervalo completo `[início, início + duração]` caiba integralmente dentro da disponibilidade e sem sobreposição de aulas marcadas.
4. **Semântica de Intervalos Semiabertos `[início, fim)` para Aulas Consecutivas**:
   - *Cenário*: Uma aula agendada termina exatamente no horário em que um slot candidato se inicia.
   - *Decisão*: Como a sobreposição requer `slot.Inicio < aula.Fim && slot.Fim > aula.Inicio`, quando `aula.Fim == slot.Inicio` a colisão é estritamente falsa, permitindo o agendamento de aulas consecutivas sem intervalo ocioso forçado.
5. **Contagem e Ordenação pelo Total Semanal Integral**:
   - *Cenário*: O enunciado requer ordenar professores elegíveis pelo menor número de aulas marcadas na semana e desempate por nome alfabético.
   - *Decisão*: O cômputo utiliza o total integral de aulas marcadas do professor na semana inteira (`professor.AulasMarcadas.Count`), e não apenas nos dias filtrados na busca, garantindo que a métrica de ocupação semanal do professor seja fidedigna ao enunciado.
6. **Validação Estrita de Formato de Horário `HH:mm`**:
   - *Cenário*: Requisições enviadas com segundos (ex: `"18:00:00"`), horários sem zero à esquerda (ex: `"8:00"`) ou valores textuais inválidos.
   - *Decisão*: A API adota `TimeOnly.TryParseExact(..., "HH:mm", ...)`, exigindo exatamente 2 dígitos para hora (00–23), dois-pontos e 2 dígitos para minuto (00–59), rejeitando qualquer variação com HTTP 400.

## Decisões de arquitetura

- **Separação de responsabilidades:** cada camada possui uma função definida.
- **Baixo acoplamento:** as regras de negócio não dependem diretamente de detalhes de HTTP ou da interface.
- **Testabilidade:** os casos de uso e as regras podem ser verificados isoladamente.
- **Simplicidade:** a estrutura evita dependências desnecessárias para funcionalidades que podem ser resolvidas em memória.
- **Componentização:** a interface utiliza componentes reutilizáveis e organização por funcionalidades.
- **Execução reproduzível:** Docker Compose centraliza a inicialização dos serviços de desenvolvimento.

## Limitações conhecidas

Todos os requisitos funcionais e não-funcionais estabelecidos no enunciado do desafio técnico foram integralmente implementados e validados por suítes de testes automatizados. O projeto opera com as seguintes premissas e características de escopo:

- **Conformidade de Escopo**: Todos os critérios de busca (idioma, múltiplos dias, faixa horária, duração), regras de negócio (inícios em `:00`/`:30`, intervalos semiabertos de aulas consecutivas, precedência estrita dos 3 motivos canônicos de inelegibilidade, ordenação por menor número total de aulas marcadas na semana com desempate alfabético), validação defensiva de amplitude mínima, testes automatizados e responsividade mobile foram plenamente atendidos, sem pendências funcionais.
- **Persistência em Memória (Catálogo Estático)**: Conforme especificado na Constituição do projeto e no enunciado do desafio, o catálogo de professores é alimentado exclusivamente a partir do arquivo JSON estático (`backend/data/professores.json`). Não há persistência de gravação nem operações de cadastro/mutação de dados em banco relacional, uma vez que o desafio se restringe à consulta e cálculo de elegibilidade. O serviço PostgreSQL presente no Compose é mantido exclusivamente como scaffolding de infraestrutura.
- **Abstração de Grade Recorrente Semanal**: O modelo de disponibilidade e agendamento baseia-se nos dias da semana (`segunda` a `domingo`). O sistema não processa datas gregorianas de calendário civil nem controle de feriados ou exceções pontuais, refletindo diretamente o domínio proposto pelo desafio.
- **Execução Local Fora de Containers**: Para executar o projeto fora do Docker Compose, o ambiente hospedeiro requer a instalação prévia do SDK do .NET 8 (ou superior com roll forward configurado) e do Node.js 20+ (com npm).

## Uso de inteligência artificial

As ferramentas de inteligência artificial utilizadas no desenvolvimento, suas aplicações e os casos em que resultados precisaram ser revisados estão documentados em [`USO_DE_IA.md`](USO_DE_IA.md).