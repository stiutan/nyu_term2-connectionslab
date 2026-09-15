const imgContainer = document.querySelector(".img-container-outer");
const imgLightsOn = document.querySelector(".img--lights-on");
const imgLightsOff1 = document.querySelector(".img--lights-off");
const imgLightsOff2 = document.querySelector(".img--lights-off-2");
const imgs = [imgLightsOn, imgLightsOff1, imgLightsOff2];

let isLoadingDone = false;
let isIntroScrollDone = false;
let isLightOn = true;
let isAlone = true;

/**
 * loading
 */

const mainContainer = document.querySelector(".main-container");
const loadingContainer = document.querySelector(".loading-container");
const imgContainerInner = document.querySelector(".img-container-inner");

async function finishLoading() {
  const results = await Promise.allSettled([
    ...imgs.map((img) => img.decode()),
    new Promise((resolve) => setTimeout(resolve, 1500)), // load for min of 1.5s otherwise feels jolty
  ]);

  if (results.every((result) => result.status === "fulfilled")) {
    // set image size on load -- only show 60% of img
    const imgInnerContainerHeight = imgContainer.clientHeight / 0.6;
    const imgInnerContainerWidth =
      (imgInnerContainerHeight * imgLightsOn.naturalWidth) /
      imgLightsOn.naturalHeight;
    imgContainerInner.style.height = `${imgInnerContainerHeight}px`;
    imgContainerInner.style.width = `${imgInnerContainerWidth}px`;

    // set text width based on remaining space beside img
    const textContainerWidth = Math.max(
      0,
      (imgContainer.clientWidth - imgInnerContainerWidth) / 2,
    );
    mainContainer.style.setProperty(
      "--text-container-width",
      `${textContainerWidth}px`,
    );

    imgLightsOn.classList.add("is-visible");
    imgContainer.classList.add("is-loaded");

    isLoadingDone = true;
    loadingContainer.remove();
  }
}

finishLoading();

/**
 * general helpers
 */

// scrolltop when scrolled all the way to bottom (content height - visible container height)
function maxScrollTop() {
  return Math.max(0, imgContainer.scrollHeight - imgContainer.clientHeight);
}

const lightsOnText = document.querySelector(".text-container--lights-on");
const lightsOffText = document.querySelector(".text-container--lights-off");

function updateWords() {
  if (!isLoadingDone) return;

  const maxScrollTopValue = maxScrollTop();
  const progress =
    maxScrollTopValue <= 0
      ? 1
      : Math.min(1, imgContainer.scrollTop / maxScrollTopValue);

  // add 1px tolerance bc scrollTop can have decimals while heights are rounded
  if (!isIntroScrollDone && imgContainer.scrollTop >= maxScrollTopValue - 1) {
    isIntroScrollDone = true;
  }

  const visibleText = isLightOn ? lightsOnText : lightsOffText;
  const visibleTexts = [...visibleText.querySelectorAll(".text")];
  visibleTexts.forEach((word, index) => {
    word.classList.toggle(
      "is-visible",
      isIntroScrollDone || progress >= (index + 1) / visibleTexts.length,
    );
  });

  const invisibleText = !isLightOn ? lightsOnText : lightsOffText;
  invisibleText.querySelectorAll(".text").forEach((word) => {
    word.classList.remove("is-visible");
  });
}

function updateImages() {
  if (!isLoadingDone) return;

  imgLightsOn.classList.toggle("is-visible", isLightOn);
  imgLightsOff1.classList.toggle("is-visible", !isLightOn && isAlone);
  imgLightsOff2.classList.toggle("is-visible", !isLightOn && !isAlone);

  updateWords();
}

/**
 * intro scroll
 *
 * we add animation to fade in texts as user scrolls to help guide them
 * to scrolling all the way to the bottom
 */

imgContainer.addEventListener("scroll", updateWords);

/**
 * img click
 *
 * switches light on & off
 */

imgs.forEach((image) =>
  image.addEventListener("click", () => {
    isLightOn = !isLightOn;
    updateImages();
  }),
);

/**
 * text clicks
 *
 * scroll to highlight portion of img (and show/hide ghost)
 */

document
  .querySelector(".text-button--two-shadows")
  .addEventListener("click", () => {
    // scroll to bottom to show shadows
    imgContainer.scrollTo({ top: maxScrollTop(), behavior: "smooth" });
  });

document
  .querySelector(".text-button--one-light")
  .addEventListener("click", () => {
    // scroll to top to show light bulb
    imgContainer.scrollTo({ top: 0, behavior: "smooth" });
  });

document
  .querySelector(".text-button--alone-right")
  .addEventListener("click", () => {
    // scroll to middle to show ghost
    imgContainer.scrollTo({ top: maxScrollTop() / 2, behavior: "smooth" });

    // toggle ghost
    isAlone = !isAlone;
    updateImages();
  });
