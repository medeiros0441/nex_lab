import { Platform } from 'react-native';
import { Skia } from '@shopify/react-native-skia';
import { Asset } from 'expo-asset';

const logo = require('../../assets/images/logo.png');

// Definição global para garantir o mesmo tamanho em ambas as versões
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

export async function generateFramedImage(base64Image: string): Promise<string | null> {
  return Platform.OS === 'web'
    ? generateFramedImageWeb(base64Image)
    : generateFramedImageNative(base64Image);
}

async function generateFramedImageNative(base64Image: string): Promise<string | null> {
  try {
    // Garante que está sem prefixo
    const raw = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const imageBytes = Skia.Data.fromBase64(raw);
    const mainImage = Skia.Image.MakeImageFromEncoded(imageBytes);
    if (!mainImage) throw new Error('Erro ao criar imagem principal');

    // Carrega o logo usando Asset do Expo
    const asset = Asset.fromModule(logo);
    await asset.downloadAsync();
    const logoUri = asset.localUri || asset.uri;
    if (!logoUri) throw new Error('Logo não encontrado');
    
    const logoResponse = await fetch(logoUri);
    const logoBuffer = await logoResponse.arrayBuffer();
    const logoData = Skia.Data.fromBytes(new Uint8Array(logoBuffer));
    const logoImg = Skia.Image.MakeImageFromEncoded(logoData);
    if (!logoImg) throw new Error('Erro ao carregar logo');

    // --- Layout igual ao Web ---
    const width = CANVAS_WIDTH;
    const height = CANVAS_HEIGHT;
    const surface = Skia.Surface.MakeOffscreen(width, height);
    if (!surface) throw new Error('Erro ao criar surface');
    const canvas = surface.getCanvas();

    // Fundo branco
    canvas.drawColor(Skia.Color('white'));

    // --- HEADER (Topo) ---
    // LOGO: canto superior esquerdo (maior e mais afastado do topo/esquerda)
    const logoDestRect = { x: 15, y: 30, width: 250, height: 250 };
    canvas.drawImageRect(
      logoImg,
      { x: 0, y: 0, width: logoImg.width(), height: logoImg.height() },
      logoDestRect,
      Skia.Paint()
    );

    // TEXTO HEADER: canto superior direito
    const paintText = Skia.Paint();
    paintText.setColor(Skia.Color('#000000'));
    paintText.setAlphaf(1); // opacidade máxima
    paintText.setAntiAlias(true);
    // Usa fonte padrão do sistema, depois define o tamanho
    const fontMgr = Skia.FontMgr.System();
    const typeface = fontMgr.matchFamilyStyle("sans-serif", {}); // FontStyle padrão
    const font = Skia.Font(typeface, 36);
    // Alinhamento à direita: calcula x para alinhar à direita
    const headerText = 'we make tech simple_';
    const textMetrics = font.measureText(headerText);
    const textWidth = textMetrics.width;
    const textX = width - 40;
    const textY = 200;
    canvas.drawText(headerText, textX - textWidth, textY, paintText, font);

    // --- IMAGEM PRINCIPAL ---
    // Área disponível para a imagem (sem header/footer)
    const destX = 0;
    const destY = 250;
    const destW = width;
    const destH = height - 400;
    // Proporção da imagem original
    const imgW = mainImage.width();
    const imgH = mainImage.height();
    const imgAspect = imgW / imgH;
    const destAspect = destW / destH;
    let drawW, drawH, offsetX, offsetY;
    if (imgAspect > destAspect) {
      // Imagem mais "larga" que o destino: ajusta largura, centraliza horizontalmente
      drawH = destH;
      drawW = imgAspect * drawH;
      offsetX = destX - (drawW - destW) / 2;
      offsetY = destY;
    } else {
      // Imagem mais "alta" que o destino: ajusta altura, centraliza verticalmente
      drawW = destW;
      drawH = drawW / imgAspect;
      offsetX = destX;
      offsetY = destY - (drawH - destH) / 2;
    }
    canvas.drawImageRect(
      mainImage,
      { x: 0, y: 0, width: imgW, height: imgH },
      { x: offsetX, y: offsetY, width: drawW, height: drawH },
      Skia.Paint()
    );

    // --- FOOTER (Rodapé) ---
    // TEXTO FOOTER: centralizado na horizontal
    const footerX = width / 2 - textWidth / 2;
    canvas.drawText(headerText, footerX, height - 60, paintText, font);

    const finalImage = surface.makeImageSnapshot();
    const encoded = finalImage.encodeToBase64();
    return `data:image/png;base64,${encoded}`;
  } catch (err) {
    console.error('Erro ao gerar imagem com moldura:', err);
    return null;
  }
}

async function generateFramedImageWeb(base64Image: string): Promise<string | null> {
  try {

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context não disponível');

    const width = CANVAS_WIDTH;
    const height = CANVAS_HEIGHT;
    canvas.width = width;
    canvas.height = height;

    // Carrega imagem principal
    const mainImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      // Garante prefixo base64
      const base64WithPrefix = base64Image.startsWith('data:image')
        ? base64Image
        : `data:image/png;base64,${base64Image}`;
      img.src = base64WithPrefix;
    });

    // Carrega logo (compatível com Expo web)
    const logoPath = require('../../assets/images/logo.png');
    const logoUrl = typeof logoPath === 'string'
      ? logoPath
      : logoPath.default || logoPath.uri;
    const logoImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = logoUrl;
    });

// --- Ajuste para manter proporção 9:16 ---
// Área disponível para a imagem (sem header/footer)
const destX = 0;
const destY = 250;
const destW = width;
const destH = height - 400;

// Proporção da imagem original
const imgW = mainImage.width;
const imgH = mainImage.height;
const imgAspect = imgW / imgH;
const destAspect = destW / destH;

let drawW, drawH, offsetX, offsetY;
if (imgAspect > destAspect) {
  // Imagem mais "larga" que o destino: ajusta largura, centraliza horizontalmente
  drawH = destH;
  drawW = imgAspect * drawH;
  offsetX = destX - (drawW - destW) / 2;
  offsetY = destY;
} else {
  // Imagem mais "alta" que o destino: ajusta altura, centraliza verticalmente
  drawW = destW;
  drawH = drawW / imgAspect;
  offsetX = destX;
  offsetY = destY - (drawH - destH) / 2;
}
// --- Fim ajuste ---

// Fundo branco
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, width, height);

// --- HEADER (Topo) ---
// LOGO: canto superior esquerdo
// Altere o tamanho e posição do logo aqui
ctx.drawImage(logoImage, 15, 30, 250, 250); // (x, y, largura, altura) - logo maior e mais afastado do topo/esquerda

// TEXTO HEADER: canto superior direito
// Altere a posição X/Y e fonte para ajustar o texto do header
ctx.fillStyle = '#000000';
ctx.font = '36px sans-serif'; // tamanho da fonte do header
ctx.textAlign = 'right'; // alinhamento à direita
ctx.fillText('we make tech simple_', width - 40, 200); // (x, y) - mais à direita, ajuste y conforme necessário

// --- IMAGEM PRINCIPAL ---
// A imagem é centralizada e ajustada para preencher o espaço disponível
ctx.drawImage(mainImage, offsetX, offsetY, drawW, drawH);

// --- FOOTER (Rodapé) ---
// TEXTO FOOTER: centralizado na horizontal
// Altere a posição Y e fonte para ajustar o texto do footer
ctx.font = '36px sans-serif'; // tamanho da fonte do footer
ctx.textAlign = 'center'; // alinhamento centralizado
ctx.fillText('we make tech simple_', width / 2, height - 60); // (x, y) - centralizado na horizontal, ajuste y conforme necessário

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Erro gerar imagem Web:', err);
    return null;
  }
}
