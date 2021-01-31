import React, { Context } from 'react'

interface LocaleContext {
    locale: string;
    changeLocale: (newLocale: string) => void;
}

export const localeContext: Context<LocaleContext> = React.createContext(null);

export function getValidLocale(locale: string): string {
    if (locale === 'pt' || locale.startsWith('pt-')) {
        return 'pt-br';
    }
    else if (locale === 'en' || locale.startsWith('en-')) {
        return 'en';
    }

    return 'en';
}
