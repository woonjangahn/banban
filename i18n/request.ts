import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  if (!locale) {
    locale = 'ko'; // Default locale
  }
  
  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Error loading messages for locale '${locale}', falling back to 'ko'`);
    messages = (await import(`../messages/ko.json`)).default;
  }

  return {
    locale: locale, // Explicitly set the locale
    messages: messages
  };
});