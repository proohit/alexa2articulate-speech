window.SPEECH_CONFIG = {
  modelPath:
    "http://localhost:5500/story_content/WebObjects/6BjXAZJpixW/vosk-model-small-de-0.15.tar.gz",
  pushToTalkCombination: { modifier: "ctrlKey", key: "v" },
  grammarPath: {
    named:
      "http://localhost:5500/story_content/WebObjects/6BjXAZJpixW/grammar.peggy",
    unnamed:
      "http://localhost:5500/story_content/WebObjects/6BjXAZJpixW/grammar-unnamed.peggy",
  },
  peggyPath:
    "http://localhost:5500/story_content/WebObjects/6BjXAZJpixW/peggy.min.js",
  wordlistPath:
    "http://localhost:5500/story_content/WebObjects/6BjXAZJpixW/wordlist.js",
  voskPath:
    "http://localhost:5500/story_content/WebObjects/6BjXAZJpixW/vosk.js",
  recognizerProcessorPath:
    "http://localhost:5500/story_content/WebObjects/6BjXAZJpixW/recognizer-processor.js",
};
