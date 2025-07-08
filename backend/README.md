# Backend - Touch API

API Node.js + Express para upload, listagem e download de imagens usando Cloudinary.

## Requisitos
- Node.js 18+
- Conta no [Cloudinary](https://cloudinary.com/)

## Configuração
1. Crie um arquivo `.env` na pasta `backend` com:

```
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

2. Instale as dependências:

```
npm install
```

## Uso local

```
npm run dev
```

A API estará disponível em `http://localhost:3001` (ou porta definida no seu `index.js`).

## Deploy (Vercel ou Serverless)
- Aponte o deploy para a pasta `backend`.
- Certifique-se de definir as variáveis de ambiente no painel da Vercel.

## Rotas principais

- `POST /api/upload` — Upload de imagem (base64). Retorna `{ filename }`.
- `POST /api/update` — Recebe `{ filename }` e retorna `{ url }` pública da imagem.
- `GET /api/download/:filename` — Redireciona para a URL pública da imagem.
- `GET /api/admin` — Retorna `{ stats, files }` com estatísticas e lista de imagens.
- `GET /api/health` — Health check.

## Observações
- Todas as imagens são salvas no Cloudinary, pasta `touch/`.
- O nome do arquivo segue o padrão `next_lab-HHmm.ext` (hora e minutos do upload).
- O frontend deve consumir as rotas `/api/update` e `/api/admin` para obter URLs públicas e lista de imagens.

---

Dúvidas? Abra uma issue ou consulte o código-fonte.
