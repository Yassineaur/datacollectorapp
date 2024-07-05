import Recorder from '../recorder.js';

let recorder;
let audioContext;
let audioChunks = [];

const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        recorder = new Recorder(source);

        recorder.record();
        console.log('Recording started...');
        document.getElementById('recordButton').disabled = true;
        document.getElementById('stopButton').disabled = false;
    } catch (error) {
        console.error('Error accessing the microphone', error);
    }
};

const stopRecording = () => {
    if (recorder) {
        recorder.stop();
        console.log('Recording stopped.');

        recorder.exportWAV((blob) => {
            const audioUrl = URL.createObjectURL(blob);
            console.log('Audio URL:', audioUrl);
            document.getElementById('audioPlayback').src = audioUrl;

            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64AudioData = reader.result.split(',')[1];
                document.getElementById('audioData').value = base64AudioData;
                console.log('Base64 Audio Data:', base64AudioData);
            };
        });
    }
    document.getElementById('recordButton').disabled = false;
    document.getElementById('stopButton').disabled = true;
};

document.getElementById('recordButton').addEventListener('click', startRecording);
document.getElementById('stopButton').addEventListener('click', stopRecording);