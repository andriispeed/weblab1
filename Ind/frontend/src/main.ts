import { bootstrapApplication } from "@angular/platform-browser";
import { provideZonelessChangeDetection } from "@angular/core";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { registerLocaleData } from "@angular/common";
import uk from "@angular/common/locales/uk";
import { LOCALE_ID } from "@angular/core";
import { App } from "./app/app";
import { routes } from "./app/routes";
import { securityInterceptor } from "./app/core/api";
registerLocaleData(uk);
bootstrapApplication(App, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: "enabled" }),
    ),
    provideHttpClient(withInterceptors([securityInterceptor])),
    { provide: LOCALE_ID, useValue: "uk-UA" },
  ],
}).catch(console.error);
