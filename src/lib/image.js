// Utilitários de imagem — hoje serve só pra comprimir foto de treino antes
// do upload pro Supabase storage. Alvo: ~200KB, lado maior 1080px, JPEG 0.7.
// Se mesmo assim passar de 2MB, tenta de novo com qualidade 0.5. Se ainda
// passar, rejeita — o chamador decide o fallback (toast "muito grande").

const MAX_SIDE = 1080;
const PRIMARY_QUALITY = 0.7;
const FALLBACK_QUALITY = 0.5;
const HARD_LIMIT_BYTES = 2 * 1024 * 1024;

// Lê o arquivo e devolve um HTMLImageElement decodificado.
const readImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read_error'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode_error'));
      img.onload = () => resolve(img);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const renderToDataUrl = (img, quality) => {
  const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
};

// Tamanho aproximado em bytes de um dataURL base64 ("data:...;base64,xxx").
const dataUrlSize = (dataUrl) => {
  const i = dataUrl.indexOf(',');
  const body = i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
  const padding = (body.endsWith('==') ? 2 : body.endsWith('=') ? 1 : 0);
  return Math.floor((body.length * 3) / 4) - padding;
};

// Comprime o arquivo pra JPEG dataURL. Resolve com { dataUrl, size } ou
// rejeita com Error('too_large') se nem o fallback bater o limite.
export const compressImage = async (file) => {
  const img = await readImage(file);
  let dataUrl = renderToDataUrl(img, PRIMARY_QUALITY);
  let size = dataUrlSize(dataUrl);
  if (size > HARD_LIMIT_BYTES) {
    dataUrl = renderToDataUrl(img, FALLBACK_QUALITY);
    size = dataUrlSize(dataUrl);
    if (size > HARD_LIMIT_BYTES) {
      throw new Error('too_large');
    }
  }
  return { dataUrl, size };
};
