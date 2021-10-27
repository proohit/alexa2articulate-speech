import { parse } from './grammar.js';
let recognition;

document
  .getElementById('voiceRecognitionToggle')
  .addEventListener('click', startButton);
document
  .getElementById('langSelect')
  .addEventListener('change', handleLanguageChange);

function handleLanguageChange(event) {
  const value = event.target.value || event.currentTarget.value;
  if (value && recognition) {
    recognition.lang = value;
  }
}
const two_line = /\n\n/g;
const one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
if (!('webkitSpeechRecognition' in window)) {
} else {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'de-de';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = function (event) {
    let interim_transcript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }

    document.getElementById('interim').innerHTML =
      linebreak(interim_transcript);

    if (finalTranscript) {
      try {
        finalTranscript = finalTranscript.toLowerCase();
        const res = parse(finalTranscript);
        res.execute();
      } finally {
        finalTranscript = '';
      }
    }
  };
  recognition.onerror = function (event) {
    //This prevents stopping of the recognition
  };
  recognition.onend = function (event) {
    //This prevents stopping of the recognition
    recognition.start();
  };
}

let finalTranscript = '';
let started = false;

function startButton(event) {
  if (recognition) {
    if (started) {
      recognition.stop();
      started = false;
    } else {
      recognition.start();
      started = true;
    }
  } else {
    throw new MediaError();
  }
}
