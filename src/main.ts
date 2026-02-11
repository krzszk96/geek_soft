import { bootstrapApplication } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localePl);

bootstrapApplication(App, {
  ...appConfig,
  providers: [...(appConfig?.providers ?? []), { provide: LOCALE_ID, useValue: 'pl-PL' }],
}).catch((err) => console.error(err));
