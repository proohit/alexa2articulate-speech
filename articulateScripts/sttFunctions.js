let recognition = null;
let player = GetPlayer();
let spaceBarPressed = false;

setInterval(() => {
  if (player.GetVar("sttEnabled") && recognition !== null) {
    recognition.stop();
  }
}, 15000);

const { SpeechRecognition } = window.WebSpeechCognitiveServices.create({
  credentials: {
    region: "",
    subscriptionKey: "",
  },
});

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

function startSTT() {
  console.log("Start STT");
  let finalTranscript = "";

  if (recognition == null) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "de-de";
    recognition.continuous = true;
    recognition.interimResults = true;
    let resultIndex = 0;
    recognition.onresult = function (event) {
      const assistantName = player.GetVar("assistantName").toLowerCase();
      var interimTranscript = "";

      for (var i = resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          resultIndex++;
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (
        interimTranscript &&
        interimTranscript.toLowerCase().includes(assistantName)
      ) {
        player.SetVar("sttIsActive", true);
        player.SetVar("spokenText", interimTranscript);
      }

      if (finalTranscript) {
        try {
          if (finalTranscript.toLowerCase().includes(assistantName)) {
            player.SetVar("spokenText", finalTranscript);
            finalTranscript = finalTranscript.toLowerCase();
            finalTranscript = removePunctuation(finalTranscript);
            console.log(finalTranscript);
            const res = peg$parse(finalTranscript);
            console.log(res);
            res.execute();
          }
        } finally {
          finalTranscript = "";
          player.SetVar("spokenText", "");
          player.SetVar("sttIsActive", false);
        }
      }
    };

    recognition.onerror = function (event) {
      console.log(event);
      //This prevents stopping of the recognition
      recognition.stop();
      if (player.GetVar("sttEnabled")) {
        recognition.start();
      }
    };

    recognition.onend = function (event) {
      console.log(event);
      //This prevents stopping of the recognition
      if (player.GetVar("sttEnabled")) {
        recognition.start();
      } else {
        stopSTT();
      }
    };
    recognition.start();
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
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}
