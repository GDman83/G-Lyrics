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

// 載入本地音訊
audioInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
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

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}