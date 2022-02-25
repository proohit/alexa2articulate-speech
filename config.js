/**
 * Konfiguration für die Sprachsteuerung.
 * modelPath: Pfad zum Sprachmodell. Standardmäßig wird die Datei vosk-model-small-de-0.15.tar.gz, ausgehend vom eingstellten Pfad von Articulate, geladen.
 * wordlistPath: Pfad zur Wortliste, die für die Spracherkennung verwendet wird. Standardmäßig wird die Datei wordlist.js, ausgehend vom eingestellten Pfad von Articulate, geladen.
 * grammarPath: Pfad zur Grammatik (im PeggyJS Format), die für die Verarbeitung der Sprachtranskription verwendet wird. named: für eine Grammatik mit dem Assistentennamen, unnamed: für eine Grammatik ohne Assistentennamen. Standardmäßig wird die Datei grammar.peggy für named und grammar-unnamed.peggy für unnamed, ausgehend vom eingestellten Pfad von Articulate, geladen.
 * recognizerProcessorPath: Pfad zum RecognizerProcessor, der für die Spracherkennung verwendet wird. Standardmäßig wird die Datei recognizer-processor.js, ausgehend vom eingestellten Pfad von Articulate, geladen.
 * voskPath: Pfad zur Vosk Bibliothek. Standardmäßig wird die Datei vosk.js, ausgehend vom eingestellten Pfad von Articulate, geladen.
 * peggyPath: Pfad zur PeggyJS Bibliothek. Standardmäßig wird die Datei peggy.js, ausgehend vom eingestellten Pfad von Articulate, geladen.
 * pushToTalk: Tastenkombination, bei der die Spracherkennung gestartet wird. Wechselt automatisch zwischen den Grammatiken mit und ohne Assistentennamen. modifier kann sein: "ctrlKey"|"altKey"|"metaKey". Standardmäßig wird die Tastenkombination altKey+v verwendet.
 */
window.SPEECH_CONFIG = {
  modelPath: "",
  pushToTalkCombination: { modifier: "", key: "" },
  grammarPath: {
    named: "",
    unnamed: "",
  },
  peggyPath: "",
  wordlistPath: "",
  voskPath: "",
  recognizerProcessorPath: "",
};
