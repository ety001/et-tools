# 闹铃音频文件获取指南

## 方法1: 使用Python脚本生成（推荐）

项目包含了一个Python脚本可以自动生成5个简单的闹铃音效。

### 安装依赖

```bash
pip install soundfile numpy
```

### 运行脚本

```bash
cd scripts
python generate_alarms.py
```

脚本会在 `public/alarms/` 目录下生成5个OGG格式的音频文件。

---

## 方法2: 从免费资源网站下载

### 推荐的免费音频资源网站

1. **Pixabay** (https://pixabay.com/zh/sound-effects/)
   - 提供免版税音效
   - 可搜索 "alarm" 或 "bell"
   - 下载后转换为OGG格式

2. **Freesound.org** (https://freesound.org)
   - 大量免费音频资源
   - 需要注册账号
   - 使用CC0或CC-BY许可的音频

3. **Zapsplat** (https://www.zapsplat.com)
   - 免费注册后可下载
   - 提供各种音效

4. **耳聆网** (https://www.ear0.com)
   - 中文声音分享平台
   - 提供多种音效素材

### 下载和转换步骤

1. 从上述网站下载闹铃音效（通常为WAV或MP3格式）
2. 使用转换工具转换为OGG格式：
   
   **使用FFmpeg:**
   ```bash
   ffmpeg -i input.wav -c:a libvorbis output.ogg
   ```

   **使用Audacity:**
   - 打开音频文件
   - 文件 → 导出 → 导出为OGG

3. 将转换后的文件重命名为 `alarm1.ogg` 到 `alarm5.ogg`
4. 放置在 `public/alarms/` 目录下

---

## 方法3: 使用在线转换工具

1. 从任意网站下载闹铃音频（WAV/MP3格式）
2. 使用在线转换工具（如 CloudConvert, Zamzar）转换为OGG
3. 重命名并放置在正确目录

---

## 文件位置

所有闹铃音频文件应放置在：
```
public/alarms/
├── alarm1.ogg
├── alarm2.ogg
├── alarm3.ogg
├── alarm4.ogg
└── alarm5.ogg
```

---

## 注意事项

- 确保音频文件为OGG格式（.ogg扩展名）
- 建议音频时长在1-3秒之间，适合作为闹铃
- 如果使用第三方资源，请遵守相应的许可协议
- 音频文件大小建议控制在500KB以内，以提升加载速度

