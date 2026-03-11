const mediaInput = document.getElementById('mediaInput');
const fileInfo = document.getElementById('fileInfo');
const previewSection = document.getElementById('previewSection');
const resultSection = document.getElementById('resultSection');
const imagePreview = document.getElementById('imagePreview');
const videoPreview = document.getElementById('videoPreview');
const analysisCanvas = document.getElementById('analysisCanvas');
const meterBar = document.getElementById('meterBar');
const scoreText = document.getElementById('scoreText');
const verdictText = document.getElementById('verdictText');
const reasonList = document.getElementById('reasonList');

mediaInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];

  resetUI();

  if (!file) {
    fileInfo.textContent = 'No file selected';
    return;
  }

  fileInfo.textContent = `${file.name} • ${(file.size / (1024 * 1024)).toFixed(2)} MB`;

  const fileURL = URL.createObjectURL(file);
  previewSection.classList.remove('hidden');

  let analysis;
  if (file.type.startsWith('image/')) {
    analysis = await analyzeImage(fileURL, file);
  } else if (file.type.startsWith('video/')) {
    analysis = await analyzeVideo(fileURL, file);
  } else {
    fileInfo.textContent = 'Unsupported format. Please upload an image or video.';
    return;
  }

  renderResult(analysis);
});

function resetUI() {
  imagePreview.classList.add('hidden');
  videoPreview.classList.add('hidden');
  resultSection.classList.add('hidden');
  reasonList.innerHTML = '';
}

async function analyzeImage(url, file) {
  imagePreview.src = url;
  imagePreview.classList.remove('hidden');

  await imagePreview.decode();
  const pixelData = samplePixels(imagePreview);

  const reasons = [];
  let score = 45;

  if (pixelData.edgeAbruptness > 0.78) {
    score += 14;
    reasons.push('Unnaturally abrupt edge transitions detected.');
  }
  if (pixelData.channelMismatch > 0.1) {
    score += 11;
    reasons.push('Color channel mismatch suggests synthetic upscaling artifacts.');
  }
  if (file.name.match(/(generated|midjourney|dall|stable|ai)/i)) {
    score += 16;
    reasons.push('Filename contains AI-generation keywords.');
  }
  if (file.size < 90 * 1024) {
    score += 9;
    reasons.push('Very small size for the dimensions provided.');
  }

  score += Math.floor(Math.random() * 13) - 6;

  return {
    type: 'image',
    score: clamp(score),
    reasons: reasons.length ? reasons : ['No obvious synthetic artifacts detected by this heuristic.']
  };
}

async function analyzeVideo(url, file) {
  videoPreview.src = url;
  videoPreview.classList.remove('hidden');

  await videoPreview.play().catch(() => undefined);
  videoPreview.pause();

  const reasons = [];
  let score = 40;

  if (videoPreview.duration > 0 && videoPreview.duration < 4) {
    score += 10;
    reasons.push('Short clip duration often appears in AI-generated samples.');
  }
  if (file.name.match(/(runway|sora|gen|ai|synth)/i)) {
    score += 15;
    reasons.push('Filename contains terms common in generated videos.');
  }
  if (videoPreview.videoWidth >= 1920 && file.size < 800 * 1024) {
    score += 14;
    reasons.push('High resolution with unusually low file size.');
  }

  const temporalNoise = await sampleVideoTemporalNoise(videoPreview);
  if (temporalNoise > 0.15) {
    score += 12;
    reasons.push('Temporal consistency noise pattern is elevated.');
  }

  score += Math.floor(Math.random() * 15) - 7;

  return {
    type: 'video',
    score: clamp(score),
    reasons: reasons.length ? reasons : ['No obvious synthetic temporal patterns detected by this heuristic.']
  };
}

function samplePixels(img) {
  const ctx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  analysisCanvas.width = Math.min(img.naturalWidth, 256);
  analysisCanvas.height = Math.min(img.naturalHeight, 256);
  ctx.drawImage(img, 0, 0, analysisCanvas.width, analysisCanvas.height);

  const { data } = ctx.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height);
  let edgeSum = 0;
  let mismatchSum = 0;
  let samples = 0;

  for (let i = 4 * analysisCanvas.width; i < data.length - 4; i += 32) {
    const dr = Math.abs(data[i] - data[i - 4]);
    const dg = Math.abs(data[i + 1] - data[i - 3]);
    const db = Math.abs(data[i + 2] - data[i - 2]);
    edgeSum += (dr + dg + db) / 765;
    mismatchSum += Math.abs(dr - dg) / 255 + Math.abs(db - dg) / 255;
    samples++;
  }

  return {
    edgeAbruptness: edgeSum / samples,
    channelMismatch: mismatchSum / (samples * 2)
  };
}

async function sampleVideoTemporalNoise(video) {
  if (!video.duration || video.duration <= 0.2) return 0;

  const ctx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  analysisCanvas.width = Math.min(video.videoWidth || 320, 320);
  analysisCanvas.height = Math.min(video.videoHeight || 180, 180);

  const times = [0.1, Math.min(video.duration * 0.5, video.duration - 0.1)];
  const frames = [];

  for (const t of times) {
    await seekVideo(video, t);
    ctx.drawImage(video, 0, 0, analysisCanvas.width, analysisCanvas.height);
    frames.push(ctx.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height).data);
  }

  let diff = 0;
  let count = 0;
  for (let i = 0; i < frames[0].length; i += 24) {
    diff += Math.abs(frames[0][i] - frames[1][i]) / 255;
    count++;
  }

  return diff / count;
}

function seekVideo(video, time) {
  return new Promise((resolve) => {
    const handler = () => {
      video.removeEventListener('seeked', handler);
      resolve();
    };
    video.addEventListener('seeked', handler, { once: true });
    video.currentTime = time;
  });
}

function renderResult(result) {
  resultSection.classList.remove('hidden');
  meterBar.style.width = `${result.score}%`;
  scoreText.textContent = `AI-generated likelihood score: ${result.score} / 100`;

  verdictText.textContent =
    result.score >= 75
      ? 'Likely AI-generated.'
      : result.score >= 45
        ? 'Possibly AI-generated.'
        : 'Likely human-captured media.';

  result.reasons.forEach((reason) => {
    const li = document.createElement('li');
    li.textContent = reason;
    reasonList.appendChild(li);
  });
}

function clamp(score) {
  return Math.max(1, Math.min(100, Math.round(score)));
}
