"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const ALARM_OPTIONS = [
  { id: 1, name: "闹铃 1", file: "/alarms/alarm1.ogg" },
  { id: 2, name: "闹铃 2", file: "/alarms/alarm2.ogg" },
  { id: 3, name: "闹铃 3", file: "/alarms/alarm3.ogg" },
  { id: 4, name: "闹铃 4", file: "/alarms/alarm4.ogg" },
  { id: 5, name: "闹铃 5", file: "/alarms/alarm5.ogg" },
];

export default function TimerPage() {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [enableAlarm, setEnableAlarm] = useState(true);
  const [selectedAlarm, setSelectedAlarm] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationPermissionRef = useRef<NotificationPermission | null>(null);
  const enableAlarmRef = useRef(enableAlarm);
  const selectedAlarmRef = useRef(selectedAlarm);

  // 从localStorage加载设置
  useEffect(() => {
    const savedEnableAlarm = localStorage.getItem("timer-enable-alarm");
    const savedSelectedAlarm = localStorage.getItem("timer-selected-alarm");
    
    if (savedEnableAlarm !== null) {
      setEnableAlarm(savedEnableAlarm === "true");
    }
    if (savedSelectedAlarm !== null) {
      setSelectedAlarm(Number.parseInt(savedSelectedAlarm, 10));
    }

    // 检查通知权限
    if ("Notification" in window) {
      const permission = Notification.permission;
      notificationPermissionRef.current = permission;
      setNotificationPermission(permission);
      if (permission === "default") {
        Notification.requestPermission().then((permission) => {
          notificationPermissionRef.current = permission;
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  // 同步ref值
  useEffect(() => {
    enableAlarmRef.current = enableAlarm;
  }, [enableAlarm]);

  useEffect(() => {
    selectedAlarmRef.current = selectedAlarm;
  }, [selectedAlarm]);

  // 保存设置到localStorage
  useEffect(() => {
    localStorage.setItem("timer-enable-alarm", String(enableAlarm));
  }, [enableAlarm]);

  useEffect(() => {
    localStorage.setItem("timer-selected-alarm", String(selectedAlarm));
  }, [selectedAlarm]);

  // 播放闹铃
  const playAlarm = () => {
    if (!enableAlarmRef.current) return;

    const selectedAlarmFile = ALARM_OPTIONS.find(
      (opt) => opt.id === selectedAlarmRef.current
    )?.file;

    if (selectedAlarmFile && audioRef.current) {
      audioRef.current.src = selectedAlarmFile;
      audioRef.current.loop = true;
      audioRef.current.play().catch((error) => {
        console.error("播放闹铃失败:", error);
      });
    }
  };

  // 停止闹铃
  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // 发送系统通知
  const sendNotification = () => {
    if (!enableAlarmRef.current) return;

    if (
      "Notification" in window &&
      notificationPermissionRef.current === "granted"
    ) {
      new Notification("定时器", {
        body: "时间到了！",
        icon: "/favicon.ico",
        tag: "timer-finished",
      });
    } else if (
      "Notification" in window &&
      notificationPermissionRef.current === "default"
    ) {
      Notification.requestPermission().then((permission) => {
        notificationPermissionRef.current = permission;
        setNotificationPermission(permission);
        if (permission === "granted") {
          new Notification("定时器", {
            body: "时间到了！",
            icon: "/favicon.ico",
            tag: "timer-finished",
          });
        }
      });
    }
  };

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            playAlarm();
            sendNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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
  }, [isRunning, remainingSeconds]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const addTime = (seconds: number) => {
    if (!isRunning && !isFinished) {
      setTotalSeconds((prev) => prev + seconds);
      setRemainingSeconds((prev) => prev + seconds);
    }
  };

  const start = () => {
    if (remainingSeconds > 0 && !isRunning) {
      setIsRunning(true);
      setIsFinished(false);
    }
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setRemainingSeconds(totalSeconds);
    stopAlarm();
  };

  const clear = () => {
    setIsRunning(false);
    setIsFinished(false);
    setTotalSeconds(0);
    setRemainingSeconds(0);
    stopAlarm();
  };

  const stopAlarmManually = () => {
    stopAlarm();
    setIsFinished(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 音频元素 */}
        <audio ref={audioRef} />

        {/* 返回按钮 */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
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
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md transition-all hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            设置
          </button>
        </div>

        {/* 主内容 */}
        <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center">
          <div className="w-full max-w-md text-center">
            <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              定时器
            </h1>

            {/* 时间显示 */}
            <div className="mb-8 rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800">
              <div className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                剩余时间
              </div>
              <div
                className={`font-mono text-5xl font-bold sm:text-6xl ${
                  isFinished
                    ? "text-red-600 dark:text-red-400 animate-pulse"
                    : remainingSeconds === 0
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-orange-600 dark:text-orange-400"
                }`}
              >
                {formatTime(remainingSeconds)}
              </div>
              {isFinished && (
                <div className="mt-4">
                  <div className="mb-2 text-lg font-semibold text-red-600 dark:text-red-400">
                    时间到！
                  </div>
                  <button
                    onClick={stopAlarmManually}
                    className="rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-600 active:scale-95"
                  >
                    停止闹铃
                  </button>
                </div>
              )}
            </div>

            {/* 设置面板 */}
            {showSettings && (
              <div className="mb-8 rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  闹铃设置
                </h3>

                {/* 闹铃开关 */}
                <div className="mb-6 flex items-center justify-between">
                  <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
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
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                    启用闹铃提醒
                  </label>
                  <button
                    onClick={() => setEnableAlarm(!enableAlarm)}
                    className={`relative h-7 w-12 rounded-full transition-colors ${
                      enableAlarm
                        ? "bg-orange-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                        enableAlarm ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* 闹铃选择 */}
                {enableAlarm && (
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      选择闹铃音效
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {ALARM_OPTIONS.map((alarm) => (
                        <button
                          key={alarm.id}
                          onClick={() => setSelectedAlarm(alarm.id)}
                          className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                            selectedAlarm === alarm.id
                              ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                              : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
                          }`}
                        >
                          {alarm.name}
                        </button>
                      ))}
                    </div>
                    {selectedAlarm && (
                      <button
                        onClick={() => {
                          const selectedAlarmFile = ALARM_OPTIONS.find(
                            (opt) => opt.id === selectedAlarm
                          )?.file;
                          if (selectedAlarmFile && audioRef.current) {
                            audioRef.current.src = selectedAlarmFile;
                            audioRef.current.play().catch((error) => {
                              console.error("播放预览失败:", error);
                            });
                          }
                        }}
                        className="mt-4 w-full rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        预览音效
                      </button>
                    )}
                  </div>
                )}

                {/* 通知权限提示 */}
                {enableAlarm && "Notification" in window && (
                  <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                    {notificationPermission === "granted" ? (
                      <span>✓ 系统通知已启用</span>
                    ) : notificationPermission === "denied" ? (
                      <span>⚠ 系统通知已被拒绝</span>
                    ) : (
                      <span>💡 允许通知权限以接收提醒</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 快速设置按钮 */}
            {!isRunning && !isFinished && totalSeconds === 0 && (
              <div className="mb-8 grid grid-cols-4 gap-3">
                {[
                  { label: "+1分", seconds: 60 },
                  { label: "+5分", seconds: 300 },
                  { label: "+10分", seconds: 600 },
                  { label: "+30分", seconds: 1800 },
                ].map((item) => (
                  <button
                    key={item.seconds}
                    onClick={() => addTime(item.seconds)}
                    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-md transition-all active:scale-95 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* 控制按钮 */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              {!isRunning ? (
                remainingSeconds > 0 && (
                  <button
                    onClick={start}
                    className="flex-1 rounded-2xl bg-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all active:scale-95 hover:bg-orange-600 active:shadow-md sm:flex-initial"
                  >
                    开始
                  </button>
                )
              ) : (
                <button
                  onClick={pause}
                  className="flex-1 rounded-2xl bg-yellow-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all active:scale-95 hover:bg-yellow-600 active:shadow-md sm:flex-initial"
                >
                  暂停
                </button>
              )}
              {remainingSeconds > 0 && (
                <button
                  onClick={reset}
                  className="flex-1 rounded-2xl bg-gray-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all active:scale-95 hover:bg-gray-600 active:shadow-md sm:flex-initial"
                >
                  重置
                </button>
              )}
              <button
                onClick={clear}
                className="flex-1 rounded-2xl bg-red-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all active:scale-95 hover:bg-red-600 active:shadow-md sm:flex-initial"
              >
                清空
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

