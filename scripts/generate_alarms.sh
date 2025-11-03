#!/bin/bash
# 使用ffmpeg生成5个简单的闹铃音频文件（OGG格式）

OUTPUT_DIR="../public/alarms"
SAMPLE_RATE=44100

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

echo "正在生成闹铃音频文件..."

# 闹铃1: 传统滴滴声 (440Hz 和 554Hz 交替)
ffmpeg -f lavfi -i "sine=frequency=440:duration=0.25" -f lavfi -i "sine=frequency=554:duration=0.25" -filter_complex "[0:a][1:a]concat=n=4:v=0:a=1[out]" -map "[out]" -ar $SAMPLE_RATE -ac 1 -y "${OUTPUT_DIR}/alarm1.ogg" 2>/dev/null || {
  # 如果上面的方法失败，使用更简单的方法
  (echo "440Hz滴声"; sleep 0.25; echo "554Hz滴声"; sleep 0.25) | \
  ffmpeg -f lavfi -i "sine=frequency=440:duration=0.25" -f lavfi -i "sine=frequency=554:duration=0.25" \
         -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1[out]" -map "[out]" \
         -ar $SAMPLE_RATE -ac 1 -y "${OUTPUT_DIR}/alarm1.ogg" 2>/dev/null
}

# 闹铃2: 单音渐强渐弱 (523Hz C5)
ffmpeg -f lavfi -i "sine=frequency=523:duration=2" -af "afade=t=in:ss=0:d=0.5,afade=t=out:st=1.5:d=0.5" -ar $SAMPLE_RATE -ac 1 -y "${OUTPUT_DIR}/alarm2.ogg" 2>/dev/null

# 闹铃3: 快速重复音调 (660Hz E5)
ffmpeg -f lavfi -i "sine=frequency=660:duration=2" -af "tremolo=f=4:d=0.8" -ar $SAMPLE_RATE -ac 1 -y "${OUTPUT_DIR}/alarm3.ogg" 2>/dev/null

# 闹铃4: 和弦音效 (C大三和弦)
ffmpeg -f lavfi -i "sine=frequency=261:duration=0.3" -f lavfi -i "sine=frequency=329:duration=0.3" -f lavfi -i "sine=frequency=392:duration=0.3" \
       -filter_complex "[0:a][1:a][2:a]amix=inputs=3:duration=first" -ar $SAMPLE_RATE -ac 1 -y "${OUTPUT_DIR}/alarm4.ogg" 2>/dev/null

# 闹铃5: 上升音调
ffmpeg -f lavfi -i "sine=frequency=330:duration=1" -f lavfi -i "sine=frequency=660:duration=1" \
       -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1[out]" -map "[out]" \
       -ar $SAMPLE_RATE -ac 1 -y "${OUTPUT_DIR}/alarm5.ogg" 2>/dev/null

echo "✓ 已完成！音频文件已保存到 ${OUTPUT_DIR}/"

