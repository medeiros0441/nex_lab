const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: "dbw3hcgwc",
  api_key: "643423721338811",
  api_secret: "ZEQyB3yekbURzY0RHkhohqn9dD0",
});

// Upload para o Cloudinary
async function saveImage(req, res) {
  try {
    let { imageBase64 } = req.body;
    if (!imageBase64 || !imageBase64.startsWith('data:image')) {
      return res.status(400).json({ error: 'Imagem inválida' });
    }
    // Gera nome: next_lab-HHmm
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const filenameBase = `next_lab-${hh}${mm}_${Math.random().toString(36).substring(2, 10)}`;
    // Upload direto do base64, usando public_id
    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'touch',
      public_id: filenameBase,
      resource_type: 'image',
      overwrite: true, // sobrescreve se já existir
    });
    // Extrai o nome final salvo
    const filename = filenameBase + '.' + result.format;
    return res.json({ filename });
  } catch (err) {
    console.error('Erro ao salvar imagem no Cloudinary:', err);
    return res.status(500).json({ error: 'Erro interno ao salvar imagem no Cloudinary' });
  }
}
 
// Controller para redirecionar download da imagem do Cloudinary
async function downloadImage(req, res) {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).send('Nome do arquivo não fornecido');
    }

    // Remove extensão para obter public_id
    const publicId = `touch/${filename.replace(/\.[^.]+$/, '')}`;

    // Gera a URL pública da imagem
    // Você pode adicionar opções aqui, ex: { secure: true, format: 'jpg' }
    const url = cloudinary.url(publicId);

    // Redireciona para a URL pública do Cloudinary
    return res.redirect(url);
  } catch (err) {
    console.error('Erro ao redirecionar imagem do Cloudinary:', err);
    return res.status(500).send('Erro interno ao processar a imagem');
  }
}

async function adminPanel(req, res) {
  try {
    
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'touch/',
      resource_type: 'image',
      max_results: 100,
    });

    const stats = {};
    const files = [];

    result.resources.forEach(file => {
      const dia = file.created_at.slice(0, 10);
      stats[dia] = (stats[dia] || 0) + 1;

      files.push({
        filename: file.public_id.split('/').pop() + '.' + file.format,
        dia: dia,
      });
    });

    res.status(200).json({ stats, files });
  } catch (err) {
    console.error('Erro ao listar imagens do Cloudinary:', err);
    res.status(500).json({ error: 'Erro interno ao listar imagens' });
  }
}

// Health check
function healthCheck(req, res) {
  res.status(200).json({ status: 'ok' });
}

module.exports = {
  saveImage,
  downloadImage,
  adminPanel,
  healthCheck,
};
