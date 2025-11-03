# 闹铃音频文件

此目录包含5个OGG格式的闹铃音频文件，用于定时器结束时的提醒音效。

## 已包含的音频文件

- ✅ alarm1.ogg - 传统滴滴声（440Hz/554Hz交替）
- ✅ alarm2.ogg - 渐强渐弱音效（523Hz C5）
- ✅ alarm3.ogg - 快速重复音调（660Hz E5）
- ✅ alarm4.ogg - 和弦音效（C大三和弦）
- ✅ alarm5.ogg - 上升音调（330Hz→660Hz）

## 重新生成音频文件

如果需要重新生成音频文件，可以使用以下两种方式：

### 方式1: 使用Shell脚本（推荐，无需额外依赖）

```bash
cd scripts
bash generate_alarms.sh
```

需要系统安装 `ffmpeg`。

### 方式2: 使用Python脚本

```bash
# 安装依赖（需要创建虚拟环境）
python3 -m venv venv
source venv/bin/activate
pip install soundfile numpy

# 运行脚本
cd scripts
python generate_alarms.py
```

## 其他获取方式

如果想使用自定义的音频文件，查看 `scripts/download_guide.md` 了解如何从免费资源网站下载音频并转换为OGG格式。
