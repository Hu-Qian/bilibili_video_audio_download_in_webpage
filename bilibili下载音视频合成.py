import os
import re
import subprocess

def rename_m4s_to_mp4(folder):
    for file in os.listdir(folder):
        if file.endswith(".m4s"):
            old = os.path.join(folder, file)
            new = os.path.join(folder, file.replace(".m4s", ".mp4"))
            os.rename(old, new)

def group_video_audio_files(folder):
    pattern = re.compile(r"^(\d+)-1-(\d+).mp4$")
    groups = {}

    for file in os.listdir(folder):
        match = pattern.match(file)
        if match:
            key = match.group(1)
            track_id = match.group(2)
            if key not in groups:
                groups[key] = []
            groups[key].append(file)
    print(groups)
    return groups

def merge_and_extract(folder, ffmpeg_path="ffmpeg"):
    rename_m4s_to_mp4(folder)
    groups = group_video_audio_files(folder)

    for key, files in groups.items():
        if len(files) < 2:
            continue  # 需要至少视频和音频各一个

        video_file = None
        audio_file = None

        # 简单逻辑：较大的编号一般是视频（可能需要根据实际调整）
        if int(files[0].split('-')[-1].split('.')[0]) > int(files[1].split('-')[-1].split('.')[0]):
            video_file = files[0]
            audio_file = files[1]
        else:
            video_file = files[1]
            audio_file = files[0]

        video_path = os.path.join(folder, video_file)
        audio_path = os.path.join(folder, audio_file)
        output_mp4 = os.path.join(folder, f"video_{key}.mp4")
        output_mp3 = os.path.join(folder, f"audio_{key}.mp3")

        print(f"🎬 合并视频音频为：{output_mp4}")
        subprocess.run([
            ffmpeg_path, "-y", "-i", video_path, "-i", audio_path,
            "-c:v", "copy", "-c:a", "copy", output_mp4
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        print(f"🎧 提取音频为：{output_mp3}")
        subprocess.run([
            ffmpeg_path, "-y", "-i", output_mp4,
            "-q:a", "0", "-map", "a", output_mp3
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        os.remove(video_path)
        os.remove(audio_path)
        print(f"🧹 删除原始片段文件：{video_file}, {audio_file}")

if __name__ == "__main__":
    merge_and_extract(".")
