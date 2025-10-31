import { FeedbackResponse } from '../types';

interface DrawingMetrics {
  hasInk: boolean;
  coverage: number;
  spanX: number;
  spanY: number;
  offsetX: number;
  offsetY: number;
  touchesEdge: boolean;
}

const loadImageData = (imageDataBase64: string): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Image analysis is only available in the browser.'));
      return;
    }

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width || 1;
      canvas.height = image.height || 1;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Unable to analyse the drawing.'));
        return;
      }

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    };

    image.onerror = () => reject(new Error('Failed to load drawing for analysis.'));
    image.src = `data:image/png;base64,${imageDataBase64}`;
  });
};

const analyseDrawing = async (imageDataBase64: string): Promise<DrawingMetrics> => {
  const { data, width, height } = await loadImageData(imageDataBase64);
  const totalPixels = width * height;

  let inkPixels = 0;
  let sumX = 0;
  let sumY = 0;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      if (a > 32 && (r + g + b) > 96) {
        inkPixels += 1;
        sumX += x + 0.5;
        sumY += y + 0.5;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (inkPixels === 0) {
    return {
      hasInk: false,
      coverage: 0,
      spanX: 0,
      spanY: 0,
      offsetX: 0,
      offsetY: 0,
      touchesEdge: false,
    };
  }

  const coverage = inkPixels / totalPixels;
  const spanX = (maxX - minX + 1) / width;
  const spanY = (maxY - minY + 1) / height;
  const centerX = sumX / inkPixels;
  const centerY = sumY / inkPixels;
  const offsetX = Math.abs(centerX - width / 2) / (width / 2);
  const offsetY = Math.abs(centerY - height / 2) / (height / 2);
  const touchesEdge = minX <= 1 || minY <= 1 || maxX >= width - 2 || maxY >= height - 2;

  return {
    hasInk: true,
    coverage,
    spanX,
    spanY,
    offsetX,
    offsetY,
    touchesEdge,
  };
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const formatList = (items: string[]): string => {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  const allButLast = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  return `${allButLast}, and ${last}`;
};

export const evaluateCharacter = async (imageDataBase64: string, character: string): Promise<FeedbackResponse> => {
  const metrics = await analyseDrawing(imageDataBase64);

  if (!metrics.hasInk) {
    return {
      identifiedCharacter: 'None',
      isCorrect: false,
      score: 0,
      feedback: `It looks like you haven't written anything yet—try sketching the strokes for ${character}.`,
    };
  }

  const coverageScore = clamp(metrics.coverage / 0.15, 0, 1) * 45;
  const spanAverage = (metrics.spanX + metrics.spanY) / 2;
  const spanScore = clamp(spanAverage / 0.7, 0, 1) * 35;
  const balanceFactor = clamp(1 - ((metrics.offsetX + metrics.offsetY) / 2), 0, 1);
  const balanceScore = balanceFactor * 20;

  let rawScore = coverageScore + spanScore + balanceScore;
  if (metrics.touchesEdge) {
    rawScore -= 10;
  }

  const score = Math.round(clamp(rawScore, 0, 100));
  const isCorrect = score >= 60;
  const identifiedCharacter = isCorrect ? character : 'Unclear';

  const suggestions: string[] = [];
  if (metrics.coverage < 0.03) {
    suggestions.push('add more confident strokes');
  }
  if (spanAverage < 0.45) {
    suggestions.push('spread the strokes out to fill the square');
  }
  if ((metrics.offsetX + metrics.offsetY) / 2 > 0.2) {
    suggestions.push('center it within the guide');
  }
  if (metrics.touchesEdge) {
    suggestions.push('keep the strokes inside the guide');
  }

  const feedback = suggestions.length === 0
    ? `Great job! Your ${character} looks balanced and clear.`
    : `Try to ${formatList(suggestions)} for a clearer ${character}.`;

  return {
    identifiedCharacter,
    isCorrect,
    score,
    feedback,
  };
};
