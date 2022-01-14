// import { parse } from "../articulateScripts/grammar.js";
// let recognition;
// let debug = true;
document
  .getElementById("voiceRecognitionToggle")
  .addEventListener("click", startButton);
// document
//   .getElementById("langSelect")
//   .addEventListener("change", handleLanguageChange);

// function handleLanguageChange(event) {
//   const value = event.target.value || event.currentTarget.value;
//   if (value && recognition) {
//     recognition.lang = value;
//   }
// }

// if (!("webkitSpeechRecognition" in window)) {
// } else {
//   recognition = new webkitSpeechRecognition();
//   recognition.lang = "de-de";
//   recognition.continuous = true;
//   recognition.interimResults = true;
//   recognition.onresult = function (event) {
//     let interim_transcript = "";

//     for (let i = event.resultIndex; i < event.results.length; ++i) {
//       if (event.results[i].isFinal) {
//         finalTranscript += event.results[i][0].transcript;
//       } else {
//         interim_transcript += event.results[i][0].transcript;
//       }
//     }

//     document.getElementById("interim").innerHTML = interim_transcript;

//     if (finalTranscript) {
//       try {
//         finalTranscript = finalTranscript.toLowerCase();
//         const res = parse(finalTranscript);
//         res.execute();
//         if (debug) {
//           handleVoiceCommandDebug(res);
//         }
//       } finally {
//         finalTranscript = "";
//       }
//     }
//   };
//   recognition.onerror = function (event) {
//     //This prevents stopping of the recognition
//   };
//   recognition.onend = function (event) {
//     //This prevents stopping of the recognition
//     recognition.start();
//   };
// }

// function handleVoiceCommandDebug(command) {
//   resetTableStyles();
//   const commandName = command.constructor.name;
//   if (commandName.includes("Command")) {
//     markEntry(`${commandName}`);
//     const commandTrigger = command.trigger;
//     if (commandTrigger) {
//       markEntry(`${commandName}-${commandTrigger}`);
//     }
//     const commandSubject = command.subject;
//     if (commandSubject) {
//       markEntry(`${commandName}-${commandSubject}`);
//     }
//     const subjectName = command.name;
//     if (subjectName) {
//       document.getElementById(`${commandName}-name`).innerText = subjectName;
//       markEntry(`${commandName}-name`);
//     }
//     const commandToggleState = command.toggleState;
//     if (commandToggleState) {
//       markEntry(`${commandName}-${commandToggleState}`);
//     }
//     document.getElementById(commandName).scrollIntoView();
//   }
// }

// function resetTableStyles(element) {
//   if (element) {
//     if (element.style) {
//       element.style.backgroundColor = "";
//     }
//     if (element.childNodes.length > 0) {
//       element.childNodes.forEach(resetTableStyles);
//     }
//   } else {
//     const table = document.getElementById("speech-result");
//     if (table.childNodes.length > 0) {
//       table.childNodes.forEach(resetTableStyles);
//     }
//   }
// }

// function markEntry(name) {
//   document.getElementById(name).style.backgroundColor = "green";
// }

// let finalTranscript = "";
// let started = false;
function downloadScript(url) {
  return new Promise((resolve, reject) => {
    var script = document.createElement("script");
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

(async function () {
  await downloadScript("config.js");
})();

let textDataBase = "";
let textData = "";
let results = [];
let currentIndex = 0;
var recognizer = null;

async function startButton() {
  if (recognizer === null) {
    const channel = new MessageChannel();
    const model = await Vosk.createModel(SPEECH_CONFIG.modelPath);
    await downloadScript(SPEECH_CONFIG.wordlistPath);
    model.registerPort(channel.port1);

    const sampleRate = 48000;

    recognizer = new model.KaldiRecognizer(
      sampleRate,
      JSON.stringify(SPEECH_WORDLIST)
    );
    recognizer.setWords(true);

    recognizer.on("result", (message) => {
      const result = message.result;
      const hyp = result.text;
      if (!hyp) {
        return;
      }
      let score = 0;
      for (const res of result.result) {
        score += res.conf;
      }
      score /= result.result.length;
      console.log(`${score} on ${hyp}`);
      if (Number.isNaN(score) || score < 0.9) {
        return;
      }
      textDataBase = textDataBase + hyp + "\n";
      results.push(hyp);
      document.getElementById(
        "final"
      ).innerText = `FINAL RESULTS: ${results.join("\n")}`;
      currentIndex++;
      textDataBase = "";
      textData = "";
      document.getElementById("interim").innerText = textData;
    });
    recognizer.on("partialresult", (message) => {
      const hyp = message.result.partial;
      textData = textDataBase + hyp;
      document.getElementById("interim").innerText = textData;
    });

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
        sampleRate,
      },
    });

    const audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule("recognizer-processor.js");
    const recognizerProcessor = new AudioWorkletNode(
      audioContext,
      "recognizer-processor",
      { channelCount: 1, numberOfInputs: 1, numberOfOutputs: 1 }
    );
    recognizerProcessor.port.postMessage(
      { action: "init", recognizerId: recognizer.id },
      [channel.port2]
    );
    recognizerProcessor.connect(audioContext.destination);

    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(recognizerProcessor);
  }
}
