const SCRIPTS_VAR = "scripts";
const SCRIPTS_PATH_VAR = "scriptsPath";

const VOSK_NAME = "vosk.js";
const WORDLIST_NAME = "wordlist.js";
const CONFIG_NAME = "config.js";
const CAPTIONS_NAME = "captions.css";

let player = GetPlayer();
let scripts = player.GetVar(SCRIPTS_VAR).split(",");
let i = 0;
let scriptsLoaded = 0;

let path = player.GetVar(SCRIPTS_PATH_VAR);

// if path ends in a "/" dont't add it, if it doesn't add it
path = path.charAt(path.length) == "/" ? path : path + "/";

iterateScripts();

async function iterateScripts() {
  if (window.CustomSLScriptsLoaded) {
    return;
  }

  window.CustomSLScriptsLoaded = true;
  await loadScript(path + CONFIG_NAME);
  await loadConfig();
  for (i; i < scripts.length; i++) {
    scripts[i] = scripts[i].trim();
    await loadScript(path + scripts[i]);
  }
  loadCss(path + CAPTIONS_NAME);
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
      triggerAllScriptsLoaded();
      resolve();
    };
    head.appendChild(script);
  });
}

async function loadConfig() {
  if (SPEECH_CONFIG.voskPath) {
    await loadScript(SPEECH_CONFIG.voskPath);
  } else {
    await loadScript(path + VOSK_NAME);
  }
  if (SPEECH_CONFIG.wordlistPath) {
    await loadScript(SPEECH_CONFIG.wordlistPath);
  } else {
    await loadScript(path + WORDLIST_NAME);
  }
}

function triggerAllScriptsLoaded() {
  scriptsLoaded++;

  if (scriptsLoaded == scripts.length) {
    setScriptsImported();
  }
}

function setScriptsImported() {
  setTimeout(function () {
    player.SetVar("scriptsImported", true);
  }, 2000);
}
