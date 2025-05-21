(async () => {
  try {
    const title = document.querySelector("header title")?.textContent?.trim() || "bilibili_video";

    const playinfo = window.__playinfo__;
    if (!playinfo?.data?.dash?.video?.length || !playinfo.data.dash.audio?.length) {
      console.error("找不到视频或音频信息。");
      return;
    }

    // 按照 height 从大到小排序视频
    const videos = [...playinfo.data.dash.video].sort((a, b) => b.height - a.height);
    // 按照 bandwidth 从大到小排序音频
    const audios = [...playinfo.data.dash.audio].sort((a, b) => b.bandwidth - a.bandwidth);

    // 下载视频（用 window.open），只尝试 height <= 1080 的视频
    let videoUrl = null;
    let videoHeight = null;
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      if (v.height > 1080) continue; // 跳过超过1080p的视频
      try {
        const res = await fetch(v.baseUrl, { method: "HEAD" });
        if (res.ok) {
          videoUrl = v.baseUrl;
          videoHeight = v.height;
          window.open(videoUrl, '_blank');
          console.log(`✅ 已打开视频链接 (${videoHeight}p)：${videoUrl}`);
          break;
        }
      } catch (_) {}
    }

    // 下载音频（用 window.open）
    let audioUrl = null;
    for (let i = 0; i < audios.length; i++) {
      const a = audios[i];
      try {
        const res = await fetch(a.baseUrl, { method: "HEAD" });
        if (res.ok) {
          audioUrl = a.baseUrl;
          window.open(audioUrl, '_blank');
          console.log(`✅ 已打开音频链接（${a.codecs || 'unknown'}，${a.bandwidth}bps）：${audioUrl}`);
          break;
        }
      } catch (_) {}
    }

    if (videoUrl && videoHeight) {
      console.log(`🎬 视频清晰度：${videoHeight}p`);
    }

    if (!videoUrl) {
      console.error("❌ 未能成功打开任何视频流。");
    }

    if (!audioUrl) {
      console.error("❌ 未能成功打开任何音频流。");
    }

    if (videoUrl && audioUrl) {
      console.log("📥 视频和音频下载链接已打开，请把下载好的m4s文件放到和 bilibili下载音视频合成.exe 同一文件夹中。");
    }

  } catch (e) {
    console.error("发生错误：", e);
  }
})();
