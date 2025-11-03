import Link from "next/link";

const tools = [
  {
    name: "计数器",
    description: "简单实用的计数器工具",
    path: "/counter",
    emoji: "🔢",
    color: "bg-blue-500",
  },
  {
    name: "秒表",
    description: "精确的时间测量工具",
    path: "/stopwatch",
    emoji: "⏱️",
    color: "bg-green-500",
  },
  {
    name: "定时器",
    description: "倒计时定时器",
    path: "/timer",
    emoji: "⏰",
    color: "bg-orange-500",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8 text-center sm:mb-12">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            小工具集
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            实用的移动端工具集合
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.path}
              href={tool.path}
              className="group relative block overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${tool.color} text-2xl shadow-md`}
                >
                  {tool.emoji}
                </div>
                <div className="flex-1">
                  <h2 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">
                    {tool.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tool.description}
                  </p>
                </div>
              </div>
              <div className="absolute top-1/2 right-0 -translate-y-1/2 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
