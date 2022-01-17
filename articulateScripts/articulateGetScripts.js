/*
 * Loads scripts and import them into html document.
 *
 * Should be run in Articulate at the start of a project (trigger on the first slide).
 */

const SCRIPTS_VAR = 'scripts';
const SCRIPTS_PATH_VAR = 'scriptsPath';


let player = GetPlayer();
let scripts = player.GetVar(SCRIPTS_VAR).split(',');

let i = 0;
let scriptsLoaded = 0;

let path = player.GetVar(SCRIPTS_PATH_VAR);

// if path ends in a "/" dont't add it, if it doesn't add it
path = path.charAt(path.length) == '/' ? path : path + '/';

iterateScripts()

function iterateScripts() {
    if (window.CustomSLScriptsLoaded) {
        return;
    }

    window.CustomSLScriptsLoaded = true;

    for (i; i < scripts.length; i++) {
        scripts[i] = scripts[i].trim();
        loadScript(path + scripts[i]);
    }
    loadCss(path + "captions.css");
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
    let head = document.head || document.getElementsByTagName('head')[0];
    let script = window.document.createElement('script');
    let source = window.document.createAttribute('src');
    source.value = scriptToLoad;
    script.setAttributeNode(source);
    script.onload = triggerAllScriptsLoaded();
    head.appendChild(script);
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