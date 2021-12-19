let recognition = null;
let player = GetPlayer();

setInterval(() => {
  if (player.GetVar("sttEnabled") && recognition !== null) {
    recognition.abort();
  }
}, 15000);

function startSTT() {
  console.log("Start STT");
  let finalTranscript = "";

  if (!("webkitSpeechRecognition" in window)) {
  } else if (recognition == null) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "de-de";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = function (event) {
      var interim_transcript = "";

      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      if (interim_transcript) {
        player.SetVar("spokenText", interim_transcript);
      }

      if (finalTranscript) {
        player.SetVar("spokenText", finalTranscript);
        try {
          finalTranscript = finalTranscript.toLowerCase();
          finalTranscript = removePunctuation(finalTranscript);
          console.log(finalTranscript);
          const res = peg$parse(finalTranscript);
          console.log(res);
          res.execute();
        } finally {
          finalTranscript = "";
          player.SetVar("spokenText", "");
        }
      }
    };

    recognition.onerror = function (event) {
      console.log(event);
      //This prevents stopping of the recognition
      recognition.abort();
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
  finalTranscript = finalTranscript.replace(',', '');
  finalTranscript = finalTranscript.replace('.', '');
  finalTranscript = finalTranscript.replace('!', '');
  finalTranscript = finalTranscript.replace('?', '');
  return finalTranscript;
}

function stopSTT() {
  console.log("Stop STT");
  recognition.abort();
  recognition = null;
}
