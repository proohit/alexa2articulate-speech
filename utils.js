function enableLoading() {
  const hasContainer = document.querySelector(SELECTOR_LOADING_TEXT);
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
  const container = document.querySelector(SELECTOR_LOADING_TEXT);
  if (container) {
    container.innerText = text;
  }
}

function disableLoading() {
  const container = document.querySelector(SELECTOR_LOADING);
  if (container) {
    container.remove();
  }
}

function removePunctuation(finalTranscript) {
  finalTranscript = finalTranscript.replace(",", "");
  finalTranscript = finalTranscript.replace(".", "");
  finalTranscript = finalTranscript.replace("!", "");
  finalTranscript = finalTranscript.replace("?", "");
  return finalTranscript;
}

function replaceAlternatives(allWords, word) {
  let temp = word + "";
  const altLists = allWords.filter((words) => Array.isArray(words));
  const matchedAltLists = altLists.filter((altList) =>
    altList.some((altWord) => temp.includes(altWord))
  );

  for (const altList of matchedAltLists) {
    for (const altWord of altList) {
      const isWordAlreadyDirectlyDefined = allWords.includes(altWord);
      const isWordAlreadyIndirectlyDefined = allWords
        .filter((words) => !Array.isArray(words))
        .some((word) => word.includes(altWord));
      const ignoreWord =
        isWordAlreadyDirectlyDefined || isWordAlreadyIndirectlyDefined;
      if (ignoreWord) {
        console.debug(`Ignoring ${altWord}`);
        continue;
      }
      const keyOfAlt = altList[0];
      console.debug(`Replacing word ${altWord} with alternative ${keyOfAlt}`);
      temp = temp.replace(altWord, keyOfAlt);
    }
  }
  return temp;
}

function getMicrophoneStream(sampleRate) {
  return navigator.mediaDevices.getUserMedia({
    video: false,
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      channelCount: 1,
      sampleRate,
    },
  });
}

async function initializeAudioContext() {
  const audioContext = new AudioContext();
  await audioContext.audioWorklet.addModule(
    SPEECH_CONFIG.recognizerProcessorPath
  );
  return audioContext;
}

function initializeRecognizerProcessor(audioContext, channel, recognizerId) {
  const recognizerProcessor = new AudioWorkletNode(
    audioContext,
    "recognizer-processor",
    { channelCount: 1, numberOfInputs: 1, numberOfOutputs: 1 }
  );
  recognizerProcessor.port.postMessage({ action: "init", recognizerId }, [
    channel.port2,
  ]);
  recognizerProcessor.connect(audioContext.destination);
  return recognizerProcessor;
}
