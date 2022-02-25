let recognizer = null;
const player = GetPlayer();
let spaceBarPressed = false;

let activeGrammar = "named";
let grammar;
const grammarCache = { named: "", unnamed: "" };
loadGrammar(activeGrammar).then((g) => (grammar = g));

document.addEventListener("keydown", (event) => {
  if (
    event[SPEECH_CONFIG.pushToTalkCombination.modifier] &&
    event.key === SPEECH_CONFIG.pushToTalkCombination.key
  ) {
    if (!spaceBarPressed) {
      spaceBarPressed = true;
      activeGrammar = "unnamed";
      loadGrammar(activeGrammar).then((g) => (grammar = g));
      player.SetVar("sttIsActive", true);
      player.SetVar("sttEnabled", true);
    }
  }
});

document.addEventListener("keyup", (event) => {
  if (
    event[SPEECH_CONFIG.pushToTalkCombination.modifier] &&
    event.key === SPEECH_CONFIG.pushToTalkCombination.key
  ) {
    spaceBarPressed = false;
    activeGrammar = "named";
    loadGrammar(activeGrammar).then((g) => (grammar = g));
    player.SetVar("sttEnabled", false);
    player.SetVar("sttIsActive", false);
  }
});

async function startSTT() {
  if (recognizer === null) {
    const channel = new MessageChannel();
    const model = await Vosk.createModel(SPEECH_CONFIG.modelPath);
    model.registerPort(channel.port1);

    const sampleRate = 48000;
    recognizer = new model.KaldiRecognizer(
      sampleRate,
      JSON.stringify(SPEECH_CONFIG.wordlist)
    );
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
        if (
          hyp.toLowerCase().includes(assistantName) ||
          activeGrammar === "unnamed"
        ) {
          player.SetVar("spokenText", hyp);
          hyp = hyp.toLowerCase();
          hyp = removePunctuation(hyp);
          const res = grammar.parse(hyp);
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
      if (
        hyp &&
        (hyp.toLowerCase().includes(assistantName) ||
          activeGrammar === "unnamed")
      ) {
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
      SPEECH_CONFIG.recognizerProcessorPath
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

async function loadGrammar(grammarType) {
  console.log("Loading grammar ", grammarType);
  if (!grammarCache[grammarType]) {
    grammarCache[grammarType] = await (
      await fetch(SPEECH_CONFIG.grammarPath[grammarType])
    ).text();
  }
  return peggy.generate(grammarCache[grammarType]);
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
