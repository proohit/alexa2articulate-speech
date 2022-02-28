/**
 * PASTE THIS CODE INTO ARTICULATE
 */

const SCRIPTS_VAR = "scripts";
const SCRIPTS_PATH_VAR = "scriptsPath";

//js
const DEFAULT_VOSK_NAME = "vosk.js";
const DEFAULT_WORDLIST_NAME = "wordlist.js";
const DEFAULT_CONFIG_NAME = "config.js";
const DEFAULT_PEGGY_NAME = "peggy.min.js";
const DEFAULT_COMMANDS_NAME = "commands.js";
const DEFAULT_STTFUNCTIONS_NAME = "sttFunctions.js";
const DEFAULT_RECOGNIZER_PROCESSOR_NAME = "recognizer-processor.js";
//css
const DEFAULT_CAPTIONS_NAME = "captions.css";
const DEFAULT_LOADING_NAME = "loading.css";
//misc
const DEFAULT_MODEL_NAME = "vosk-model-small-de-0.15.tar.gz";
const DEFAULT_NAMED_GRAMMAR_NAME = "grammar.peggy";
const DEFAULT_UNNAMED_GRAMMAR_NAME = "grammar-unnamed.peggy";
const DEFAULT_MODIFIER = "altKey";
const DEFAULT_KEY = "v";

let player = GetPlayer();

let scripts = player.GetVar(SCRIPTS_VAR).split(",").filter(script => !!script);
let path = player.GetVar(SCRIPTS_PATH_VAR);
// if path ends in a "/" dont't add it, if it doesn't add it
path = path.charAt(path.length) == "/" ? path : path + "/";

loadAllFiles();

async function loadAllFiles() {
  if (window.CustomSLScriptsLoaded) {
    return;
  }
  window.CustomSLScriptsLoaded = true;
  await loadScript(path + DEFAULT_CONFIG_NAME);
  await loadConfig();
  for (const script of scripts) {
    await loadScript(path + script.trim());
  }
  await loadScript(path + DEFAULT_COMMANDS_NAME);
  await loadScript(path + DEFAULT_STTFUNCTIONS_NAME);
  player.SetVar("scriptsImported", true);
  loadCss(path + DEFAULT_CAPTIONS_NAME);
  loadCss(path + DEFAULT_LOADING_NAME);
}

function loadCss(cssToLoad) {
  let head = document.head || document.getElementsByTagName("head")[0];
  let link = window.document.createElement("link");
  let source = window.document.createAttribute("href");
  source.value = cssToLoad;
  link.setAttributeNode(source);
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  head.appendChild(link);
}

function loadScript(scriptToLoad) {
  return new Promise((resolve, reject) => {
    let head = document.head || document.getElementsByTagName("head")[0];
    let script = window.document.createElement("script");
    let source = window.document.createAttribute("src");
    source.value = scriptToLoad;
    script.setAttributeNode(source);
    script.onload = () => {
      resolve();
    };
    head.appendChild(script);
  });
}

async function loadConfig() {
  if (SPEECH_CONFIG.voskPath) {
    await loadScript(SPEECH_CONFIG.voskPath);
  } else {
    await loadScript(path + DEFAULT_VOSK_NAME);
  }
  if (SPEECH_CONFIG.wordlistPath) {
    await loadScript(SPEECH_CONFIG.wordlistPath);
  } else {
    await loadScript(path + DEFAULT_WORDLIST_NAME);
  }
  if (SPEECH_CONFIG.peggyPath) {
    await loadScript(SPEECH_CONFIG.peggyPath);
  } else {
    await loadScript(path + DEFAULT_PEGGY_NAME);
  }
  if (!SPEECH_CONFIG.recognizerProcessorPath) {
    SPEECH_CONFIG.recognizerProcessorPath =
      path + DEFAULT_RECOGNIZER_PROCESSOR_NAME;
  }
  if (!SPEECH_CONFIG.modelPath) {
    SPEECH_CONFIG.modelPath = path + DEFAULT_MODEL_NAME;
  }
  if (!SPEECH_CONFIG.grammarPath) {
    SPEECH_CONFIG.grammarPath = {};
  }
  if (!SPEECH_CONFIG.grammarPath.named) {
    SPEECH_CONFIG.grammarPath.named = path + DEFAULT_NAMED_GRAMMAR_NAME;
  }
  if (!SPEECH_CONFIG.grammarPath.unnamed) {
    SPEECH_CONFIG.grammarPath.unnamed = path + DEFAULT_UNNAMED_GRAMMAR_NAME;
  }
  if (!SPEECH_CONFIG.pushToTalkCombination) {
    SPEECH_CONFIG.pushToTalkCombination = {
      modifier: DEFAULT_MODIFIER,
      key: DEFAULT_KEY,
    };
  }
  if (!SPEECH_CONFIG.pushToTalkCombination.modifier) {
    SPEECH_CONFIG.pushToTalkCombination.modifier = DEFAULT_MODIFIER;
  }

  if (!SPEECH_CONFIG.pushToTalkCombination.key) {
    SPEECH_CONFIG.pushToTalkCombination.key = DEFAULT_KEY;
  }
}
