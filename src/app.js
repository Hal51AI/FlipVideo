import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

const videoInput = document.getElementById("videoInput");
const videoOutput = document.getElementById('videoOutput');
const messageElem = document.getElementById("message")

/**
 * Asynchronously flips a video horizontally and displays the output.
*/
async function flipVideo() {
  const videoFile = videoInput.files[0];
  const { name } = videoFile;

  await ffmpeg.load({
    coreURL: await toBlobURL('ffmpeg-core.js', 'text/javascript'),
    wasmURL: await toBlobURL('ffmpeg-core.wasm', 'application/wasm'),
    workerURL: await toBlobURL('ffmpeg-core.worker.js', 'text/javascript'),
  });

  ffmpeg.writeFile(name, await fetchFile(videoFile));

  await ffmpeg.exec(['-i', name, "-vf", "hflip", "-c:a", "copy", 'output.mp4']);
  const data = await ffmpeg.readFile('output.mp4');

  videoOutput.style.display = 'block';
  videoOutput.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
  videoOutput.load();

  const downloadLink = document.createElement('a');

  downloadLink.classList.add('download-link');
  downloadLink.textContent = 'Download Video';
  downloadLink.download = name;
  downloadLink.href = videoOutput.src;

  document.body.appendChild(downloadLink);
}

ffmpeg.on('log', ({ message }) => {
  console.log(message);
});

ffmpeg.on('progress', ({ progress, time }) => {
  const completion = (progress * 100).toFixed(2);
  const t = (time / 1000000).toFixed(2);

  messageElem.innerHTML = `Progress: ${completion}%, Time: ${t}s`;

  if (Math.round(completion) === 100) {
    messageElem.innerHTML = "Complete! Please Wait a Moment for Video to Load!";
  }
});

videoInput.addEventListener('change', flipVideo);