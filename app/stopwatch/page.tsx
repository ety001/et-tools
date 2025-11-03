"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function StopwatchPage() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回首页
        </Link>

        {/* 主内容 */}
        <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center">
          <div className="w-full max-w-md text-center">
            <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              秒表
            </h1>

            {/* 时间显示 */}
            <div className="mb-12 rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800">
              <div className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                经过时间
              </div>
              <div className="font-mono text-5xl font-bold text-green-600 dark:text-green-400 sm:text-6xl">
                {formatTime(time)}
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              {!isRunning ? (
                <button
                  onClick={start}
                  className="flex-1 rounded-2xl bg-green-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all active:scale-95 hover:bg-green-600 active:shadow-md sm:flex-initial"
                >
                  开始
                </button>
              ) : (
                <button
                  onClick={pause}
                  className="flex-1 rounded-2xl bg-yellow-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all active:scale-95 hover:bg-yellow-600 active:shadow-md sm:flex-initial"
                >
                  暂停
                </button>
              )}
              <button
                onClick={reset}
                className="flex-1 rounded-2xl bg-gray-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all active:scale-95 hover:bg-gray-600 active:shadow-md sm:flex-initial"
              >
                重置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

