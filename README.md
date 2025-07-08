# Photo Opp – Nex Lab

## Descrição
Este projeto simula uma ativação interativa em um estande de evento, onde o participante interage com uma tela (touchscreen ou celular), tira uma foto, visualiza o resultado com uma moldura personalizada e, se aprovar, pode baixar a imagem via QR Code. A experiência é rápida, fluida e contínua, conforme o desafio técnico da Nex Lab.

## Fluxo da Aplicação
1. **Tela Inicial:** Toque para iniciar.
2. **Pré-Captura:** Botão para capturar foto.
3. **Contagem Regressiva:** 3 segundos.
4. **Foto Capturada + Moldura:** Visualização da foto com moldura (formato 9:16).
5. **Revisão:** Opção de refazer ou aprovar.
6. **Tela Final:** QR Code para download da imagem.
7. **Retorno automático à tela inicial.**

## Tecnologias Utilizadas
- **Frontend:** Expo (React Native), Expo Router
- **Backend:** Node.js, Express
- **Manipulação de Imagem:** Canvas (lado cliente), processamento no backend
- **Armazenamento:** cloudinary
- **Geração de QR Code:** Biblioteca QRCode

## Funcionalidades
- Captura de foto pela câmera do dispositivo
- Aplicação de moldura personalizada (conforme Figma)
- Download da imagem final via QR Code
- Painel administrativo simples:
  - Quantidade de participações por dia
  - Links das fotos geradas
 

## Deploy
- O frontend está hospedado em:  https://projeto-nex-lab.vercel.app/
- O backend está hospedado em: https://nex-lab-desafio.vercel.app/

## Painel Administrativo
- Acesse `/pages/adm` para visualizar o painel com participações e links das fotos.
 

## Observações
- O código está organizado em `frontend/`  e `backend/`.
- A experiência foi pensada para ser fluida, responsiva e próxima do real.
- Criatividade, clareza e organização foram priorizadas conforme solicitado no desafio. 

🚀 Executando Localmente
1. Backend
Acesse o diretório backend e instale as dependências:

    cd backend
    npm install --legacy-peer-deps

    ⚠️ Atenção:
    cria o arquivo .env dentro da pasta backend nele vc coloca as variaveis  
      allowedOrigins=http://localhost:8081 ou a porta iniciada pelo front
      cod_apk=chave_de_sua_preferencia. esse codigo tem que ser o mesmo que está no app.json representado pela APP_SECRET_KEY
    execute no terminal  para iniciar a aplicação
      - node index.js

  ⚠️ Atenção: o backend exige acesso ao Cloudinary para funcionar corretamente.
    Por motivos de segurança, as credenciais não estão incluídas no projeto.
    Se desejar rodar o backend localmente, será necessário:
    Criar um arquivo .env com suas credenciais do Cloudinary:

      CLOUD_NAME=seu_cloud_name
      API_KEY=sua_api_key
      API_SECRET=sua_api_secret

    Ou adaptar o projeto para realizar uploads de arquivos localmente.

2. Acesse o diretório frontend:

  cd frontend
  npm install --legacy-peer-deps
  npx expo start --clear

 



Desenvolvido por Samuel Medeiros.
