import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { Api, SecurityState, errorMessage } from "../core/api";
@Component({
  imports: [ReactiveFormsModule, RouterLink],
  template: ` <section class="section">
    <div class="container login-layout">
      <a class="back-link" routerLink="/">← На головну</a>
      <p class="eyebrow">IT.SCHOOL / КОМАНДА</p>
      <h1 class="gradient-heading">Від заявки<br />до навчання.</h1>
      <p class="lead">Увійди, щоб працювати із заявками та оновлювати курси.</p>
      <form
        class="application-form"
        [formGroup]="form"
        (ngSubmit)="submit()"
        novalidate
      >
        <h2>Вхід до панелі</h2>
        @if (error()) {
          <p class="form-error-summary" role="alert">{{ error() }}</p>
        }
        <div class="field">
          <label for="login">Логін</label
          ><input
            id="login"
            autocomplete="username"
            formControlName="username"
            required
            maxlength="80"
          />
        </div>
        <div class="field">
          <label for="password">Пароль</label
          ><input
            id="password"
            autocomplete="current-password"
            type="password"
            formControlName="password"
            required
            maxlength="200"
          />
        </div>
        <button class="button" [disabled]="busy()">
          {{ busy() ? "Входимо…" : "Увійти ↗" }}
        </button>
        <p class="micro">Доступ лише для команди проєкту.</p>
      </form>
    </div>
  </section>`,
})
export class LoginPage {
  private api = inject(Api);
  private router = inject(Router);
  private state = inject(SecurityState);
  form = inject(FormBuilder).nonNullable.group({
    username: ["", [Validators.required]],
    password: ["", [Validators.required, Validators.minLength(8)]],
  });
  busy = signal(false);
  error = signal("");
  submit() {
    if (this.busy()) return;
    if (this.form.invalid) {
      this.error.set("Введи логін і пароль (щонайменше 8 символів).");
      return;
    }
    this.busy.set(true);
    this.error.set("");
    this.api.login(this.form.getRawValue()).subscribe({
      next: (s) => {
        this.state.session.set(s);
        this.router.navigate(["/admin"]);
      },
      error: (e) => {
        this.error.set(errorMessage(e));
        this.busy.set(false);
      },
    });
  }
}
