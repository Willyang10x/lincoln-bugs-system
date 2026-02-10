# Lincoln Bugs System

![Status do Deploy](https://img.shields.io/badge/deploy-active-success?style=for-the-badge&logo=render)
![Python](https://img.shields.io/badge/python-3.11-blue?style=for-the-badge&logo=python)
![Postgres](https://img.shields.io/badge/postgres-neon-00bfa5?style=for-the-badge&logo=postgresql)

> Um sistema robusto para gestão financeira e controle de bugs, desenvolvido com arquitetura em nuvem escalável.

<img width="1343" height="648" alt="image" src="https://github.com/user-attachments/assets/667d119e-b30b-43ce-9096-98d2601ad50f" />

## 🚀 Sobre o Projeto

Este projeto é uma solução Fullstack para gerenciamento de clientes e pagamentos. A arquitetura foi desenhada para garantir **persistência de dados** e **alta disponibilidade**, separando a regra de negócio (API) do armazenamento (Banco de Dados).

### 🛠 Tecnologias Utilizadas

* **Backend:** Python (FastAPI/SQLAlchemy)
* **Banco de Dados:** PostgreSQL (Hospedado na **Neon.tech**)
* **Infraestrutura/Deploy:** Render (Web Service)
* **Gerenciamento de Dependências:** Poetry / Pip

## ⚙️ Arquitetura

O sistema opera no modelo de microsserviços na nuvem:
1.  **API (Cérebro):** Hospedada no Render, processa as requisições e regras de negócio.
2.  **Database (Memória):** Hospedado no Neon, garante que os dados sejam salvos com segurança e backup, sem risco de perda por inatividade do servidor.

## 📦 Como Rodar Localmente

Siga os passos abaixo para rodar o projeto na sua máquina:

1.  **Clone o repositório**
    ```bash
    git clone [https://github.com/seu-usuario/lincoln-bugs-system.git](https://github.com/seu-usuario/lincoln-bugs-system.git)
    cd lincoln-bugs-system
    ```

2.  **Crie um ambiente virtual**
    ```bash
    python -m venv .venv
    # Windows
    .\.venv\Scripts\activate
    # Linux/Mac
    source .venv/bin/activate
    ```

3.  **Instale as dependências**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure as Variáveis de Ambiente**
    Crie um arquivo `.env` na raiz e adicione a URL do seu banco de dados:
    ```env
    DATABASE_URL="postgresql://usuario:senha@host/database"
    ```

5.  **Rode o Servidor**
    ```bash
    uvicorn backend.main:app --reload
    ```

## 🌐 Deploy

O projeto está configurado para deploy contínuo (CD) no **Render**.
Qualquer alteração na branch `main` dispara uma nova versão automaticamente.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido por Willyan Gabriel
