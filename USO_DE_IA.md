# Registro de Uso de Inteligência Artificial

Este documento registra a utilização de ferramentas de inteligência artificial no desenvolvimento da aplicação **Encontre um Professor**, em conformidade com as diretrizes de governança estabelecidas na [Constituição do Projeto](.specify/memory/constitution.md).

---

## 1. Ferramentas e Metodologia

- **Ambiente de Desenvolvimento**: Google Antigravity Agentic Assistant.
- **Framework de Engenharia de Requisitos**: Spec Kit (Spec-Driven Development), abrangendo especificação funcional, planejamento arquitetural, quebra de tarefas e implementação orientada a testes (TDD).

---

## 2. Aplicações por Fase de Desenvolvimento

### 2.1. Análise Inicial e Especificação Funcional (`/speckit-specify`)
- **Análise do Catálogo e Ambiguidades**:
  A IA foi utilizada para inspecionar os arquivos pré-existentes, em especial `data/professores.json`, identificando casos de teste reais embutidos nos dados dos professores:
  - O caso do professor **Heitor (id: 8)**, que possui janelas livres em dias diferentes sem sobreposição temporal no mesmo horário, elucidando a ambiguidade da expressão *"Sem horário em comum nos dias pedidos"*.
  - O caso do professor **Fábio (id: 6)** com disponibilidade quebrada às 18:15, exigindo alinhamento estrito a `:00` ou `:30`.
- **Tratamento de Ambiguidades e Premissas de Modelagem da IA**:
  Durante a especificação inicial, a IA formulou 3 premissas de engenharia para resolver ambiguidades do enunciado:
  1. *Slot de Início Compartilhado*: Exigência de que o horário de início da aula seja idêntico em todos os dias solicitados (ex: se o aluno busca segunda e quarta, o início deve ser às 18:00 em ambos os dias).
  2. *Lista de Horários em Comum*: Retorno estruturado de todos os slots de início viáveis (`["18:00", "20:00"]`).
  3. *Validação Defensiva Adicional de Amplitude*: Rejeição com HTTP 400 (Bad Request) caso o intervalo da faixa horária seja estritamente menor que a duração da aula solicitada (ex: faixa das 18:00 às 18:30 para aula de 60 min). Cabe destacar que esta consiste em uma **validação defensiva adicional** introduzida pela IA para evitar buscas geometricamente impossíveis, não sendo expressamente exigida pelo enunciado original.

### 2.2. Planejamento Arquitetural e Governança (`/speckit-plan`)
- **Adoção de Clean Architecture**:
  Separação das responsabilidades em 4 camadas no backend:
  - `Technical.Domain`: Entidades, Value Objects e regras puras de cálculo de intervalos livres e precedência (`ProfessorMatcher`).
  - `Technical.Application`: Casos de uso (`BuscarProfessoresUseCase`), DTOs e validações.
  - `Technical.Infrastructure`: Repositório em memória (`JsonProfessorRepository`) com resolução de caminhos locais e Docker.
  - `Technical.Api`: Controller REST expondo `POST /api/professores/busca` e documentação OpenAPI/Swagger.
- **Revisão da Constituição v1.1.0**:
  Quando a Constituição foi emendada para exigir testes unitários automatizados também no front-end, o plano foi atualizado para introduzir o **Vitest** integrado ao Vite 8 e Testing Library.

### 2.3. Execução das Tarefas e Implementação (`/speckit-implement`)
- **Implementação Orientada a Testes (TDD)**:
  - Desenvolvimento das suites de testes automatizados com xUnit no backend e Vitest com Testing Library no frontend.
  - Implementação de **65 testes automatizados** (28 no front-end e 37 no back-end), todos aprovados com 100% de sucesso, cobrindo cenários de elegibilidade, precedência dos 3 motivos oficiais, intervalos semiabertos de aulas consecutivas, desempate alfabético, validações estritas de formato, contratos literais da API e responsividade da interface. *(Nota: 65 testes com 100% de aprovação na execução, sem alegação de 100% de cobertura de código por métrica LCOV).*

---

## 3. Decisões Técnicas Revisadas e Ajustes Realizados

1. **Cálculo de Aulas Consecutivas**:
   - *Desafio*: Evitar colisões indevidas quando uma aula termina no momento exato em que a próxima se inicia.
   - *Solução revisada*: A modelagem de sobreposição baseada em intervalos semiabertos `[inicio, fim)` garantiu que se o término de uma aula marcada coincide com o início do slot candidato (`aula.Fim == slot.Inicio`), a sobreposição é estritamente falsa.
2. **Compatibilidade do .NET SDK**:
   - *Desafio*: O ambiente de execução do sistema host possuía o SDK do .NET 10, enquanto o projeto targetava `net8.0`.
   - *Solução revisada*: Adicionada a diretiva `<RollForward>LatestMajor</RollForward>` no projeto de testes para permitir execução local transparente e compilação em container .NET 8 no Docker.
3. **Prevenção de Efeitos Colaterais no React**:
   - *Desafio*: O linter de regras do React 19 sinalizou potencial render em cascata ao chamar `setState` síncrono no corpo do `useEffect`.
   - *Solução revisada*: O fluxo de inicialização foi refatorado em função assíncrona isolada com controle de montagem de componente (`isMounted`), eliminando avisos e assegurando conformidade com as boas práticas do React.
4. **Desserialização de Horários sem Segundos em System.Text.Json (.NET 8)**:
   - *Desafio*: O arquivo de dados `professores.json` armazena horários no formato `"HH:mm"` (sem segundos, ex: `"18:00"`), enquanto o conversor padrão de `TimeOnly` da BCL do .NET 8 requer segundos (`HH:mm:ss`), disparando exceção `FormatException` na leitura do repositório em runtime.
   - *Solução revisada*: Implementação do conversor customizado `TimeOnlyJsonConverter` suportando formatos `"HH:mm"`, `"HH:mm:ss"`, `"H:mm"` e `"H:mm:ss"`, integrado ao `JsonProfessorRepository` e permanentemente coberto por teste de integração em `JsonProfessorRepositoryTests.cs`.
5. **Desacoplamento de Configuração entre Vite Dev Server e Vitest**:
   - *Desafio*: A importação de `vitest/config` diretamente em `vite.config.ts` acoplava o servidor de desenvolvimento web aos binários do Vitest, gerando falha de inicialização em containers com volumes cacheados.
   - *Solução revisada*: Desacoplamento arquitetural criando `vitest.config.ts` específico para testes automatizados com `mergeConfig(viteConfig, ...)`, mantendo `vite.config.ts` leve, focado no bundling e proxy reverso.
6. **Refinamento Visual, Alinhamento Constitucional e Fluxo Vertical em 3 Passos**:
   - *Desafio*: Relato do usuário sobre truncamento de texto em badges (ex: `"0 aulas nos dias pedid..."` e `"Sem horário em comum nos..."`) decorrente da divisão de tela em colunas estreitas (`grid-cols-12`), acompanhado de questionamento se a introdução de um calendário por datas violaria a Constituição.
   - *Solução revisada*: Confirmou-se a salvaguarda da Constituição v1.1.0 (os dados em `professores.json` são recorrentes semanais de `segunda` a `domingo` e não possuem datas de calendário). O layout foi completamente reestruturado em um fluxo contínuo vertical ("página descendo") em 3 passos numerados de cima para baixo: Passo 1 (Filtros de Pesquisa em largura total), Passo 2 (Professores Elegíveis com cards amplos e Grade Semanal interativa com dias desativados, slots ocupados em vermelho e slots livres em verde selecionáveis), e Passo 3 (Professores Não Disponíveis com texto completo sem corte). Enriquecimento do `ProfessorElegivelDto` com as janelas de disponibilidade e aulas marcadas para renderização fiel dos horários.
7. **Limpar Busca e Catálogo Geral de Todos os Professores Disponíveis (User Story 4)**:
   - *Desafio*: Atender à necessidade do usuário de "limpar a busca e apresentar todos que estão disponíveis em todas as datas", mantendo a integridade estrita das regras de busca do desafio técnico original (`POST /api/professores/busca`).
   - *Solução revisada*: Criação do endpoint complementar `GET /api/professores` e do caso de uso `ObterTodosProfessoresUseCase` em Clean Architecture. O catálogo geral retorna todos os professores ativos (`agendaBloqueada == false`) como disponíveis em ordem alfabética com sua grade semanal completa de segunda a domingo, e os professores bloqueados (`agendaBloqueada == true`, no caso Carla) como indisponíveis com o motivo canônico `"Agenda bloqueada"`. No frontend, inclusão do botão "Limpar Busca" com ícone `RotateCcw`, redefinição reativa dos filtros do formulário e exibição de badge de catálogo geral permitindo explorar as grades em qualquer dia da semana de atendimento. Verificado com testes automatizados no backend (xUnit) e frontend (Vitest e Testing Library).
8. **Responsividade Mobile e Usabilidade Ergonômica (Feature 002)**:
   - *Desafio*: Na visualização em telas móveis e smartphones (como iPhone 16 com viewport de 393px de largura), os botões de ação ("Buscar Professores" e "Limpar Busca") disputavam largura horizontal e o botão de limpar ficava comprimido na borda direita, a grade semanal dos 7 dias em coluna única gerava rolagem vertical excessiva, o resumo de horário selecionado espremia o texto contra o badge de confirmação e havia avisos ou chamadas indesejadas de endpoints como health check previamente removidos pelo usuário.
   - *Solução revisada*: 
      1. Erradicação definitiva de qualquer menção, endpoint ou chamada de health check na aplicação (excluindo a rota `/api/health` no backend e métodos no frontend; a probe de container do PostgreSQL via `pg_isready` foi preservada no `docker-compose.yaml` estritamente para ordenação da subida dos serviços).
      2. Adoção de empilhamento vertical com largura total (`flex-col sm:flex-row w-full gap-3`) e altura mínima de toque de 44px (`min-h-[44px]`) nos botões de ação e seletores de dias e opções no mobile, conforme diretrizes de acessibilidade e ergonomia (WCAG 2.1 / Apple HIG).
      3. Reorganização da Grade Semanal em grid de 2 colunas no celular (`grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7`), cortando a altura de rolagem vertical pela metade, com compactação dos dias sem expediente (`py-2`).
      4. Caixa de resumo do "Horário Selecionado" flexibilizada para `flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5` com quebra automática `break-words`, evitando qualquer aperto de layout.
      5. Criação de testes automatizados dedicados à responsividade mobile (`BuscaProfessoresFormMobile.test.tsx`, `GradeSemanalMobile.test.tsx` e `CardsResponsividadeMobile.test.tsx`).
9. **Auditoria de Consistência, Remoção de Alemão e Limpeza de Código Morto (Feature 003)**:
   - *Desafio*: Identificação de inconsistências pontuais: presença de função residual `checkApiHealth` em `frontend/src/services/api.ts` e mocks legados em testes; rota `/api/health` ainda documentada no `README.md`; presença indevida de "Alemão" no formulário (enquanto o enunciado restringia a Inglês, Espanhol e Francês); menções a PostgreSQL sugerindo banco para professores quando o repositório consome `professores.json` em memória; e expressões imprecisas de "100% de cobertura" e de "decisões confirmadas com o usuário".
   - *Solução revisada*:
     1. Exclusão física do arquivo `frontend/src/services/api.ts` e de mocks legados em `LayoutPassoAPasso.test.tsx` e `LimparBusca.test.tsx`, zerando qualquer dependência de health check na camada de aplicação web. Esclareceu-se que o único healthcheck restante no ecossistema é a probe de container do banco de dados (PostgreSQL `pg_isready`) no `docker-compose.yaml`, necessária para a cláusula `depends_on: db: condition: service_healthy` da API.
     2. Limpeza integral do `README.md`, expurgando a rota `/api/health` e detalhando a arquitetura real: catálogo em memória via `backend/data/professores.json` (`JsonProfessorRepository`), e PostgreSQL mantido apenas como serviço padrão de scaffolding no `docker-compose.yaml`.
     3. Remoção de "Alemão" do `BuscaProfessoresForm.tsx`, ajustando a interface para 3 colunas uniformes estritamente com os idiomas do desafio ("Inglês", "Espanhol" e "Francês").
     4. Retificação formal do `USO_DE_IA.md`, detalhando de forma factual os testes aprovados (sem alegações de 100% de cobertura LCOV), explicitando que as escolhas de modelagem foram inferências de engenharia da IA para sanar ambiguidades, e documentando que a validação de amplitude horária mínima é uma defesa adicional de UX e consistência geométrica.
10. **Contagem Total de Aulas na Semana e Validação Estrita de Horário HH:mm (Feature 004)**:
    - *Desafio*:
      1. *Contagem e Ordenação*: O enunciado do desafio solicita o total de aulas marcadas na semana. O código anterior filtrava apenas as aulas nos dias da busca (`Count(a => diasNormalizados.Contains(a.DiaDaSemana))`), distorcendo tanto o badge de aulas exibido no card quanto a posição no ranking (ex: Bruno possui 2 aulas na semana em terça/quinta; ao buscar segunda/quarta, era computado com 0 aulas e ranqueado antes de Ana, que só tem 1 aula na semana).
      2. *Formato dos Horários*: O enunciado estipula o formato `HH:mm`. No entanto, a API usava `TimeOnly.TryParse`, que aceitava horários com segundos (`18:00:00`) ou horas sem dígito duplo (`8:00`).
    - *Solução revisada*:
      1. No domínio (`ProfessorMatcher.cs`), a contagem passou a computar integralmente `professor.AulasMarcadas.Count`, refletindo todas as aulas do professor na semana, com ordenação crescente por esse total e desempate por nome alfabético (`ThenBy`).
      2. No frontend (`CardProfessorElegivel.tsx`), o badge foi atualizado para `"1 aula na semana"` / `"{N} aulas na semana"`, mantendo fidelidade visual ao novo cômputo.
      3. No validador de aplicação (`BuscaProfessoresRequestValidator.cs`) e no caso de uso (`BuscarProfessoresUseCase.cs`), adotou-se estritamente `TimeOnly.TryParseExact(..., "HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out ...)`, rejeitando formatos com segundos ou sem zero à esquerda com HTTP 400.
      4. Retificação da Constituição v1.1.0 no Artigo III ("menor número total de aulas marcadas na semana").
      5. Ampliação dos testes automatizados com novos cenários de teste unitário xUnit no backend para validação estrita de formato e ordenação com aulas em dias alternados da semana.
11. **Ajustes de Documentação, Configuração Docker e Redefinição dos Filtros ao Limpar Busca (Feature 005)**:
    - *Desafio*: O usuário identificou que o botão "Limpar Busca" realizava a consulta do catálogo geral sem resetar os inputs visuais do formulário (mantendo valores anteriores preenchidos); o `README.md` exibia um comando `git clone` com `< >` que falhava no terminal por redirecionamento de shell, omitia a criação do `.env` a partir de `.env.example` (deixando credenciais do PostgreSQL vazias no Compose), usava o nome `docker-compose.yml` (em vez de `docker-compose.yaml`), reportava 50 testes em vez dos 61 existentes e não possuía seção dedicada com as decisões sobre situações não cobertas exigidas pelo enunciado; além de confusão sobre o escopo do health check removido.
    - *Solução revisada*:
      1. No componente `BuscaProfessoresForm.tsx`, o método `handleLimpar` foi atualizado para resetar os estados locais do formulário (`idioma = ""`, `dias = []`, `inicioFaixa = ""`, `fimFaixa = ""`, `duracaoMinutos = 60`, `erroValidacao = null`).
      2. No componente `App.tsx`, `handleLimparBusca` anula `ultimosFiltros` e passa `diasPesquisados = []`, garantindo visualização desimpedida da grade semanal no modo catálogo.
      3. O teste `LimparBusca.test.tsx` foi atualizado para validar a limpeza e redefinição dos campos e botões.
      4. O `README.md` foi corrigido com clone limpo, inclusão da instrução `cp .env.example .env`, referência a `docker-compose.yaml`, contagem factual de 61 testes (27 front-end, 34 back-end) e adição da seção `## Premissas e Decisões sobre Casos Não Cobertos`.
      5. O `USO_DE_IA.md` esclareceu a demarcação entre a camada de aplicação e a infraestrutura do Docker Compose.
12. **Alinhamento Literal de Contratos, Concretização de Limitações e Padronização do Docker Compose (Feature 006)**:
    - *Desafio*: O exemplo de resposta do desafio técnico utiliza as chaves literais `professores`, `aulasNaSemana` e `horarios`, enquanto a API expunha `elegiveis`, `quantidadeAulasNaSemana` e `horariosDisponiveis`; o `USO_DE_IA.md` não continha uma seção explicitamente dedicada ao registro do erro cometido pela IA com evidência empírica; a seção de limitações do `README.md` exibia um texto genérico de orientação em vez de conteúdo factual; e o arquivo de orquestração necessitava de padronização nominal para `docker-compose.yaml`.
    - *Solução revisada*:
      1. Os DTOs `BuscaProfessoresResponse` e `ProfessorElegivelDto` foram equipados com mapeamento dual (`[JsonPropertyName]`) compartilhando campos de suporte internos, expondo simultaneamente as chaves literais do desafio (`professores`, `aulasNaSemana`, `horarios`) e os aliases de retrocompatibilidade (`elegiveis`, `quantidadeAulasNaSemana`, `horariosDisponiveis`), com testes de contrato xUnit em `BuscaProfessoresContractTests.cs`.
      2. O serviço de frontend `professoresService.ts` foi enriquecido para normalizar transparentemente tanto payloads literais do desafio quanto payloads legados.
      3. Redação formal da seção 4 deste documento detalhando o erro na contagem de aulas semanais e na validação permissiva de horário, acompanhada da evidência empírica do caso Bruno vs Ana no catálogo `professores.json`.
      4. Substituição do placeholder de limitações do `README.md` por declaração conclusiva de conformidade total, arquitetura estática em memória e ciclo semanal recorrente.
13. **Qualidade de Código, Tipagem Estrita e Zero Warnings no Frontend (Feature 007)**:
    - *Desafio*: Erradicação de inconsistências de tipagem, dependências de useEffect e warnings de compilação/lint no frontend React 19.
    - *Solução revisada*: Resolução integral de dependências de hooks conforme React 19, refatoração de tipagens para TypeScript estrito e garantia de execução do script `npm run lint` com 0 erros e 0 warnings.
14. **Seleção Precisa e Acúmulo de Horários na Grade Semanal (Feature 008)**:
    - *Desafio*: Isolamento da seleção de horários por dia da semana para evitar que a seleção de um slot em determinado dia ativasse indevidamente o mesmo horário em outros dias, além de suportar a seleção múltipla de slots com cálculo reativo do total de aulas e horas agendadas.
    - *Solução revisada*: Tipagem de slots identificados por chave composta `{ dia, horario }`, permitindo marcação e desmarcação individual por dia, acompanhada de sumário visual reativo com chips de remoção e totalizador de agendamentos.
15. **Remoção de Configurações e Dependências de Banco de Dados (Feature 009)**:
    - *Desafio*: O usuário solicitou a remoção de tudo o que fosse relacionado a banco de dados, já que o desafio opera exclusivamente sobre o catálogo em memória `professores.json`. A presença do serviço `db` (PostgreSQL 17-alpine) no Docker Compose criava acoplamento desnecessário, atrasava a inicialização da API aguardando sondas de saúde do banco (`pg_isready`), exigia credenciais em `.env.example`/`.env` e gerava contradições entre documentação e arquitetura real.
    - *Solução revisada*:
      1. Exclusão física do serviço `db`, da porta 5432, do volume `postgres_data` e do respectivo healthcheck em `docker-compose.yaml`.
      2. Remoção da cláusula `depends_on: db: condition: service_healthy` e da variável `ConnectionStrings__DefaultConnection` do serviço `api`, tornando sua subida instantânea e independente.
      3. Expurgamento das variáveis `POSTGRES_DB`, `POSTGRES_USER` e `POSTGRES_PASSWORD` nos arquivos `.env.example` e `.env`.
      4. Alinhamento textual do `README.md` (remoção de PostgreSQL dos pré-requisitos, das instruções de execução e das notas de dados/persistência), consagrando a arquitetura autônoma em memória.
      5. Validação estrutural do Compose (`docker compose config`) e execução com sucesso de 100% dos testes da aplicação (37 no back-end e 34 no front-end) e verificação do linter.

---

## 4. Registro de Erro Cometido pela IA e Evidência Concreta de Detecção

Em cumprimento estrito ao requisito do desafio técnico de registrar os erros cometidos pela IA e a forma como foram percebidos, destaca-se a seguinte ocorrência:

### 4.1. O Erro Cometido pela IA
Durante a implementação da lógica de ordenação e elegibilidade em `ProfessorMatcher.cs`, a IA cometeu um **erro de interpretação de domínio** no cômputo da carga de trabalho dos professores:
- **Restrição indevida aos dias da busca**: O enunciado do desafio estabelece que os professores elegíveis devem ser ordenados pelo *"menor número de aulas marcadas na semana"*. A IA implementou a contagem filtrando apenas as aulas marcadas nos dias selecionados pelo usuário na busca:
  ```csharp
  // Código incorreto gerado pela IA:
  var aulasNaSemana = professor.AulasMarcadas.Count(a => diasNormalizados.Contains(a.DiaDaSemana));
  ```
- **Validação de horário excessivamente permissiva**: Em `BuscaProfessoresRequestValidator.cs`, a IA utilizou `TimeOnly.TryParse(valor, out _)`. Embora a mensagem de erro citasse o formato `HH:mm`, o parser nativo do .NET aceitava horários com segundos (`18:00:00`) ou horas sem dígito duplo (`8:00`), violando a especificação do contrato.

### 4.2. Evidência Empírica Utilizada para Detectar o Erro
A inconsistência gerada pela IA foi identificada empiricamente por meio do confronto analítico dos dados do catálogo `professores.json`:
1. **Inversão de Ranking entre Bruno e Ana**:
   - O professor **Bruno (id: 2)** possui **2 aulas marcadas na semana** (uma na terça-feira às 19:00 e uma na quinta-feira às 20:00).
   - A professora **Ana (id: 1)** possui apenas **1 aula marcada na semana** (na segunda-feira às 19:00).
   - Ao executar uma busca para o idioma `"Inglês"` com dias `["segunda", "quarta"]`:
     - O algoritmo com erro da IA calculava que Bruno tinha **0 aulas** (pois terça e quinta não estavam nos dias pesquisados) e Ana tinha **1 aula** (segunda-feira).
     - Como a ordenação prioriza o menor número de aulas na semana, **Bruno era classificado em 1º lugar**, na frente de Ana.
   - **Evidência fática de detecção**: A inspeção direta do catálogo evidenciou a contradição: Bruno tem o dobro de aulas marcadas na semana em comparação a Ana, mas a IA o apresentava ao usuário como o professor mais livre da semana e no topo do ranking.
2. **Evidência nos Testes de Contrato da API**:
   - Ao submeter requisições de teste contendo `"inicioFaixa": "18:00:00"`, a API retornava HTTP 200 (OK) em vez de rejeitar a requisição com HTTP 400 (Bad Request), comprovando a falha de validação estrita.

### 4.3. Como o Erro Foi Corrigido
1. **Domínio (`ProfessorMatcher.cs`)**:
   A contagem foi corrigida para computar a totalidade das aulas agendadas do professor em toda a semana:
   ```csharp
   // Código corrigido:
   var aulasNaSemana = professor.AulasMarcadas.Count;
   ```
2. **Aplicação (`BuscaProfessoresRequestValidator.cs` e `BuscarProfessoresUseCase.cs`)**:
   Substituição por parsing estrito com formato exato:
   ```csharp
   TimeOnly.TryParseExact(valor, "HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out _)
   ```
3. **Validação Automatizada com Testes de Regressão**:
   - Criação de teste de unidade em `ProfessorMatcherEligibilityTests.cs` simulando busca com dias alternados e asseverando que Ana (1 aula semanal) antecede Bruno (2 aulas semanais).
   - Criação de testes em `BuscaProfessoresValidationTests.cs` e `BuscaProfessoresContractTests.cs` rejeitando horários com segundos ou fora do padrão `HH:mm`.



