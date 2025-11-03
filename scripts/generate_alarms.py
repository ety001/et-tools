#!/usr/bin/env python3
"""
生成5个简单的闹铃音频文件（OGG格式）
使用numpy和soundfile生成不同频率和节奏的闹铃声
"""

import os
import sys
import numpy as np

try:
    import soundfile as sf
except ImportError:
    print("错误: 需要安装 soundfile 库")
    print("请运行: pip install soundfile numpy")
    sys.exit(1)

# 输出目录
OUTPUT_DIR = "../public/alarms"
SAMPLE_RATE = 44100
DURATION = 2.0  # 每个音效2秒

def generate_alarm1():
    """生成闹铃1: 传统滴滴声"""
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION))
    # 440Hz 和 554Hz 的交替音调
    freq1, freq2 = 440, 554
    signal = np.zeros(len(t))
    for i in range(int(DURATION * 2)):
        start = int(i * SAMPLE_RATE / 2)
        end = int((i + 1) * SAMPLE_RATE / 2)
        if i % 2 == 0:
            signal[start:end] = np.sin(2 * np.pi * freq1 * t[start:end])
        else:
            signal[start:end] = np.sin(2 * np.pi * freq2 * t[start:end])
    
    # 添加包络防止爆音
    envelope = np.exp(-t * 0.5)
    signal = signal * envelope * 0.3
    return signal

def generate_alarm2():
    """生成闹铃2: 渐强渐弱音效"""
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION))
    # 523Hz (C5)
    freq = 523
    signal = np.sin(2 * np.pi * freq * t)
    
    # 渐强渐弱包络
    envelope = np.sin(np.linspace(0, np.pi * 4, len(t))) * 0.5 + 0.5
    signal = signal * envelope * 0.3
    return signal

def generate_alarm3():
    """生成闹铃3: 快速重复音调"""
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION))
    freq = 660  # E5
    signal = np.zeros(len(t))
    
    # 快速重复
    for i in range(8):
        start = int(i * SAMPLE_RATE * DURATION / 8)
        end = int((i + 0.5) * SAMPLE_RATE * DURATION / 8)
        signal[start:end] = np.sin(2 * np.pi * freq * t[start:end])
    
    envelope = np.exp(-t * 0.3)
    signal = signal * envelope * 0.3
    return signal

def generate_alarm4():
    """生成闹铃4: 和弦音效"""
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION))
    # C大三和弦: C(261), E(329), G(392)
    signal = (
        np.sin(2 * np.pi * 261 * t) +
        np.sin(2 * np.pi * 329 * t) +
        np.sin(2 * np.pi * 392 * t)
    )
    
    # 脉冲包络
    envelope = np.zeros(len(t))
    for i in range(int(DURATION * 2)):
        start = int(i * SAMPLE_RATE / 2)
        end = int(start + SAMPLE_RATE * 0.1)
        if end < len(envelope):
            envelope[start:end] = 1
    envelope = envelope * np.exp(-t * 0.5)
    
    signal = signal * envelope * 0.2
    return signal

def generate_alarm5():
    """生成闹铃5: 上升音调"""
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION))
    # 从330Hz上升到660Hz
    freq_start, freq_end = 330, 660
    freq = np.linspace(freq_start, freq_end, len(t))
    signal = np.sin(2 * np.pi * freq * t)
    
    envelope = np.exp(-t * 0.4)
    signal = signal * envelope * 0.3
    return signal

def main():
    # 创建输出目录
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("正在生成闹铃音频文件...")
    
    alarms = [
        (generate_alarm1, "alarm1.ogg"),
        (generate_alarm2, "alarm2.ogg"),
        (generate_alarm3, "alarm3.ogg"),
        (generate_alarm4, "alarm4.ogg"),
        (generate_alarm5, "alarm5.ogg"),
    ]
    
    for generator, filename in alarms:
        signal = generator()
        output_path = os.path.join(OUTPUT_DIR, filename)
        sf.write(output_path, signal, SAMPLE_RATE, format='OGG')
        print(f"✓ 已生成: {filename}")
    
    print(f"\n完成! 所有音频文件已保存到 {OUTPUT_DIR}/")

if __name__ == "__main__":
    main()

