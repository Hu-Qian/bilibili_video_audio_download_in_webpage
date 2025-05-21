(async () => {
  try {
    const title = document.querySelector("header title")?.textContent?.trim() || "bilibili_audio";

    const playinfo = window.__playinfo__;
    if (!playinfo?.data?.dash?.audio?.length) {
      console.error("找不到音频信息。");
      return;
    }

    const audios = playinfo.data.dash.audio;

    // 获取真实文件名（可选）
    async function getFilenameFromUrl(url) {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        const disposition = res.headers.get("Content-Disposition");
        if (disposition) {
          const match = disposition.match(/filename="?(.+?)"?$/);
          if (match) {
            return decodeURIComponent(match[1]);
          }
        }
      } catch (_) {}
      return null;
    }

    // 下载音频函数，尝试 baseUrl 和 backupUrl
    async function tryDownload(urls, fallbackFilename) {
      for (const url of urls) {
        try {
          const res = await fetch(url, { method: "HEAD" });
          if (res.ok) {
            const realFilename = await getFilenameFromUrl(url);
            if (realFilename) {
              console.log(`将下载文件（服务器设定）：${realFilename}`);
            } else {
              console.log(`文件将使用浏览器默认名称下载：${fallbackFilename}`);
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

    // 尝试下载第一个可用音频
    let audioDownloaded = false;
    for (let i = 0; i < audios.length; i++) {
      const a = audios[i];
      const urls = [a.baseUrl, ...(a.backupUrl || [])];
      const filename = `${title}.mp3`;  // 先用.aac或.fake扩展名，提示用户改成.mp4
      const success = await tryDownload(urls, filename);
      if (success) {
        audioDownloaded = true;
        break;
      }
    }

    if (audioDownloaded) {
      console.log("✅ 音频已触发下载。请将音频文件的后缀修改为 .mp4 或 .mp3 后即可正常播放。");
    } else {
      console.error("❌ 未能成功下载任何音频流。");
    }

  } catch (e) {
    console.error("发生错误：", e);
  }
})();
