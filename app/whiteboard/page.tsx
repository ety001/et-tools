"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faEraser,
  faSquare,
  faCircle,
  faPalette,
  faPenNib,
  faDownload,
  faHand,
  faTrash,
  faRotateLeft,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

type Tool = "pen" | "eraser" | "rectangle" | "ellipse" | "hand";
type DrawingAction = {
  type: Tool;
  points: Array<{ x: number; y: number }>;
  color: string;
  lineWidth: number;
  startX?: number;
  startY?: number;
};

const COLORS = [
  "#000000", // 黑色
  "#FF0000", // 红色
  "#00FF00", // 绿色
  "#0000FF", // 蓝色
  "#FFFF00", // 黄色
  "#FF00FF", // 洋红
  "#00FFFF", // 青色
  "#FFA500", // 橙色
];

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLineWidthPicker, setShowLineWidthPicker] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 视图变换状态
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // 绘图数据
  const [drawings, setDrawings] = useState<DrawingAction[]>([]);
  const [redoStack, setRedoStack] = useState<DrawingAction[]>([]);
  const currentDrawingRef = useRef<DrawingAction | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  // 触摸相关状态
  const touchStateRef = useRef<{
    isPinching: boolean;
    initialDistance: number;
    initialScale: number;
    initialOffsetX: number;
    initialOffsetY: number;
    lastTouchX: number;
    lastTouchY: number;
    isDragging: boolean;
  }>({
    isPinching: false,
    initialDistance: 0,
    initialScale: 1,
    initialOffsetX: 0,
    initialOffsetY: 0,
    lastTouchX: 0,
    lastTouchY: 0,
    isDragging: false,
  });

  // 鼠标拖动状态
  const mouseDragStateRef = useRef<{
    isDragging: boolean;
    lastX: number;
    lastY: number;
  }>({
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  // 将屏幕坐标转换为画布坐标
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const x = (screenX - rect.left - offsetX) / scale;
      const y = (screenY - rect.top - offsetY) / scale;
      return { x, y };
    },
    [offsetX, offsetY, scale]
  );

  // 重绘画布
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 应用变换
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // 绘制所有图形
    drawings.forEach((drawing) => {
      // 检查 drawing 是否为 null 或 undefined
      if (!drawing || !drawing.type || !drawing.points) return;

      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (drawing.type === "pen") {
        if (drawing.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        for (let i = 1; i < drawing.points.length; i++) {
          ctx.lineTo(drawing.points[i].x, drawing.points[i].y);
        }
        ctx.stroke();
      } else if (drawing.type === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        if (drawing.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        for (let i = 1; i < drawing.points.length; i++) {
          ctx.lineTo(drawing.points[i].x, drawing.points[i].y);
        }
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      } else if (drawing.type === "rectangle" && drawing.startX !== undefined && drawing.startY !== undefined) {
        const startX = drawing.startX;
        const startY = drawing.startY;
        if (drawing.points.length === 0) return;
        const endX = drawing.points[drawing.points.length - 1].x;
        const endY = drawing.points[drawing.points.length - 1].y;
        ctx.strokeRect(
          Math.min(startX, endX),
          Math.min(startY, endY),
          Math.abs(endX - startX),
          Math.abs(endY - startY)
        );
      } else if (drawing.type === "ellipse" && drawing.startX !== undefined && drawing.startY !== undefined) {
        const startX = drawing.startX;
        const startY = drawing.startY;
        if (drawing.points.length === 0) return;
        const endX = drawing.points[drawing.points.length - 1].x;
        const endY = drawing.points[drawing.points.length - 1].y;
        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;
        const radiusX = Math.abs(endX - startX) / 2;
        const radiusY = Math.abs(endY - startY) / 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    // 绘制当前正在绘制的图形
    if (currentDrawingRef.current) {
      const drawing = currentDrawingRef.current;
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (drawing.type === "pen") {
        if (drawing.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        for (let i = 1; i < drawing.points.length; i++) {
          ctx.lineTo(drawing.points[i].x, drawing.points[i].y);
        }
        ctx.stroke();
      } else if (drawing.type === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        if (drawing.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        for (let i = 1; i < drawing.points.length; i++) {
          ctx.lineTo(drawing.points[i].x, drawing.points[i].y);
        }
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      } else if (drawing.type === "rectangle" && drawing.startX !== undefined && drawing.startY !== undefined) {
        const startX = drawing.startX;
        const startY = drawing.startY;
        if (drawing.points.length === 0) return;
        const endX = drawing.points[drawing.points.length - 1].x;
        const endY = drawing.points[drawing.points.length - 1].y;
        ctx.strokeRect(
          Math.min(startX, endX),
          Math.min(startY, endY),
          Math.abs(endX - startX),
          Math.abs(endY - startY)
        );
      } else if (drawing.type === "ellipse" && drawing.startX !== undefined && drawing.startY !== undefined) {
        const startX = drawing.startX;
        const startY = drawing.startY;
        if (drawing.points.length === 0) return;
        const endX = drawing.points[drawing.points.length - 1].x;
        const endY = drawing.points[drawing.points.length - 1].y;
        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;
        const radiusX = Math.abs(endX - startX) / 2;
        const radiusY = Math.abs(endY - startY) / 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [drawings, offsetX, offsetY, scale]);

  // PC端滚轮缩放
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setScale((prevScale) => {
        const newScale = Math.max(0.1, Math.min(5, prevScale * zoomFactor));

        // 以鼠标位置为中心缩放
        const scaleChange = newScale / prevScale;
        setOffsetX((prev) => mouseX - (mouseX - prev) * scaleChange);
        setOffsetY((prev) => mouseY - (mouseY - prev) * scaleChange);
        return newScale;
      });
    },
    []
  );

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redraw();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [redraw]);

  // 注册 wheel 事件监听器（非 passive，以便可以 preventDefault）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // 当绘图数据变化时重绘
  useEffect(() => {
    redraw();
  }, [redraw]);

  // 客户端挂载标记，避免 SSR hydration 不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  // PC端鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // 只处理左键

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX;
    const screenY = e.clientY;

    // 检查是否在画布上（用于拖动）
    const canvasX = screenToCanvas(screenX, screenY);

    // 如果当前工具是绘图工具，开始绘图
    if (tool === "pen" || tool === "eraser" || tool === "rectangle" || tool === "ellipse") {
      setIsDrawing(true);
      startPosRef.current = canvasX;
      currentDrawingRef.current = {
        type: tool,
        points: [canvasX],
        color: tool === "eraser" ? "#000000" : color,
        lineWidth: lineWidth,
        startX: canvasX.x,
        startY: canvasX.y,
      };
    } else {
      // 否则开始拖动视图
      mouseDragStateRef.current = {
        isDragging: true,
        lastX: screenX,
        lastY: screenY,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDrawing && currentDrawingRef.current) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      currentDrawingRef.current.points.push(canvasPos);
      if (currentDrawingRef.current.type === "rectangle" || currentDrawingRef.current.type === "ellipse") {
        currentDrawingRef.current.points = [canvasPos]; // 矩形和椭圆只需要最后一个点
      }
      redraw();
    } else if (mouseDragStateRef.current.isDragging) {
      const deltaX = e.clientX - mouseDragStateRef.current.lastX;
      const deltaY = e.clientY - mouseDragStateRef.current.lastY;
      setOffsetX((prev) => prev + deltaX);
      setOffsetY((prev) => prev + deltaY);
      mouseDragStateRef.current.lastX = e.clientX;
      mouseDragStateRef.current.lastY = e.clientY;
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentDrawingRef.current) {
      const drawing = currentDrawingRef.current;
      // 确保 drawing 有效且至少有一个点
      if (drawing && drawing.points && drawing.points.length > 0) {
        setDrawings((prev) => [...prev, drawing]);
        setRedoStack([]); // 新的操作清空重做栈
      }
      currentDrawingRef.current = null;
      setIsDrawing(false);
    }
    mouseDragStateRef.current.isDragging = false;
  };

  // 移动端触摸事件处理
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touches = e.touches;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (touches.length === 2) {
      // 双指缩放
      e.preventDefault();
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = getTouchDistance(touch1, touch2);
      touchStateRef.current = {
        ...touchStateRef.current,
        isPinching: true,
        initialDistance: distance,
        initialScale: scale,
        initialOffsetX: offsetX,
        initialOffsetY: offsetY,
      };
    } else if (touches.length === 1) {
      // 单指操作
      const touch = touches[0];
      const canvasPos = screenToCanvas(touch.clientX, touch.clientY);

      if (tool === "pen" || tool === "eraser" || tool === "rectangle" || tool === "ellipse") {
        // 开始绘图
        setIsDrawing(true);
        startPosRef.current = canvasPos;
        currentDrawingRef.current = {
          type: tool,
          points: [canvasPos],
          color: tool === "eraser" ? "#000000" : color,
          lineWidth: lineWidth,
          startX: canvasPos.x,
          startY: canvasPos.y,
        };
      } else {
        // 开始拖动视图
        touchStateRef.current = {
          ...touchStateRef.current,
          isDragging: true,
          lastTouchX: touch.clientX,
          lastTouchY: touch.clientY,
        };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touches = e.touches;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (touches.length === 2 && touchStateRef.current.isPinching) {
      // 双指缩放
      e.preventDefault();
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = getTouchDistance(touch1, touch2);
      const scaleChange = distance / touchStateRef.current.initialDistance;
      const newScale = Math.max(0.1, Math.min(5, touchStateRef.current.initialScale * scaleChange));

      // 计算两指中心点
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      const rect = canvas.getBoundingClientRect();
      const mouseX = centerX - rect.left;
      const mouseY = centerY - rect.top;

      const scaleRatio = newScale / touchStateRef.current.initialScale;
      setOffsetX(mouseX - (mouseX - touchStateRef.current.initialOffsetX) * scaleRatio);
      setOffsetY(mouseY - (mouseY - touchStateRef.current.initialOffsetY) * scaleRatio);
      setScale(newScale);
    } else if (touches.length === 1) {
      const touch = touches[0];
      if (isDrawing && currentDrawingRef.current) {
        // 绘图
        e.preventDefault();
        const canvasPos = screenToCanvas(touch.clientX, touch.clientY);
        currentDrawingRef.current.points.push(canvasPos);
        if (currentDrawingRef.current.type === "rectangle" || currentDrawingRef.current.type === "ellipse") {
          currentDrawingRef.current.points = [canvasPos];
        }
        redraw();
      } else if (touchStateRef.current.isDragging) {
        // 拖动视图
        e.preventDefault();
        const deltaX = touch.clientX - touchStateRef.current.lastTouchX;
        const deltaY = touch.clientY - touchStateRef.current.lastTouchY;
        setOffsetX((prev) => prev + deltaX);
        setOffsetY((prev) => prev + deltaY);
        touchStateRef.current.lastTouchX = touch.clientX;
        touchStateRef.current.lastTouchY = touch.clientY;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDrawing && currentDrawingRef.current) {
      const drawing = currentDrawingRef.current;
      // 确保 drawing 有效且至少有一个点
      if (drawing && drawing.points && drawing.points.length > 0) {
        setDrawings((prev) => [...prev, drawing]);
        setRedoStack([]); // 新的操作清空重做栈
      }
      currentDrawingRef.current = null;
      setIsDrawing(false);
    }
    touchStateRef.current = {
      ...touchStateRef.current,
      isPinching: false,
      isDragging: false,
    };
  };

  // 下载功能
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 计算所有图形的边界
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    drawings.forEach((drawing) => {
      // 检查 drawing 是否为 null 或 undefined
      if (!drawing || !drawing.type || !drawing.points) return;

      if (drawing.type === "pen" || drawing.type === "eraser") {
        drawing.points.forEach((point) => {
          if (point) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
          }
        });
      } else if (drawing.startX !== undefined && drawing.startY !== undefined) {
        const endX = drawing.points[drawing.points.length - 1]?.x || drawing.startX;
        const endY = drawing.points[drawing.points.length - 1]?.y || drawing.startY;
        minX = Math.min(minX, drawing.startX, endX);
        minY = Math.min(minY, drawing.startY, endY);
        maxX = Math.max(maxX, drawing.startX, endX);
        maxY = Math.max(maxY, drawing.startY, endY);
      }
    });

    if (minX === Infinity) {
      // 没有内容
      return;
    }

    // 添加边距
    const padding = 20;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    // 创建临时画布
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // 设置白色背景
    tempCtx.fillStyle = "#FFFFFF";
    tempCtx.fillRect(0, 0, width, height);

    // 绘制所有图形（调整坐标）
    drawings.forEach((drawing) => {
      // 检查 drawing 是否为 null 或 undefined
      if (!drawing || !drawing.type || !drawing.points) return;

      tempCtx.strokeStyle = drawing.color;
      tempCtx.lineWidth = drawing.lineWidth;
      tempCtx.lineCap = "round";
      tempCtx.lineJoin = "round";

      if (drawing.type === "pen") {
        if (drawing.points.length < 2) return;
        tempCtx.beginPath();
        const firstPoint = drawing.points[0];
        tempCtx.moveTo(firstPoint.x - minX + padding, firstPoint.y - minY + padding);
        for (let i = 1; i < drawing.points.length; i++) {
          const point = drawing.points[i];
          tempCtx.lineTo(point.x - minX + padding, point.y - minY + padding);
        }
        tempCtx.stroke();
      } else if (drawing.type === "eraser") {
        tempCtx.strokeStyle = "#FFFFFF";
        if (drawing.points.length < 2) return;
        tempCtx.beginPath();
        const firstPoint = drawing.points[0];
        tempCtx.moveTo(firstPoint.x - minX + padding, firstPoint.y - minY + padding);
        for (let i = 1; i < drawing.points.length; i++) {
          const point = drawing.points[i];
          tempCtx.lineTo(point.x - minX + padding, point.y - minY + padding);
        }
        tempCtx.stroke();
      } else if (drawing.type === "rectangle" && drawing.startX !== undefined && drawing.startY !== undefined) {
        const startX = drawing.startX - minX + padding;
        const startY = drawing.startY - minY + padding;
        const endX = (drawing.points[drawing.points.length - 1]?.x || drawing.startX) - minX + padding;
        const endY = (drawing.points[drawing.points.length - 1]?.y || drawing.startY) - minY + padding;
        tempCtx.strokeRect(
          Math.min(startX, endX),
          Math.min(startY, endY),
          Math.abs(endX - startX),
          Math.abs(endY - startY)
        );
      } else if (drawing.type === "ellipse" && drawing.startX !== undefined && drawing.startY !== undefined) {
        const startX = drawing.startX - minX + padding;
        const startY = drawing.startY - minY + padding;
        const endX = (drawing.points[drawing.points.length - 1]?.x || drawing.startX) - minX + padding;
        const endY = (drawing.points[drawing.points.length - 1]?.y || drawing.startY) - minY + padding;
        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;
        const radiusX = Math.abs(endX - startX) / 2;
        const radiusY = Math.abs(endY - startY) / 2;
        tempCtx.beginPath();
        tempCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        tempCtx.stroke();
      }
    });

    // 下载
    tempCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `whiteboard-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  // 撤销
  const handleUndo = () => {
    setDrawings((prev) => {
      if (prev.length === 0) return prev;
      const newDrawings = [...prev];
      const lastDrawing = newDrawings.pop();
      if (lastDrawing) {
        setRedoStack((prevRedo) => [...prevRedo, lastDrawing]);
      }
      return newDrawings;
    });
  };

  // 重做
  const handleRedo = () => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const newRedoStack = [...prev];
      const drawingToRestore = newRedoStack.pop();
      if (drawingToRestore) {
        setDrawings((prevDrawings) => [...prevDrawings, drawingToRestore]);
      }
      return newRedoStack;
    });
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden overscroll-none bg-gray-100 dark:bg-gray-900">
      {/* 返回按钮 */}
      {mounted && (
        <Link
          href="/"
          className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-700 shadow-lg transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>
      )}

      {/* Canvas 容器 */}
      <div ref={containerRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 touch-none ${tool === "pen" || tool === "eraser" || tool === "rectangle" || tool === "ellipse"
            ? "cursor-crosshair"
            : "cursor-grab"
            }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      {/* 底部工具栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-wrap items-center justify-center gap-2 bg-white p-4 shadow-2xl dark:bg-gray-800 sm:gap-4">
        {/* 拖动 */}
        <button
          onClick={() => setTool("hand")}
          className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${tool === "hand"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          title="拖动"
        >
          <FontAwesomeIcon icon={faHand} className="h-6 w-6" />
        </button>

        {/* 撤销 */}
        <button
          onClick={handleUndo}
          disabled={drawings.length === 0}
          className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${drawings.length === 0
            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          title="撤销"
        >
          <FontAwesomeIcon icon={faRotateLeft} className="h-6 w-6" />
        </button>

        {/* 重做 */}
        <button
          onClick={handleRedo}
          disabled={redoStack.length === 0}
          className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${redoStack.length === 0
            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          title="重做"
        >
          <FontAwesomeIcon icon={faRotateRight} className="h-6 w-6" />
        </button>

        {/* 画笔 */}
        <button
          onClick={() => setTool("pen")}
          className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${tool === "pen"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          title="画笔"
        >
          <FontAwesomeIcon icon={faPen} className="h-6 w-6" />
        </button>

        {/* 橡皮 */}
        <button
          onClick={() => setTool("eraser")}
          className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${tool === "eraser"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          title="橡皮"
        >
          <FontAwesomeIcon icon={faEraser} className="h-6 w-6" />
        </button>

        {/* 矩形 */}
        <button
          onClick={() => setTool("rectangle")}
          className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${tool === "rectangle"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          title="矩形"
        >
          <FontAwesomeIcon icon={faSquare} className="h-6 w-6" />
        </button>

        {/* 椭圆 */}
        <button
          onClick={() => setTool("ellipse")}
          className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${tool === "ellipse"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          title="椭圆"
        >
          <FontAwesomeIcon icon={faCircle} className="h-6 w-6" />
        </button>

        {/* 颜色选择 */}
        <div className="relative">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowLineWidthPicker(false);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            title="颜色"
          >
            <FontAwesomeIcon icon={faPalette} className="h-6 w-6" style={{ color: color }} />
          </button>
          {showColorPicker && (
            <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-white p-3 shadow-xl w-max dark:bg-gray-800">
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      setShowColorPicker(false);
                    }}
                    className={`h-10 w-10 rounded-lg border-2 transition-all ${color === c ? "border-blue-500 scale-110" : "border-gray-300 dark:border-gray-600"
                      }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 笔触粗细 */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLineWidthPicker(!showLineWidthPicker);
              setShowColorPicker(false);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            title="笔触粗细"
          >
            <FontAwesomeIcon icon={faPenNib} className="h-6 w-6" />
          </button>
          {showLineWidthPicker && (
            <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800">
              <div className="mb-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                笔触粗细: {lineWidth}px
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* 下载 */}
        <button
          onClick={handleDownload}
          className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500 text-white transition-colors hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          title="下载"
        >
          <FontAwesomeIcon icon={faDownload} className="h-6 w-6" />
        </button>

        {/* 清空 */}
        <button
          onClick={() => {
            if (confirm("确定要清空画布吗？")) {
              setDrawings([]);
            }
          }}
          className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          title="清空"
        >
          <FontAwesomeIcon icon={faTrash} className="h-6 w-6" />
        </button>
      </div>

      {/* 点击外部关闭弹层 */}
      {(showColorPicker || showLineWidthPicker) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowColorPicker(false);
            setShowLineWidthPicker(false);
          }}
        />
      )}
    </div>
  );
}

