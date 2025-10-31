
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';

type Point = { x: number; y: number };
type Path = Point[];

export interface CharacterCanvasRef {
  clear: () => void;
  undo: () => void;
  getImageData: () => string | null;
}

const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.strokeStyle = "rgba(100, 116, 139, 0.2)"; // slate-500 with opacity
  ctx.lineWidth = 2;

  // Dashed lines
  ctx.setLineDash([5, 10]);

  // Main axes
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
  
  // Diagonal axes
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, height);
  ctx.moveTo(width, 0);
  ctx.lineTo(0, height);
  ctx.stroke();

  // Solid lines for border
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(100, 116, 139, 0.3)";
  ctx.strokeRect(0, 0, width, height);
};

export const CharacterCanvas = forwardRef<CharacterCanvasRef, {}>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<Path[]>([]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([]);

    paths.forEach(path => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    });
  }, [paths]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    redrawCanvas();
  }, [redrawCanvas]);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in event.nativeEvent) {
      if (event.nativeEvent.touches.length === 0) return null;
      return {
        x: event.nativeEvent.touches[0].clientX - rect.left,
        y: event.nativeEvent.touches[0].clientY - rect.top
      };
    }
    return {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(event);
    if (!coords) return;
    setIsDrawing(true);
    setPaths(prevPaths => [...prevPaths, [coords]]);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCoordinates(event);
    if (!coords) return;
    setPaths(prevPaths => {
      const newPaths = [...prevPaths];
      const currentPath = newPaths[newPaths.length - 1];
      currentPath.push(coords);
      return newPaths;
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  useEffect(() => {
     redrawCanvas();
  }, [paths, redrawCanvas]);


  useImperativeHandle(ref, () => ({
    clear: () => {
      setPaths([]);
    },
    undo: () => {
      setPaths(prevPaths => prevPaths.slice(0, -1));
    },
    getImageData: (): string | null => {
        if (paths.length === 0) return null;
        const canvas = canvasRef.current;
        if (!canvas) return null;

        // Create a temporary canvas without the grid
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        if (!tempCtx) return null;

        tempCtx.fillStyle = '#000000'; // Match background for transparency
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        tempCtx.strokeStyle = '#FFFFFF';
        tempCtx.lineWidth = 10;
        tempCtx.lineCap = 'round';
        tempCtx.lineJoin = 'round';

        paths.forEach(path => {
          if (path.length < 2) return;
          tempCtx.beginPath();
          tempCtx.moveTo(path[0].x, path[0].y);
          for (let i = 1; i < path.length; i++) {
            tempCtx.lineTo(path[i].x, path[i].y);
          }
          tempCtx.stroke();
        });

        return tempCanvas.toDataURL('image/png').split(',')[1];
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
});
