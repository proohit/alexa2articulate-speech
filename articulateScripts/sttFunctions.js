const SCRIPTS_PATH_VAR = "scriptsPath";

let recognizer = null;
let player = GetPlayer();
let spaceBarPressed = false;

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    if (!spaceBarPressed) {
      spaceBarPressed = true;
      player.SetVar("sttEnabled", true);
      player.SetVar("sttIsActive", true);
    }
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    spaceBarPressed = false;
    player.SetVar("sttIsActive", false);
    player.SetVar("sttEnabled", false);
  }
});

const modelFilename = "/vosk-model-small-de-0.15.tar.gz";
const globalPath = "11-01-22-vosk-browser/" + player.GetVar(SCRIPTS_PATH_VAR);

let wordList;

async function startSTT() {
  if (recognizer === null) {
    const channel = new MessageChannel();
    const model = await Vosk.createModel(globalPath + modelFilename);
    if (!wordList) {
      wordList = await (await fetch("wordlist.json")).json();
    }
    model.registerPort(channel.port1);

    const sampleRate = 48000;
    recognizer = new model.KaldiRecognizer(sampleRate, wordList);
    recognizer.setWords(true);
    recognizer.on("result", (message) => {
      const assistantName = player.GetVar("assistantName").toLowerCase();
      const result = message.result;
      let hyp = result.text;
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
      try {
        if (hyp.toLowerCase().includes(assistantName)) {
          player.SetVar("spokenText", hyp);
          hyp = hyp.toLowerCase();
          hyp = removePunctuation(hyp);
          console.log(hyp);
          const res = peg$parse(hyp);
          console.log(res);
          res.execute();
        }
      } finally {
        player.SetVar("spokenText", "");
        player.SetVar("sttIsActive", false);
      }
    });
    recognizer.on("partialresult", (message) => {
      const hyp = message.result.partial;
      const assistantName = player.GetVar("assistantName").toLowerCase();
      if (hyp && hyp.toLowerCase().includes(assistantName)) {
        player.SetVar("sttIsActive", true);
        player.SetVar("spokenText", hyp);
      }
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
    await audioContext.audioWorklet.addModule(
      player.GetVar(SCRIPTS_PATH_VAR) + "/recognizer-processor.js"
    );
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

function removePunctuation(finalTranscript) {
  finalTranscript = finalTranscript.replace(",", "");
  finalTranscript = finalTranscript.replace(".", "");
  finalTranscript = finalTranscript.replace("!", "");
  finalTranscript = finalTranscript.replace("?", "");
  return finalTranscript;
}

function stopSTT() {
  console.log("Stop STT");
  if (recognizer) {
    recognizer.terminate();
    recognizer = null;
  }
}
