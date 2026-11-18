import { Component, inject, signal } from "@angular/core";
import { DatePipe, DOCUMENT } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Api, Course, Receipt, errorMessage } from "../core/api";
@Component({
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: "./contact.html",
})
export class ContactPage {
  private fb = inject(FormBuilder);
  private api = inject(Api);
  private document = inject(DOCUMENT);
  courses = signal<Course[]>([]);
  error = signal("");
  courseError = signal("");
  saving = signal(false);
  receipt = signal<Receipt | null>(null);
  submitted = false;
  private requestId = crypto.randomUUID();
  form = this.fb.nonNullable.group({
    name: [
      "",
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(80),
        Validators.pattern(/\S.{0,78}\S/),
      ],
    ],
    email: [
      "",
      [Validators.required, Validators.email, Validators.maxLength(160)],
    ],
    course: ["consultation"],
    message: ["", [Validators.maxLength(1000)]],
    consent: [false, Validators.requiredTrue],
  });
  constructor() {
    const id = inject(ActivatedRoute).snapshot.queryParamMap.get("course");
    if (id && ["frontend", "python", "qa"].includes(id))
      this.form.controls.course.setValue(id);
    this.loadCourses();
  }
  loadCourses() {
    this.courseError.set("");
    this.api
      .courses()
      .subscribe({
        next: (c) => this.courses.set(c),
        error: (e) => this.courseError.set(errorMessage(e)),
      });
  }
  invalid(name: "name" | "email" | "consent") {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted);
  }
  submit() {
    if (this.saving()) return;
    this.submitted = true;
    this.error.set("");
    this.form.patchValue({
      name: this.form.controls.name.value.trim(),
      email: this.form.controls.email.value.trim(),
    });
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set("Перевір ім’я, email і згоду на надсилання заявки.");
      requestAnimationFrame(() =>
        this.document
          .querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    this.saving.set(true);
    this.api
      .apply({ ...this.form.getRawValue(), requestId: this.requestId })
      .subscribe({
        next: (r) => {
          this.receipt.set(r);
          this.saving.set(false);
          requestAnimationFrame(() =>
            this.document.getElementById("receipt")?.focus(),
          );
        },
        error: (e) => {
          this.saving.set(false);
          this.error.set(errorMessage(e));
        },
      });
  }
  another() {
    this.receipt.set(null);
    this.form.reset();
    this.requestId = crypto.randomUUID();
    this.submitted = false;
    this.error.set("");
    requestAnimationFrame(() =>
      this.document.getElementById("student-name")?.focus(),
    );
  }
}
