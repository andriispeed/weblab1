import { Component, DestroyRef, inject, signal } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { filter } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
@Component({
  selector: "app-root",
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./app.html",
})
export class App {
  menu = signal(false);
  private document = inject(DOCUMENT);
  constructor() {
    let first = true;
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.menu.set(false);
        if (!first)
          requestAnimationFrame(() =>
            this.document
              .getElementById("main")
              ?.focus({ preventScroll: true }),
          );
        first = false;
      });
  }
  closeMenu(event: Event) {
    if (this.menu()) {
      this.menu.set(false);
      this.document.getElementById("menu-toggle")?.focus();
      event.preventDefault();
    }
  }
}
