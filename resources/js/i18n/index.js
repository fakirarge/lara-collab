// resources/js/i18n/index.js

import tr from './tr';

const translations = {
  tr,
};

let currentLocale = 'tr';

export const setLocale = (locale) => {
  if (translations[locale]) {
    currentLocale = locale;
  }
};

export const getLocale = () => currentLocale;

export const t = (key, replacements = {}) => {
  const keys = key.split('.');
  let value = translations[currentLocale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  // Replace placeholders
  if (typeof value === 'string' && Object.keys(replacements).length > 0) {
    return value.replace(/:\w+/g, (match) => {
      const key = match.substring(1);
      return replacements[key] || match;
    });
  }

  return value;
};

export default {
  t,
  setLocale,
  getLocale,
};

