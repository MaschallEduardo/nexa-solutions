# Sistema de Chamados — Nexa Solutions

Sistema de gerenciamento de chamados desenvolvido para a disciplina de **Manutenção e Evolução de Software**.

O projeto consiste em uma API REST para abertura, consulta e acompanhamento de chamados de suporte, utilizando boas práticas de desenvolvimento, Docker, banco de dados PostgreSQL, testes automatizados e controle de versão com Git.

---

## Tecnologias utilizadas

### Backend

- Python
- Django
- Django REST Framework
- PostgreSQL

### Infraestrutura

- Docker
- Docker Compose

### Desenvolvimento

- Git
- GitHub

---

## Arquitetura do projeto

```text
nexa-solutions/
│
├── backend/
│   ├── chamados/          # Aplicação Django de chamados
│   ├── config/            # Configurações do projeto Django
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/              # Interface do sistema
│
├── docs/                  # Documentação da atividade
│
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

---

# Configuração do ambiente

## Pré-requisitos

Necessário possuir instalado:

- Docker
- Docker Compose
- Git

---

## Variáveis de ambiente

O projeto utiliza variáveis de ambiente para configuração.

Crie um arquivo `.env` baseado no exemplo:

```bash
cp .env.example .env
```

Exemplo:

```env
DJANGO_SECRET_KEY=sua-chave
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

POSTGRES_DB=nexa_chamados
POSTGRES_USER=nexa_user
POSTGRES_PASSWORD=sua_senha
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

O arquivo `.env` não deve ser versionado.

---

# Executando o projeto

Para iniciar a aplicação utilizando Docker:

```bash
docker compose up --build
```

A API estará disponível em:

```
http://localhost:8000
```

O banco PostgreSQL será executado em um container separado com persistência através de volume Docker.

---

# Banco de dados

O projeto utiliza:

- PostgreSQL 16
- Container Docker próprio
- Volume persistente para armazenamento dos dados

As migrations são aplicadas através do Django:

```bash
docker compose exec api python manage.py migrate
```

---

# API de Chamados

## Criar chamado

### POST

```
/api/chamados/
```

Exemplo:

```json
{
    "titulo": "Erro no sistema",
    "descricao": "Usuário não consegue acessar"
}
```

Resposta:

```json
{
    "id": 1,
    "titulo": "Erro no sistema",
    "descricao": "Usuário não consegue acessar",
    "status": "ABERTO"
}
```

---

## Listar chamados

### GET

```
/api/chamados/
```

---

## Filtrar chamados por status

### GET

```
/api/chamados/?status=ABERTO
```

Status disponíveis:

```
ABERTO
EM_ANDAMENTO
CONCLUIDO
```

---

## Indicadores

### GET

```
/api/indicadores/
```

Exemplo de resposta:

```json
{
    "total": 10,
    "abertos": 5,
    "em_andamento": 3,
    "concluidos": 2
}
```

---

# Testes automatizados

O projeto possui testes automatizados para:

- Criação válida de chamados
- Cadastro sem título
- Filtro por status
- Endpoint de indicadores

Executar testes:

```bash
docker compose exec api python manage.py test chamados
```

Resultado esperado:

```
Ran 4 tests

OK
```

---

# Segurança e configuração

Foram aplicadas melhorias de segurança:

- Remoção de informações sensíveis do código
- Uso de variáveis de ambiente
- Disponibilização do `.env.example`
- Bloqueio do versionamento de arquivos sensíveis através do `.gitignore`

Arquivos protegidos:

```
.env
*.sqlite3
.venv/
__pycache__/
```

---

# Controle de versão

O desenvolvimento foi realizado utilizando:

- Branches por funcionalidade
- Pull Requests
- Commits organizados

Principais evoluções:

- Configuração PostgreSQL com Docker
- Validação de chamados
- Filtro por status
- Endpoint de indicadores
- Testes automatizados

---

# Possíveis evoluções futuras

- Evolução da interface frontend utilizando Next.js
- Implementação de autenticação e controle de usuários
- Melhorias de usabilidade