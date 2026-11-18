import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
@Component({
  imports: [RouterLink],
  template: `<section class="section">
    <div class="container narrow-copy">
      <p class="eyebrow">404 / СТОРІНКУ НЕ ЗНАЙДЕНО</p>
      <h1 class="gradient-heading">Повернімося<br />до твого маршруту.</h1>
      <p class="lead">
        Це посилання більше не веде до сторінки. У каталозі можна обрати свій
        наступний крок.
      </p>
      <a class="button" routerLink="/courses">До каталогу курсів ↗</a>
    </div>
  </section>`,
})
export class NotFoundPage {}
