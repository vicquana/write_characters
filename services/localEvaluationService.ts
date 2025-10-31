import { FeedbackResponse } from '../types';

interface DrawingMetrics {
  hasInk: boolean;
  coverage: number;
  spanX: number;
  spanY: number;
  offsetX: number;
  offsetY: number;
  touchesEdge: boolean;
  outsideTrackRatio: number;
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
  let outsideTrackPixels = 0;
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

        const normalizedX = (x + 0.5) / width;
        const normalizedY = (y + 0.5) / height;
        const trackMargin = 0.12;
        const insideTrack =
          normalizedX >= trackMargin &&
          normalizedX <= 1 - trackMargin &&
          normalizedY >= trackMargin &&
          normalizedY <= 1 - trackMargin;

        if (!insideTrack) {
          outsideTrackPixels += 1;
        }
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
      outsideTrackRatio: 0,
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
  const outsideTrackRatio = outsideTrackPixels / inkPixels;

  return {
    hasInk: true,
    coverage,
    spanX,
    spanY,
    offsetX,
    offsetY,
    touchesEdge,
    outsideTrackRatio,
  };
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const formatSuggestions = (items: string[]): string => {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]}並且${items[1]}`;
  const allButLast = items.slice(0, -1).join('、');
  const last = items[items.length - 1];
  return `${allButLast}，並且${last}`;
};

export const evaluateCharacter = async (imageDataBase64: string, character: string): Promise<FeedbackResponse> => {
  const metrics = await analyseDrawing(imageDataBase64);

  if (!metrics.hasInk) {
    return {
      identifiedCharacter: '未書寫',
      isCorrect: false,
      score: 0,
      feedback: `看起來還沒有落筆，試著先描寫「${character}」的筆畫。`,
    };
  }

  const coverageScore = clamp(metrics.coverage / 0.15, 0, 1) * 45;
  const spanAverage = (metrics.spanX + metrics.spanY) / 2;
  const spanScore = clamp(spanAverage / 0.7, 0, 1) * 35;
  const balanceFactor = clamp(1 - ((metrics.offsetX + metrics.offsetY) / 2), 0, 1);
  const balanceScore = balanceFactor * 20;
  const outsidePenalty = clamp(metrics.outsideTrackRatio, 0, 1) * 40;

  let rawScore = coverageScore + spanScore + balanceScore - outsidePenalty;
  if (metrics.touchesEdge) {
    rawScore -= 12;
  }

  const score = Math.round(clamp(rawScore, 0, 100));
  const isCorrect = score >= 60;
  const identifiedCharacter = isCorrect ? character : '不明';

  const suggestions: string[] = [];
  if (metrics.coverage < 0.03) {
    suggestions.push('多寫幾筆讓字形更清楚');
  }
  if (spanAverage < 0.45) {
    suggestions.push('把筆畫稍微拉開填滿米字格');
  }
  if ((metrics.offsetX + metrics.offsetY) / 2 > 0.2) {
    suggestions.push('讓整個字更居中');
  }
  if (metrics.touchesEdge) {
    suggestions.push('注意不要碰到外框');
  }
  if (metrics.outsideTrackRatio > 0.15) {
    suggestions.push('維持筆畫在描紅軌跡內');
  }

  const feedback = suggestions.length === 0
    ? `太棒了！你的「${character}」筆畫穩定又清楚。`
    : `試著${formatSuggestions(suggestions)}，你的「${character}」會更好看。`;

  return {
    identifiedCharacter,
    isCorrect,
    score,
    feedback,
  };
};
