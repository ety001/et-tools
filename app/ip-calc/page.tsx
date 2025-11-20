"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    calculateIPv4Subnet,
    expandIPv6,
    compressIPv6,
    IPv4Result,
} from "./utils";

export default function IPCalcPage() {
    const [activeTab, setActiveTab] = useState<"ipv4" | "ipv6">("ipv4");

    // IPv4 State
    const [ipv4Address, setIpv4Address] = useState("192.168.1.1");
    const [ipv4Cidr, setIpv4Cidr] = useState(24);
    const [ipv4Result, setIpv4Result] = useState<IPv4Result | null>(null);

    // IPv6 State
    const [ipv6Address, setIpv6Address] = useState("");
    const [ipv6Expanded, setIpv6Expanded] = useState("");
    const [ipv6Compressed, setIpv6Compressed] = useState("");
    const [ipv6Error, setIpv6Error] = useState("");

    useEffect(() => {
        if (activeTab === "ipv4") {
            const result = calculateIPv4Subnet(ipv4Address, ipv4Cidr);
            setIpv4Result(result);
        }
    }, [ipv4Address, ipv4Cidr, activeTab]);

    useEffect(() => {
        if (activeTab === "ipv6") {
            if (!ipv6Address) {
                setIpv6Expanded("");
                setIpv6Compressed("");
                setIpv6Error("");
                return;
            }
            const expanded = expandIPv6(ipv6Address);
            if (expanded === "Invalid IPv6 Address") {
                setIpv6Error(expanded);
                setIpv6Expanded("");
                setIpv6Compressed("");
            } else {
                setIpv6Error("");
                setIpv6Expanded(expanded);
                setIpv6Compressed(compressIPv6(ipv6Address));
            }
        }
    }, [ipv6Address, activeTab]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
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

                {/* Main Content */}
                <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-start pt-10">
                    <div className="w-full max-w-2xl">
                        <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                            IP 计算器
                        </h1>

                        {/* Tabs */}
                        <div className="mb-8 flex justify-center space-x-4">
                            <button
                                onClick={() => setActiveTab("ipv4")}
                                className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${activeTab === "ipv4"
                                        ? "bg-blue-600 text-white shadow-lg"
                                        : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    }`}
                            >
                                IPv4 子网计算
                            </button>
                            <button
                                onClick={() => setActiveTab("ipv6")}
                                className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${activeTab === "ipv6"
                                        ? "bg-blue-600 text-white shadow-lg"
                                        : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    }`}
                            >
                                IPv6 压缩/展开
                            </button>
                        </div>

                        {/* IPv4 Calculator */}
                        {activeTab === "ipv4" && (
                            <div className="rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            IP 地址
                                        </label>
                                        <input
                                            type="text"
                                            value={ipv4Address}
                                            onChange={(e) => setIpv4Address(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                            placeholder="192.168.1.1"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            子网掩码 (CIDR)
                                        </label>
                                        <select
                                            value={ipv4Cidr}
                                            onChange={(e) => setIpv4Cidr(Number(e.target.value))}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        >
                                            {Array.from({ length: 33 }, (_, i) => (
                                                <option key={i} value={i}>
                                                    /{i}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {ipv4Result && !ipv4Result.error && (
                                    <div className="mt-8 grid gap-4 rounded-xl bg-gray-50 p-6 dark:bg-gray-700/50">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    网络地址
                                                </div>
                                                <div className="font-mono font-medium text-gray-900 dark:text-white">
                                                    {ipv4Result.network}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    广播地址
                                                </div>
                                                <div className="font-mono font-medium text-gray-900 dark:text-white">
                                                    {ipv4Result.broadcast}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    子网掩码
                                                </div>
                                                <div className="font-mono font-medium text-gray-900 dark:text-white">
                                                    {ipv4Result.mask}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    可用主机数
                                                </div>
                                                <div className="font-mono font-medium text-gray-900 dark:text-white">
                                                    {ipv4Result.hosts.toLocaleString()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    第一个可用 IP
                                                </div>
                                                <div className="font-mono font-medium text-gray-900 dark:text-white">
                                                    {ipv4Result.firstIP}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    最后一个可用 IP
                                                </div>
                                                <div className="font-mono font-medium text-gray-900 dark:text-white">
                                                    {ipv4Result.lastIP}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {ipv4Result?.error && (
                                    <div className="mt-4 text-center text-red-500">
                                        {ipv4Result.error}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* IPv6 Calculator */}
                        {activeTab === "ipv6" && (
                            <div className="rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800">
                                <div className="mb-6">
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        IPv6 地址
                                    </label>
                                    <input
                                        type="text"
                                        value={ipv6Address}
                                        onChange={(e) => setIpv6Address(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="2001:db8::1"
                                    />
                                </div>

                                {ipv6Error ? (
                                    <div className="text-center text-red-500">{ipv6Error}</div>
                                ) : (
                                    ipv6Address && (
                                        <div className="space-y-6">
                                            <div>
                                                <div className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    压缩格式
                                                </div>
                                                <div className="rounded-lg bg-gray-50 p-4 font-mono text-gray-900 dark:bg-gray-700/50 dark:text-white break-all">
                                                    {ipv6Compressed}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    展开格式
                                                </div>
                                                <div className="rounded-lg bg-gray-50 p-4 font-mono text-gray-900 dark:bg-gray-700/50 dark:text-white break-all">
                                                    {ipv6Expanded}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
