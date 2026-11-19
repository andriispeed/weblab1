import { Component, signal } from "@angular/core";
@Component({
  template: ` <section class="section page-intro">
      <div class="container">
        <p class="eyebrow">ДИЗАЙН-РІШЕННЯ / CHANGE REQUEST 15</p>
        <h1 class="gradient-heading">Колір із призначенням.</h1>
        <p class="lead">
          Замовник запропонував триколірний градієнт для всього основного
          тексту. Наша команда зберегла акцент у великих заголовках.
        </p>
      </div>
    </section>
    <section class="section catalog-section">
      <div class="container">
        <div class="filter-group" role="group" aria-label="Варіант дизайну">
          <button
            class="filter-button"
            [attr.aria-pressed]="mode() === 'original'"
            (click)="mode.set('original')"
          >
            Початковий</button
          ><button
            class="filter-button"
            [attr.aria-pressed]="mode() === 'full'"
            (click)="mode.set('full')"
          >
            Вимога замовника</button
          ><button
            class="filter-button"
            [attr.aria-pressed]="mode() === 'headings'"
            (click)="mode.set('headings')"
          >
            Наш компроміс
          </button>
        </div>
        <article
          class="design-sample"
          [class.gradient-full]="mode() === 'full'"
          [class.gradient-titles]="mode() === 'headings'"
        >
          <p class="eyebrow">ПРИКЛАД ФРАГМЕНТА СТОРІНКИ</p>
          <h2>Практика, що стає навичкою.</h2>
          <p>
            На курсі ти послідовно розбереш основи, перевіриш їх у практичних
            завданнях і створиш власний проєкт. Ментор допоможе побачити помилки
            та знайти рішення.
          </p>
          <p>
            Два заняття на тиждень. Матеріали українською. Зрозуміла програма
            від першого кроку до результату.
          </p>
          <strong>5 місяців · Онлайн · Для початківців</strong>
        </article>
        <div class="benefits-grid design-reasons">
          <article>
            <span class="eyebrow">01 / ІЄРАРХІЯ</span>
            <h3>Акцент має значення</h3>
            <p>
              Градієнт виділяє заголовки, а основний текст залишається спокійним
              для тривалого читання.
            </p>
          </article>
          <article>
            <span class="eyebrow">02 / КОНТРАСТ</span>
            <h3>Перевіряємо кольори</h3>
            <p>
              Темна палітра зберігає розрахунковий контраст понад 5,9:1 на
              використаних світлих фонах. Сам градієнт не означає порушення
              WCAG.
            </p>
          </article>
          <article>
            <span class="eyebrow">03 / АДАПТИВНІСТЬ</span>
            <h3>Одна структура</h3>
            <p>
              Перемикання змінює лише колір тексту. Сітка та розміри елементів
              залишаються однаковими.
            </p>
          </article>
        </div>
        <div class="section-action action-row">
          <a
            class="text-button"
            href="api/docs/"
            target="_blank"
            rel="noopener"
            >Документація API ↗</a
          >
        </div>
      </div>
    </section>`,
})
export class DesignPage {
  mode = signal("headings");
}
