(() => {
const common = typeof module !== 'undefined' && module.exports
  ? require('./common.js')
  : globalThis.HoofersCommon;

function setFaqState(button, panel, expanded) {
  button.setAttribute('aria-expanded', String(expanded));
  panel.hidden = !expanded;
}

function initFaqDisclosures(documentRef) {
  documentRef.querySelectorAll('[data-faq-button]').forEach((button) => {
    const panel = documentRef.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') !== 'true';
      setFaqState(button, panel, expanded);
    });
  });
}

function setCourseTabState(tabs, documentRef, activeTab) {
  tabs.forEach((tab) => {
    const selected = tab === activeTab;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    const panel = documentRef.getElementById(tab.getAttribute('aria-controls'));
    if (panel) panel.hidden = !selected;
  });
}

function initCourseTabs(documentRef) {
  const tabs = Array.from(documentRef.querySelectorAll('[data-program-tab]'));
  if (!tabs.length) return;

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setCourseTabState(tabs, documentRef, tab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault();
      const nextTab = tabs[nextIndex];
      setCourseTabState(tabs, documentRef, nextTab);
      nextTab.focus();
    });
  });
}

function normalizeSlideshowImages(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((image) => image && typeof image.src === 'string' && image.src &&
    typeof image.title === 'string' && image.title && typeof image.alt === 'string' && image.alt);
}

function wrapSlideIndex(index, count) {
  return count > 0 ? (index % count + count) % count : 0;
}

function createSlideshowController(count, onChange) {
  let index = 0;
  const select = (nextIndex) => {
    if (count < 1) return;
    index = wrapSlideIndex(nextIndex, count);
    onChange(index);
  };
  return {
    get index() { return index; },
    next() { select(index + 1); },
    previous() { select(index - 1); },
    goTo(nextIndex) { select(nextIndex); }
  };
}

function createSlide(documentRef, viewport, image) {
  const slide = documentRef.createElement('figure');
  const photo = documentRef.createElement('img');
  const caption = documentRef.createElement('figcaption');
  slide.className = 'slideshow-slide';
  photo.setAttribute('src', image.src);
  photo.setAttribute('alt', image.alt);
  photo.setAttribute('loading', 'lazy');
  caption.textContent = image.title;
  slide.append(photo, caption);
  viewport.append(slide);
  return slide;
}

function createIndicator(documentRef, indicators, image, index) {
  const button = documentRef.createElement('button');
  button.className = 'slideshow-indicator';
  button.setAttribute('type', 'button');
  button.setAttribute('aria-label', `Show slide ${index + 1}: ${image.title}`);
  indicators.append(button);
  return button;
}

function initSlideshow(documentRef, imageData = globalThis.HoofersSlideshowImages) {
  const root = documentRef.querySelector('[data-slideshow]');
  if (!root) return;
  const images = normalizeSlideshowImages(imageData);
  const viewport = root.querySelector('[data-slideshow-viewport]');
  const previous = root.querySelector('[data-slide-previous]');
  const next = root.querySelector('[data-slide-next]');
  const indicators = root.querySelector('[data-slide-indicators]');
  const status = root.querySelector('[data-slide-status]');
  const empty = root.querySelector('[data-slideshow-empty]');
  const controls = root.querySelector('[data-slideshow-controls]');

  empty.hidden = images.length > 0;
  viewport.hidden = images.length === 0;
  controls.hidden = images.length < 2;
  if (!images.length) return;

  const slides = images.map((image) => createSlide(documentRef, viewport, image));
  const dots = images.map((image, index) => createIndicator(documentRef, indicators, image, index));
  const render = (index) => {
    slides.forEach((slide, slideIndex) => { slide.hidden = slideIndex !== index; });
    dots.forEach((dot, dotIndex) => dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false'));
    status.textContent = `${index + 1} of ${images.length}`;
  };
  const controller = createSlideshowController(images.length, render);
  previous.addEventListener('click', () => controller.previous());
  next.addEventListener('click', () => controller.next());
  dots.forEach((dot, index) => dot.addEventListener('click', () => controller.goTo(index)));
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') controller.previous();
    else controller.next();
  });
  render(0);
}

function initHome(documentRef = document, windowRef = window) {
  common.initCommon(documentRef, windowRef);
  initCourseTabs(documentRef);
  initSlideshow(documentRef);
  initFaqDisclosures(documentRef);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initHome());
}

const api = {
  setFaqState,
  initFaqDisclosures,
  setCourseTabState,
  initCourseTabs,
  normalizeSlideshowImages,
  wrapSlideIndex,
  createSlideshowController,
  initSlideshow,
  initHome
};
if (typeof module !== 'undefined') module.exports = api;
})();
