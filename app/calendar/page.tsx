"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import lunisolar from "lunisolar";
import { theGods } from "@lunisolar/plugin-thegods";

// 注册插件
lunisolar.extend(theGods);

// 星期标签
const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

// 天干
const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
// 地支
const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
// 生肖
const ZODIAC = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

// 农历月份名称
const LUNAR_MONTHS = ["", "正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];

// 将数字月份转换为中文月份名称（用于节日查找）
const formatLunarMonthForFestival = (month: number): string => {
  if (month >= 1 && month <= 12) {
    return LUNAR_MONTHS[month] + "月";
  }
  return `${month}月`;
};

// 将数字日期转换为中文日期（用于节日查找和显示）
const formatLunarDayForFestival = (day: number): string => {
  if (day === 1) return "初一";
  if (day === 2) return "初二";
  if (day === 3) return "初三";
  if (day === 4) return "初四";
  if (day === 5) return "初五";
  if (day === 6) return "初六";
  if (day === 7) return "初七";
  if (day === 8) return "初八";
  if (day === 9) return "初九";
  if (day === 10) return "初十";
  if (day === 11) return "十一";
  if (day === 12) return "十二";
  if (day === 13) return "十三";
  if (day === 14) return "十四";
  if (day === 15) return "十五";
  if (day === 16) return "十六";
  if (day === 17) return "十七";
  if (day === 18) return "十八";
  if (day === 19) return "十九";
  if (day === 20) return "二十";
  if (day === 21) return "廿一";
  if (day === 22) return "廿二";
  if (day === 23) return "廿三";
  if (day === 24) return "廿四";
  if (day === 25) return "廿五";
  if (day === 26) return "廿六";
  if (day === 27) return "廿七";
  if (day === 28) return "廿八";
  if (day === 29) return "廿九";
  if (day === 30) return "三十";
  return `${day}`;
};

// 将数字月份和日期转换为中文格式（用于UI显示）
const formatLunarDateForDisplay = (month: number, day: number): string => {
  const monthStr = formatLunarMonthForFestival(month);
  const dayStr = formatLunarDayForFestival(day);
  return `${monthStr}${dayStr}`;
};

// 传统节日映射
const TRADITIONAL_FESTIVALS: Record<string, string> = {
  "正月初一": "春节",
  "正月十五": "元宵节",
  "二月初二": "龙抬头",
  "五月初五": "端午节",
  "七月初七": "七夕",
  "七月十五": "中元节",
  "八月十五": "中秋节",
  "九月初九": "重阳节",
  "十月初一": "寒衣节",
  "十月十五": "下元节",
  "腊月初八": "腊八节",
  "腊月廿三": "小年",
  "腊月三十": "除夕",
};

// 公历节日映射
const SOLAR_FESTIVALS: Record<string, string> = {
  "01-01": "元旦",
  "02-14": "情人节",
  "03-08": "妇女节",
  "03-12": "植树节",
  "04-01": "愚人节",
  "05-01": "劳动节",
  "05-04": "青年节",
  "06-01": "儿童节",
  "07-01": "建党节",
  "08-01": "建军节",
  "09-10": "教师节",
  "10-01": "国庆节",
  "11-08": "记者节",
  "11-17": "学生日",
  "10-31": "万圣夜",
  "11-01": "万圣节",
  "11-27": "感恩节",
  "12-25": "圣诞节",
};

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [calendarDays, setCalendarDays] = useState<Array<{
    date: Date;
    isCurrentMonth: boolean;
    lunar: string;
    festival?: string;
    solarTerm?: string;
  }>>([]);

  // 生成日历数据
  useEffect(() => {
    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      lunar: string;
      festival?: string;
      solarTerm?: string;
    }> = [];

    // 获取当月第一天和最后一天
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    
    // 获取第一天是星期几（0=周日，转换为1=周一）
    const firstDayWeek = firstDay.getDay();
    const startOffset = firstDayWeek === 0 ? 6 : firstDayWeek - 1;

    // 获取上个月的最后几天
    const prevMonthLastDay = new Date(currentYear, currentMonth - 1, 0).getDate();
    
    // 添加上个月的日期
    for (let i = startOffset - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 2, prevMonthLastDay - i);
      const lsr = lunisolar(date);
      const lunarMonth = lsr.lunar.month;
      const lunarDay = lsr.lunar.day;
      const lunarStr = formatLunarDateForDisplay(lunarMonth, lunarDay);
      
      days.push({
        date,
        isCurrentMonth: false,
        lunar: lunarStr,
      });
    }

    // 添加当月的日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const lsr = lunisolar(date);
      const lunarMonth = lsr.lunar.month;
      const lunarDay = lsr.lunar.day;
      const lunarStr = formatLunarDateForDisplay(lunarMonth, lunarDay);
      
      // 检查节气
      const solarTerm = lsr.solarTerm?.name;
      
      // 检查传统节日（需要转换为中文格式）
      const lunarKey = formatLunarMonthForFestival(lunarMonth) + formatLunarDayForFestival(lunarDay);
      const traditionalFestival = TRADITIONAL_FESTIVALS[lunarKey];
      
      // 检查公历节日
      const solarKey = `${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const solarFestival = SOLAR_FESTIVALS[solarKey];
      
      const festival = traditionalFestival || solarFestival;
      
      days.push({
        date,
        isCurrentMonth: true,
        lunar: lunarStr,
        festival,
        solarTerm,
      });
    }

    // 添加下个月的日期，补齐42天（6周）
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const lsr = lunisolar(date);
      const lunarMonth = lsr.lunar.month;
      const lunarDay = lsr.lunar.day;
      const lunarStr = formatLunarDateForDisplay(lunarMonth, lunarDay);
      
      days.push({
        date,
        isCurrentMonth: false,
        lunar: lunarStr,
      });
    }

    setCalendarDays(days);
  }, [currentYear, currentMonth]);

  // 获取选中日期的详细信息
  const getSelectedDateInfo = () => {
    const lsr = lunisolar(selectedDate);
    const lunarMonth = lsr.lunar.month;
    const lunarDay = lsr.lunar.day;
    const lunarYear = lsr.lunar.year;
    
    // 天干地支年份
    const ganZhi = lsr.format("lY"); // 例如：乙巳年
    
    // 获取地支，计算生肖
    // 地支在 ganZhi 的第二个字符，需要从地支数组中找到索引
    const zhiChar = ganZhi.slice(-1); // 取最后一个字符（地支）
    const zhiIndex = ZHI.indexOf(zhiChar);
    const zodiac = zhiIndex >= 0 ? ZODIAC[zhiIndex] : "";
    
    // 宜忌事项（使用插件获取）
    let goodThings: string[] = [];
    let badThings: string[] = [];
    
    try {
      // 使用插件获取宜忌数据
      const theGods = lsr.theGods;
      if (theGods) {
        goodThings = theGods.getGoodActs(0) || [];
        badThings = theGods.getBadActs(0) || [];
      }
    } catch (error) {
      // 如果插件数据不可用，使用默认值
      goodThings = ["结婚", "出行", "打扫", "搬家", "搬新房", "动土", "栽种", "纳畜", "安葬", "修造", "拆卸"];
      badThings = ["买房", "安床"];
    }
    
    return {
      lunarStr: formatLunarDateForDisplay(lunarMonth, lunarDay),
      ganZhi,
      zodiac,
      goodThings,
      badThings,
    };
  };

  const selectedInfo = getSelectedDateInfo();

  // 计算距离2026年元旦的天数
  const getDaysUntilNewYear = () => {
    const newYear2026 = new Date(2026, 0, 1);
    const diffTime = newYear2026.getTime() - selectedDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    setSelectedDate(today);
  };

  const isToday = (date: Date) => {
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            万年历
          </h1>

          {/* 日历头部 */}
          <div className="mb-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
            <div className="flex items-center gap-4">
              {/* 年份选择 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentYear(currentYear - 1)}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={currentYear <= 1900}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number.parseInt(e.target.value, 10))}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {Array.from({ length: 301 }, (_, i) => 1900 + i).map((year) => (
                    <option key={year} value={year}>
                      {year}年
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setCurrentYear(currentYear + 1)}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={currentYear >= 2200}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* 月份选择 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number.parseInt(e.target.value, 10))}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {month}月
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleNextMonth}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 今天按钮 */}
            <button
              onClick={handleToday}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              今天
            </button>
          </div>

          {/* 日历网格 */}
          <div className="mb-6 rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
            {/* 星期标题 */}
            <div className="mb-2 grid grid-cols-7 gap-2">
              {WEEKDAYS.map((day, index) => (
                <div
                  key={day}
                  className={`text-center text-sm font-semibold ${
                    index >= 5 ? "text-red-500" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const isWeekendDay = isWeekend(day.date);
                const isSelectedDay = isSelected(day.date);
                const isTodayDay = isToday(day.date);

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`relative rounded-lg p-2 text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      !day.isCurrentMonth
                        ? "text-gray-400 dark:text-gray-600"
                        : isWeekendDay
                          ? "text-red-500 dark:text-red-400"
                          : "text-gray-900 dark:text-gray-100"
                    } ${
                      isSelectedDay
                        ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <div className="text-lg font-semibold">{day.date.getDate()}</div>
                    <div className="text-xs">{day.lunar}</div>
                    {day.festival && (
                      <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        {day.festival}
                      </div>
                    )}
                    {day.solarTerm && (
                      <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                        {day.solarTerm}
                      </div>
                    )}
                    {isTodayDay && !isSelectedDay && (
                      <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 详细信息 */}
          <div className="rounded-2xl bg-gray-100 p-6 dark:bg-gray-800">
            <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {selectedInfo.lunarStr}
            </div>
            <div className="mb-4 text-gray-700 dark:text-gray-300">
              {selectedInfo.ganZhi}年{selectedInfo.zodiac}
            </div>

            {/* 宜 */}
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="text-red-600 dark:text-red-400">■</span>
              <span className="text-gray-700 dark:text-gray-300">宜：</span>
              {selectedInfo.goodThings.map((thing, index) => (
                <span key={index} className="text-gray-700 dark:text-gray-300">
                  {thing}
                  {index < selectedInfo.goodThings.length - 1 && "·"}
                </span>
              ))}
            </div>

            {/* 忌 */}
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="text-gray-900 dark:text-gray-100">■</span>
              <span className="text-gray-700 dark:text-gray-300">忌：</span>
              {selectedInfo.badThings.map((thing, index) => (
                <span key={index} className="text-gray-700 dark:text-gray-300">
                  {thing}
                  {index < selectedInfo.badThings.length - 1 && "·"}
                </span>
              ))}
            </div>

            {/* 距离目标日期 */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>距离 2026年元旦 还有{getDaysUntilNewYear()}天</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

