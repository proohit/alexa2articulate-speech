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

async function iterateScripts() {
    if (window.CustomSLScriptsLoaded) {
        return;
    }

    window.CustomSLScriptsLoaded = true;
    for (i; i < scripts.length; i++) {
        scripts[i] = scripts[i].trim();
        await loadScript(path + scripts[i]);
    }
}

async function loadScript(scriptToLoad) {
    const res = await fetch(scriptToLoad);
    const scriptText = await res.text();
    let script = window.document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = scriptText;
    document.head.appendChild(script);
    scriptsLoaded++;
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