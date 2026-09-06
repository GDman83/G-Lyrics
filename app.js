// 初始化 WaveSurfer
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F46E5',
  progressColor: '#818CF8',
  cursorColor: '#312E81',
  height: 80,
  responsive: true
});

const audioInput = document.getElementById('audio-input');
const playBtn = document.getElementById('play-btn');
const processBtn = document.getElementById('process-btn');
const timeDisplay = document.getElementById('time-display');
const lyricsContainer = document.getElementById('lyrics-container');
const downloadBtn = document.getElementById('download-btn');

let selectedFile = null;

// 載入本地音訊
audioInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile = file;
    const url = URL.createObjectURL(file);
    wavesurfer.load(url);
    playBtn.disabled = false;
    processBtn.disabled = false;
  }
});

// 播放 / 暫停
playBtn.addEventListener('click', () => {
  wavesurfer.playPause();
});

// 更新時間顯示
wavesurfer.on('audioprocess', () => {
  const current = formatTime(wavesurfer.getCurrentTime());
  const total = formatTime(wavesurfer.getDuration());
  timeDisplay.textContent = `${current} / ${total}`;
});

// 傳送至 Worker API 進行 Whisper 語音識別
processBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  processBtn.disabled = true;
  processBtn.textContent = 'AI 分析中，請稍候...';
  lyricsContainer.innerHTML = '<p class="placeholder">AI 正在辨識歌詞與對時中...</p>';

  try {
    const arrayBuffer = await selectedFile.arrayBuffer();
    
    // 呼叫 Cloudflare Worker
    const response = await fetch('https://gdgd001.sgv084988.workers.dev', {
      method: 'POST',
      body: arrayBuffer,
      headers: {
        'Content-Type': selectedFile.type || 'audio/mpeg'
      }
    });

    const result = await response.json();

    if (result.text) {
      lyricsContainer.innerHTML = `<p>${result.text.replace(/\n/g, '<br>')}</p>`;
      downloadBtn.disabled = false;
    } else if (result.vtt || result.segments) {
      lyricsContainer.innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
      downloadBtn.disabled = false;
    } else {
      lyricsContainer.innerHTML = '<p class="placeholder">辨識失敗，未回傳有效文字。</p>';
    }
  } catch (err) {
    console.error(err);
    lyricsContainer.innerHTML = `<p class="placeholder" style="color:red;">錯誤: ${err.message}</p>`;
  } finally {
    processBtn.disabled = false;
    processBtn.textContent = '傳送至 AI 分析';
  }
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}