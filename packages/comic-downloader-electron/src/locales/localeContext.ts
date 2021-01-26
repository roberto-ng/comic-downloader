import React, { Context } from 'react'

interface ILocaleContext {
    locale: string;
    changeLocale: (newLocale: string) => void;
}

export const LocaleContext: Context<ILocaleContext> = React.createContext({
    locale: 'en',
    changeLocale: (newLocale: string) => {},
});

export function getValidLocale(locale: string): string {
    if (locale === 'pt' || locale.startsWith('pt-')) {
        return 'pt-br';
    }
    else if (locale === 'en' || locale.startsWith('en-')) {
        return 'en';
    }

    return 'en';
}
