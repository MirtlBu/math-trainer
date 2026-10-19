/**
 * embed.js
 * Options for embedding the trainer (e.g. in an iframe on another site), read from the URL.
 * Without any parameter nothing changes.
 *
 *   ?bg=transparent   page background transparent: the host page shows through
 *   ?bg=%23fff8f0     any CSS colour (# written as %23); a bare hex like fff8f0 also works
 */
(function () {
  const params = new URLSearchParams(window.location.search);
  let bg = (params.get('bg') || '').trim();
  if (!bg) return;

  if (/^[0-9a-f]{3,8}$/i.test(bg)) bg = '#' + bg;            // fff8f0 → #fff8f0

  // ignore values that are not a colour, so a typo cannot break the page
  if (window.CSS && CSS.supports && !CSS.supports('background-color', bg)) return;

  // --page-bg is used by body (index.html) and .math-trainer (style.css)
  document.documentElement.style.setProperty('--page-bg', bg);
})();
