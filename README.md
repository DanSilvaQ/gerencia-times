# ⚽ GerenciaTimes

Sistema web para gerenciamento de jogadores e times de futebol, desenvolvido com React 19 e JSON Server.

---

## 🛠️ Tecnologias

- **Front-end**: React 19, Vite, CSS
- **Back-end**: JSON Server
- **Autenticação**: Token via localStorage

---

## 🚀 Como rodar o projeto

### Pré-requisitos
- Node.js 18+ instalado

### 1. Clone o repositório
```bash
git clone https://github.com/DanSilvaQ/gerencia-times.git
cd gerencia-times
```

### 2. Rode o back-end
```bash
cd Backend
npm install
npm start
```
> API rodando em http://localhost:3001

### 3. Rode o front-end (outro terminal)
```bash
cd Frontend
npm install
npm run dev
```
> Aplicação rodando em http://localhost:5173

---

## 👤 Acesso

| Campo | Valor |
|-------|-------|
| Email | admin@futebol.com |
| Senha | 123456 |

---

## 📋 Funcionalidades

- ✅ Login com autenticação por token
- ✅ Listar jogadores (GET)
- ✅ Adicionar jogador (POST)
- ✅ Editar jogador (PUT)
- ✅ Remover jogador (DELETE)
- ✅ Filtro por time
- ✅ Busca por nome
- ✅ Avatar por posição
- ✅ Hook `use` do React 19 com Suspense e ErrorBoundary

---

## 🗂️ Estrutura do Projeto
```
gerencia-times/
├── Backend/
│   ├── db.json       ← banco de dados
│   ├── server.js     ← servidor com rota de login
│   └── package.json
└── Frontend/
    ├── src/
    │   ├── App.jsx   ← toda a aplicação
    │   ├── App.css   ← estilos
    │   └── main.jsx  ← entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 📐 Critérios Atendidos

| Critério | Implementação |
|----------|--------------|
| API / Back-end | 4 endpoints CRUD + autenticação por token |
| Hook `use` | `use(promise)` com `Suspense` e `ErrorBoundary` |
| CRUD Front-end | Criar, listar, editar e deletar com feedback visual |
| Interface | Layout escuro inspirado no Sofascore, responsivo |
| Organização | Código modular, repositório público com README |
