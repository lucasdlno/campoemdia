# CampoEmDia

Plataforma de orientação regulatória e climática para produtores rurais de Sorocaba/SP.

Projeto da disciplina **Usina de Projetos Experimentais (UPx)** do Centro Universitário Facens, 2026.

> **Status:** em desenvolvimento.

---

## Sobre o projeto

Produtores rurais, pequenos e grandes, têm dificuldade para manter em dia a documentação exigida nas esferas municipal, estadual e federal, e também para acessar informações meteorológicas confiáveis na hora de decidir o plantio. Isso atrapalha a regularização da propriedade, o planejamento agrícola e, em muitos casos, o acesso a crédito, já que instituições financeiras não podem operar com clientes em situação irregular.

O CampoEmDia reúne, em uma única aplicação web, a orientação sobre os documentos necessários e as informações climáticas que apoiam a decisão do produtor.

## Objetivo geral

Otimizar o processo de regularização de terras e o planejamento agrícola de produtores rurais e agrônomos no município de Sorocaba, por meio de uma aplicação web que indica requisitos documentais e recomenda melhores janelas de plantio integrando dados climáticos via API.

## Objetivos específicos

- Mapear as exigências regulatórias municipais de Sorocaba, modelando um banco de dados para estruturar os requisitos documentais das atividades agrícolas e pecuárias.
- Projetar o front-end da aplicação, priorizando a praticidade na experiência do usuário.
- Pesquisar, selecionar e integrar APIs meteorológicas à arquitetura do sistema, exibindo dados climáticos que orientem a tomada de decisão agronômica.
- Desenvolver a aplicação web, integrando a camada visual com o banco de dados e a API.
- Realizar testes funcionais, avaliando o fluxo de orientação documental e a consistência dos dados meteorológicos.

## Funcionalidades previstas

- Escolha da atividade (agrícola ou pecuária) e checklist de documentos exigidos, com a lei ou o órgão de cada item.
- Painel de clima de Sorocaba (temperatura e chuva) para apoiar o planejamento do plantio.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Front-end | React + Vite (JavaScript) |
| Back-end | Node.js + Express |
| Banco de dados | SQLite (better-sqlite3) |
| Clima | API Open-Meteo |

## Estrutura do repositório

```
campoemdia/
├── frontend/   # aplicação React (Vite)
├── backend/    # API Express e banco de dados
├── docs/       # relatório do projeto e planilha de leis
└── README.md
```

## Como rodar

Pré-requisitos: [Git](https://git-scm.com/) e [Node.js](https://nodejs.org/) (versão LTS).

```bash
git clone https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
cd NOME_DO_REPOSITORIO
```

**Back-end** (em um terminal):

```bash
cd backend
npm install
node server.js
```

A API fica disponível em `http://localhost:3000`.

**Front-end** (em outro terminal):

```bash
cd frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

## Aviso importante

O CampoEmDia **orienta, mas não substitui** os órgãos responsáveis (como CETESB, INCRA, SEMA e Prefeitura de Sorocaba) pela análise e aprovação dos documentos. As informações climáticas servem como apoio à decisão e **não substituem** ferramentas especializadas como o ZARC (Zoneamento Agrícola de Risco Climático) da Embrapa, nem constituem recomendação técnica definitiva. A lista de leis e requisitos pode estar desatualizada; confirme sempre nas fontes oficiais.

## Equipe

| Integrante | 
| --- |
| Henrique Salles Souza Duarte |
| Lucas Gomes de Araujo |
| Marcelo Panini da Silva (líder) |
| Pablo Henrique Donizetti Dias de Lima |

**Orientador:** Prof. Dr. Rafael Rodrigues da Paz

## Referências

- Embrapa. Zarc – Zoneamento Agrícola de Risco Climático e Zarc em Níveis de Manejo (ZarcNM).
- Ministério da Gestão e da Inovação em Serviços Públicos. Plataforma Meu Imóvel Rural.
- Serviço Florestal Brasileiro. Regularização ambiental.
- CETESB. Atividades agrícolas.
- Prefeitura de Sorocaba. Secretaria do Meio Ambiente, documentação para supressão arbórea.

A lista completa está no relatório, em `docs/`.