"use client";

import { useState } from "react";
import Link from "next/link";

export default function CounterPage() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
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
              计数器
            </h1>

            {/* 计数显示 */}
            <div className="mb-12 rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800">
              <div className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                当前计数
              </div>
              <div className="text-7xl font-bold text-blue-600 dark:text-blue-400 sm:text-8xl">
                {count}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={decrement}
                className="flex-1 rounded-2xl bg-red-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all active:scale-95 hover:bg-red-600 active:shadow-md sm:flex-initial"
              >
                -1
              </button>
              <button
                onClick={reset}
                className="flex-1 rounded-2xl bg-gray-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all active:scale-95 hover:bg-gray-600 active:shadow-md sm:flex-initial"
              >
                重置
              </button>
              <button
                onClick={increment}
                className="flex-1 rounded-2xl bg-green-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all active:scale-95 hover:bg-green-600 active:shadow-md sm:flex-initial"
              >
                +1
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

