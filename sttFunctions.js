let recognizer = null;
const player = GetPlayer();
let spaceBarPressed = false;

let activeGrammar = "named";
let grammar;
const grammarCache = { named: "", unnamed: "" };
loadGrammar(activeGrammar).then((g) => (grammar = g));

document.addEventListener("keydown", async (event) => {
  if (
    event[SPEECH_CONFIG.pushToTalkCombination.modifier] &&
    event.key === SPEECH_CONFIG.pushToTalkCombination.key
  ) {
    if (!spaceBarPressed) {
      spaceBarPressed = true;
      activeGrammar = "unnamed";
      grammar = await loadGrammar(activeGrammar);
      player.SetVar("sttActive", true);
      player.SetVar("sttEnabled", true);
    }
  }
});

document.addEventListener("keyup", async (event) => {
  if (
    event[SPEECH_CONFIG.pushToTalkCombination.modifier] &&
    event.key === SPEECH_CONFIG.pushToTalkCombination.key
  ) {
    spaceBarPressed = false;
    activeGrammar = "named";
    grammar = await loadGrammar(activeGrammar);
    player.SetVar("sttEnabled", false);
    player.SetVar("sttActive", false);
  }
});

async function startSTT() {
  if (recognizer === null) {
    enableLoading();
    updateLoadingText("Loading recognizer...");
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
      console.debug(`${score} on ${hyp}`);
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
        player.SetVar("sttActive", false);
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
        player.SetVar("sttActive", true);
        player.SetVar("spokenText", hyp);
      }
    });

    updateLoadingText("Loading microphone...");
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
        sampleRate,
      },
    });

    updateLoadingText("Connecting audio module...");
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
    disableLoading();
  }
}

async function loadGrammar(grammarType) {
  enableLoading();
  updateLoadingText("Loading grammar...");
  console.debug("Loading grammar", grammarType);
  if (!grammarCache[grammarType]) {
    grammarCache[grammarType] = await (
      await fetch(SPEECH_CONFIG.grammarPath[grammarType])
    ).text();
  }
  disableLoading();
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
  console.debug("Stop STT");
  if (recognizer) {
    recognizer.terminate();
    recognizer = null;
  }
}

function enableLoading() {
  const hasContainer = document.querySelector(".loading-text");
  if (hasContainer) {
    return;
  }
  const container = document.createElement("div");
  container.classList = "loading";
  const wheel = document.createElement("div");
  wheel.classList = "spinner";
  const text = document.createElement("div");
  text.classList = "loading-text";
  text.innerText = "Loading...";
  container.appendChild(wheel);
  container.appendChild(text);
  document.body.appendChild(container);
}

function updateLoadingText(text) {
  const container = document.querySelector(".loading-text");
  if (container) {
    container.innerText = text;
  }
}

function disableLoading() {
  const container = document.querySelector(".loading");
  if (container) {
    container.remove();
  }
}
