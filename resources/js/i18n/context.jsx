// resources/js/i18n/context.jsx

import React, { createContext, useContext } from 'react';
import { t } from './index';

export const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  return (
    <I18nContext.Provider value={{ t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

