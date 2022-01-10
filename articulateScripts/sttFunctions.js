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

async function startSTT() {
  let textDataBase = "";
  let textData = "";
  let results = [];
  let currentIndex = 0;
  if (recognizer === null) {
    const channel = new MessageChannel();
    const model = await Vosk.createModel(
      "commandsGrammar/vosk-model-small-de-0.15.tar.gz"
    );
    model.registerPort(channel.port1);

    const sampleRate = 48000;

    recognizer = new model.KaldiRecognizer(
      sampleRate,
      JSON.stringify([
        "alexa",
        "bibi",
        "harry",
        "navigate",
        "to",
        "geh",
        "gehe",
        "befehle",
        "hilfe",
        "weiter",
        "zurück",
        "navigiere",
        "zu",
        "recherche",
        "test",
        "on",
        "ein",
        "off",
        "schalte",
        "turn",
        "voice",
        "sprache",
        "wähle",
        "selektiere",
        "klicke",
        "klick",
        "site map",
        "sprach assistent",
        "recherche tipps",
        "grundlagen des wissenschaftlichen arbeitens",
        "basis funktionen",
        "such tools",
        "such strategie",
        "qualität",
        "a",
        "b",
        "c",
        "d",
        "eins",
        "zwei",
        "drei",
        "vier",
        "fünf",
        "bestätigen",
        "quiz",
        "videos",
        "video",
        "spiele",
        "spiel",
        "halte",
        "stoppe",
        "stop",
        "play",
        "pause",
        "pausiere",
        "antwort",
        "auswählen",
        "abwählen",
        "einstellungen",
        "impressum",
        "abbrechen",
        "beenden",
        "stoppen",
        "wechsle zu",
      ])
    );
    recognizer.setWords(true);
    recognizer.on("result", (message) => {
      const assistantName = player.GetVar("assistantName").toLowerCase();
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
