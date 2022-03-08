document.addEventListener("DOMContentLoaded", () => {
  redirectCaptions();
});

function redirectCaptions() {
  let player = GetPlayer();
  let captions = document.getElementsByClassName("caption")[0];
  let captionsConfig = {
    attributes: true,
    childList: true,
    characterData: true,
  };

  captions.style.visibility = "hidden";

  const observer = new MutationObserver((mutations) => {
    player.SetVar(VAR_SPOKEN_TEXT, mutations[0].target.textContent);
  });

  observer.observe(captions, captionsConfig);
}
