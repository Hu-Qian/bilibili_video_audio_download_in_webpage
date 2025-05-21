(async () => {
  try {
    const title = document.querySelector("header title")?.textContent?.trim() || "bilibili_audio";

    const playinfo = window.__playinfo__;
    if (!playinfo || !playinfo.data || !playinfo.data.dash) {
      console.error("未找到 playinfo 数据。");
      return;
    }

    const dash = playinfo.data.dash;

    // 准备音频 URL 列表
    let urls = [];
    let filename = "";
    let audioType = "";

    console.log("dash keys:", Object.keys(dash || {}));

    if (dash.flac?.audio?.baseUrl) {
      console.log("✅ 发现 FLAC 无损音频，将优先下载。");
      urls.push(dash.flac.audio.baseUrl, ...(dash.flac.audio.backupUrl || []));
      filename = `${title}_audio.flac`;  // 实际上仍可能是 MP4 封装
      audioType = ".flac";
    } else if (dash.audio?.[0]?.baseUrl) {
      console.log("⚠️ 未发现 FLAC，使用 AAC 音频。");
      const audio = dash.audio[0];
      urls.push(audio.baseUrl, ...(audio.backupUrl || []));
      filename = `${title}_audio.aac`;
      audioType = ".mp4 或 .mp3";
    } else {
      console.error("❌ 未找到任何可下载的音频。");
      return;
    }

    console.log(`音频链接列表：${urls}`)

    console.log(`🎵 音频类型：${audioType}`);

    // 获取真实文件名（可选）
    async function getFilenameFromUrl(url) {
      try {
        const res = await fetch(url, { method: "HEAD" });
        const disposition = res.headers.get("Content-Disposition");
        if (disposition) {
          const match = disposition.match(/filename="?(.+?)"?$/);
          if (match) return decodeURIComponent(match[1]);
        }
      } catch (_) {}
      return null;
    }

    // 下载逻辑
    async function tryDownload(urls, fallbackFilename) {
      for (const url of urls) {
        try {
          const res = await fetch(url, { method: "HEAD" });
          if (res.ok) {
            const realFilename = await getFilenameFromUrl(url);
            if (realFilename) {
              console.log(`▶️ 将下载文件：${realFilename}`);
            } else {
              console.log(`▶️ 使用浏览器默认名称下载：${fallbackFilename}`);
            }

            const a = document.createElement("a");
            a.href = url;
            a.download = fallbackFilename;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return true;
          }
        } catch (_) {
          continue;
        }
      }
      return false;
    }

    const success = await tryDownload(urls, filename);
    if (success) {
      console.log(`✅ 音频已触发下载。请将音频文件的后缀修改为 ${audioType} 后即可正常播放。`);
    } else {
      console.error("❌ 下载失败，所有音频链接都无法使用。");
    }

  } catch (e) {
    console.error("发生错误：", e);
  }
})();
