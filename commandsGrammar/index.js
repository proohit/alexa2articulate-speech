// import { parse } from "../articulateScripts/grammar.js";
import { DictateService } from "./dictate-service.js";
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

const dictateService = new DictateService();
let textDataBase = "";
let textData = "";
let buttonText = "Start Recognition";
let results = [];
let currentIndex = 0;
function startButton() {
  if (!dictateService.isInitialized()) {
    dictateService.init({
      server: "ws://0.0.0.0:2700/",
      onResults: (hyp) => {
        console.log(hyp);
        textDataBase = textDataBase + hyp + "\n";
        results.push(hyp);
        document.getElementById(
          "final"
        ).innerText = `FINAL RESULTS: ${results.join("\n")}`;
        currentIndex++;
        textDataBase = "";
        textData = "";
        document.getElementById("interim").innerText = textData;
      },
      onPartialResults: (hyp) => {
        console.log(hyp);
        textData = textDataBase + hyp;
        document.getElementById("interim").innerText = textData;
      },
      onError: (code, data) => {
        console.log(code, data);
      },
      onEvent: (code, data) => {
        console.log(code, data);
      },
    });
    buttonText = "Stop Recognition";
  } else if (dictateService.isRunning()) {
    dictateService.resume();
    buttonText = "Stop Recognition";
  } else {
    dictateService.pause();
    buttonText = "Start Recognition";
  }
}
