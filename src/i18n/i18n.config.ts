import {
  I18nModule,
  AcceptLanguageResolver,
  HeaderResolver,
  QueryResolver,
  CookieResolver,
  I18nOptions,
} from 'nestjs-i18n';
import { join } from 'path';

export const i18nConfig = I18nModule.forRootAsync({
  useFactory: () => ({
    fallbackLanguage: 'en',
    loaderOptions: {
      path: join(__dirname, 'translations'),
      watch: true,
    },
    typesOutputPath: join(
      process.cwd(),
      'src/i18n/generated/i18n.generated.ts',
    ),
  }),
  resolvers: [
    { use: QueryResolver, options: ['lang', 'locale'] },
    { use: HeaderResolver, options: ['x-custom-lang', 'accept-language'] },
    AcceptLanguageResolver,
    CookieResolver,
  ],
});

// Create translation directories and files
export const supportedLanguages = ['en', 'zh'];
