let recognizer = null;
let audioContext = null;
let audioSourceNode = null;
let mediaStream = null;
let model = null;
const player = GetPlayer();
let spaceBarPressed = false;

let activeGrammar = "named";
let grammar;
const grammarCache = { named: "", unnamed: "" };
initSTT();

function initSTT() {
  loadGrammar(activeGrammar).then((g) => (grammar = g));
  registerKeyboardShortcuts();
}

function triggeredShortcut(event) {
  const modifier = SPEECH_CONFIG.pushToTalkCombination.modifier;
  const key = SPEECH_CONFIG.pushToTalkCombination.key;
  const hasModifier = !!modifier;
  if (hasModifier) {
    return event[modifier] && event.key === key;
  }
  return event.key === key;
}

function registerKeyboardShortcuts() {
  document.addEventListener("keydown", async (event) => {
    if (triggeredShortcut(event)) {
      if (!spaceBarPressed) {
        spaceBarPressed = true;
        activeGrammar = "unnamed";
        grammar = await loadGrammar(activeGrammar);
        player.SetVar(VAR_STT_ACTIVE, true);
        player.SetVar(VAR_STT_ENABLED, true);
      }
    }
  });

  document.addEventListener("keyup", async (event) => {
    if (triggeredShortcut(event)) {
      spaceBarPressed = false;
      activeGrammar = "named";
      grammar = await loadGrammar(activeGrammar);
      player.SetVar(VAR_STT_ENABLED, false);
      player.SetVar(VAR_STT_ACTIVE, false);
    }
  });
}

function handleFinalResult(message) {
  const assistantName = player.GetVar(VAR_ASSISTANT_NAME).toLowerCase();
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
      player.SetVar(VAR_SPOKEN_TEXT, hyp);
      hyp = hyp.toLowerCase();
      hyp = removePunctuation(hyp);
      hyp = replaceAlternatives(SPEECH_CONFIG.wordlist, hyp);
      console.debug("recognized text", hyp);
      const res = grammar.parse(hyp);
      res.execute();
    }
  } finally {
    player.SetVar(VAR_SPOKEN_TEXT, "");
    player.SetVar(VAR_STT_ACTIVE, false);
  }
}

function handlePartialResult(message) {
  const hyp = message.result.partial;
  const assistantName = player.GetVar(VAR_ASSISTANT_NAME).toLowerCase();
  if (
    hyp &&
    (hyp.toLowerCase().includes(assistantName) || activeGrammar === "unnamed")
  ) {
    player.SetVar(VAR_STT_ACTIVE, true);
    player.SetVar(VAR_SPOKEN_TEXT, hyp);
  }
}

function createRecognizer(model, sampleRate, wordlist) {
  const rec = new model.KaldiRecognizer(sampleRate, wordlist);
  rec.setWords(true);
  rec.on("result", handleFinalResult);
  rec.on("partialresult", handlePartialResult);
  return rec;
}

async function startSTT() {
  if (recognizer === null) {
    enableLoading();
    updateLoadingText("Loading recognizer...");
    const channel = new MessageChannel();
    model = await Vosk.createModel(SPEECH_CONFIG.modelPath);
    model.setLogLevel(-2);
    model.registerPort(channel.port1);

    const sampleRate = 48000;
    recognizer = createRecognizer(
      model,
      sampleRate,
      JSON.stringify(SPEECH_CONFIG.wordlist.flat())
    );
    updateLoadingText("Loading microphone...");
    mediaStream = await getMicrophoneStream(sampleRate);
    updateLoadingText("Connecting audio module...");
    audioContext = await initializeAudioContext();
    const recognizerProcessor = initializeRecognizerProcessor(
      audioContext,
      channel,
      recognizer.id
    );
    audioSourceNode = audioContext.createMediaStreamSource(mediaStream);
    audioSourceNode.connect(recognizerProcessor);
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

function stopSTT() {
  console.debug("Stop STT");
  player.SetVar(VAR_SPOKEN_TEXT, "");
  mediaStream.getTracks().forEach((track) => track.stop());
  if (model) {
    model.terminate();
    model = null;
  }
  if (audioSourceNode) {
    audioSourceNode.disconnect();
    audioSourceNode = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  if (recognizer) {
    recognizer.remove();
    recognizer = null;
  }
}
