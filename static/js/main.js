'use strict';

// This page used to pull in jQuery and core's html10n via
// <script src="static/js/jquery.js">, "static/js/html10n.js" and
// "static/js/l10n.js". Etherpad stopped serving all three (html10n is bundled
// into the Vite entry points, l10n.js and the standalone jQuery build are
// gone), so every one of those requests 404s and the resulting
// `$ is not defined` killed this file before it could bind the search box.
// Everything below is therefore dependency-free DOM code.

// Same set html10n accepts as a "<key>.<attribute>" suffix.
const ATTRIBUTE_KEYS = ['title', 'innerHTML', 'alt', 'textContent', 'value', 'placeholder'];

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const translateNode = (node, strings) => {
  const id = node.getAttribute('data-l10n-id');
  if (!id) return;
  const str = strings[id];
  if (str == null) return;
  const dot = id.lastIndexOf('.');
  const suffix = dot > 0 ? id.slice(dot + 1) : '';
  const prop = ATTRIBUTE_KEYS.indexOf(suffix) !== -1 ? suffix : 'textContent';
  node[prop] = str;
  // Give form controls a localized accessible name, like html10n does.
  if (prop !== 'textContent' && prop !== 'innerHTML') node.setAttribute('aria-label', str);
};

// The languages to try, most specific first: 'de-AT' also tries 'de', and
// English is always the final fallback.
const preferredLangs = () => {
  const langs = [];
  for (const lang of (navigator.languages || [navigator.language])) {
    if (!lang) continue;
    langs.push(lang);
    if (lang.indexOf('-') > 0) langs.push(lang.split('-')[0]);
  }
  langs.push('en');
  return langs;
};

const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return await res.json();
};

const loadTranslations = async () => {
  const link = document.querySelector('link[rel="localizations"]');
  const indexUrl =
      new URL(link ? link.getAttribute('href') : 'locales.json', window.location.href).href;
  const index = await fetchJson(indexUrl);
  const lang = preferredLangs().find((l) => index[l] != null);
  if (!lang) return {};
  // Entries are usually a path to the locale file, but Etherpad inlines the
  // translations themselves for the language it falls back to (English).
  const entry = index[lang];
  const data = typeof entry === 'string' ? await fetchJson(new URL(entry, indexUrl).href) : entry;
  // Locale files are {"<lang>": {"<key>": "<string>"}}; inlined maps are flat.
  return data[lang] || data;
};

const localize = async () => {
  let strings;
  try {
    strings = await loadTranslations();
  } catch (err) {
    // Leave the English fallbacks that are already in the template.
    console.warn('ep_padlist2: unable to load translations', err);
    return;
  }
  for (const node of document.querySelectorAll('[data-l10n-id]')) translateNode(node, strings);
};

const initSearch = () => {
  const list = document.querySelector('ul');
  const searchBox = document.querySelector('input[type="search"]');
  if (!list || !searchBox) return;
  const items = Array.from(list.querySelectorAll('li'));

  const filter = (query) => {
    const words = (query || '').split(/\s+/).filter((w) => w.length).map(escapeRegExp);
    if (!words.length) {
      list.classList.remove('filtering');
      return;
    }
    list.classList.add('filtering');
    // Every word has to appear somewhere in the pad id, in any order.
    const regex = new RegExp(`(?=.*${words.join(')(?=.*')})`, 'i');
    for (const item of items) {
      const link = item.querySelector('a');
      item.classList.toggle('visible', regex.test(link ? link.textContent : ''));
    }
  };

  const queryParams = new URLSearchParams(window.location.search);
  const q = queryParams.has('q') ? queryParams.get('q') : searchBox.value;
  searchBox.value = q;
  filter(q);

  searchBox.addEventListener('input', () => {
    const val = searchBox.value;
    queryParams.set('q', val);
    history.replaceState(null, '', `${window.location.pathname}?${queryParams.toString()}`);
    filter(val);
  });
};

const init = () => {
  initSearch();
  localize();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
