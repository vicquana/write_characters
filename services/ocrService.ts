const HAN_REGEX = /\p{Script=Han}/u;

const TESSERACT_OPTIONS = {
  logger: () => {},
  workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
  corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/dist/tesseract-core.wasm.js',
  langPath: 'https://tessdata.projectnaptha.com/4.0.0',
};

const TESSERACT_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

interface TesseractModule {
  recognize: (
    image: File | Blob | string,
    lang: string,
    options?: Record<string, unknown>
  ) => Promise<{ data: { text: string } }>;
}

declare global {
  interface Window {
    Tesseract?: TesseractModule;
  }
}

let tesseractLoader: Promise<TesseractModule> | null = null;

async function loadTesseract(): Promise<TesseractModule> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Tesseract.js 需要在瀏覽器環境中執行。');
  }

  if (window.Tesseract) {
    return window.Tesseract;
  }

  if (!tesseractLoader) {
    tesseractLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = TESSERACT_SCRIPT_URL;
      script.async = true;
      script.onload = () => {
        if (window.Tesseract) {
          resolve(window.Tesseract);
        } else {
          tesseractLoader = null;
          reject(new Error('無法載入 Tesseract.js。'));
        }
      };
      script.onerror = () => {
        tesseractLoader = null;
        reject(new Error('無法載入 Tesseract.js。'));
      };
      (document.body || document.head).appendChild(script);
    });
  }

  return tesseractLoader;
}

export async function extractChineseCharactersFromImage(image: File | Blob | string): Promise<string[]> {
  const tesseract = await loadTesseract();

  const {
    data: { text },
  } = await tesseract.recognize(image, 'chi_sim', TESSERACT_OPTIONS);

  const cleanedText = text.replace(/[\s\d\p{P}]/gu, '');
  const characters = Array.from(cleanedText).filter((char) => HAN_REGEX.test(char));

  return Array.from(new Set(characters));
}
