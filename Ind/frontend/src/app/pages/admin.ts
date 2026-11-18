import { Component, inject, signal } from "@angular/core";
import { DatePipe, JsonPipe } from "@angular/common";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import {
  Api,
  Application,
  ApplicationList,
  Audit,
  Course,
  SecurityState,
  errorMessage,
} from "../core/api";
type Editor = {
  course: Course;
  form: FormGroup<{
    price: FormControl<number>;
    description: FormControl<string>;
    version: FormControl<number>;
  }>;
};
@Component({
  imports: [DatePipe, JsonPipe, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: "./admin.html",
})
export class AdminPage {
  private api = inject(Api);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  state = inject(SecurityState);
  tab = signal("applications");
  data = signal<ApplicationList | null>(null);
  editors = signal<Editor[]>([]);
  audit = signal<Audit[]>([]);
  loading = signal(false);
  busy = signal("");
  error = signal("");
  notice = signal("");
  pendingDelete = signal<Application | null>(null);
  status = "";
  query = "";
  page = 1;
  statuses = [
    { id: "new", label: "Нова" },
    { id: "contacted", label: "Зв’язалися" },
    { id: "enrolled", label: "Зараховано" },
  ];
  constructor() {
    this.load();
  }
  private fail(e: unknown) {
    this.loading.set(false);
    this.busy.set("");
    this.error.set(errorMessage(e));
    if (e instanceof HttpErrorResponse && e.status === 401) {
      this.state.session.set(null);
      this.router.navigate(["/admin/login"]);
    }
  }
  load() {
    this.loading.set(true);
    this.error.set("");
    this.api.applications(this.status, this.query, this.page).subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: (e) => this.fail(e),
    });
  }
  filter() {
    this.page = 1;
    this.load();
  }
  movePage(delta: number) {
    this.page += delta;
    this.load();
  }
  selectTab(tab: string) {
    this.tab.set(tab);
    this.notice.set("");
    this.error.set("");
    if (tab === "applications") this.load();
    if (tab === "courses") this.loadCourses();
    if (tab === "audit") this.loadAudit();
  }
  changeStatus(app: Application, status: string) {
    if (this.busy()) return;
    this.busy.set(app.id);
    this.error.set("");
    this.api.status(app.id, status).subscribe({
      next: () => {
        this.notice.set("Статус заявки оновлено.");
        this.busy.set("");
        this.load();
      },
      error: (e) => {
        this.fail(e);
        this.load();
      },
    });
  }
  remove() {
    const app = this.pendingDelete();
    if (!app || this.busy()) return;
    this.busy.set(app.id);
    this.error.set("");
    this.api.remove(app.id).subscribe({
      next: () => {
        this.pendingDelete.set(null);
        this.busy.set("");
        this.notice.set("Заявку та її контактні дані видалено.");
        this.page = 1;
        this.load();
      },
      error: (e) => this.fail(e),
    });
  }
  loadCourses() {
    this.loading.set(true);
    this.api.courses().subscribe({
      next: (courses) => {
        this.editors.set(
          courses.map((course) => ({
            course,
            form: this.fb.nonNullable.group({
              price: [
                course.price,
                [
                  Validators.required,
                  Validators.min(0),
                  Validators.max(1000000),
                  Validators.pattern(/^\d+$/),
                ],
              ],
              description: [
                course.description,
                [
                  Validators.required,
                  Validators.minLength(10),
                  Validators.maxLength(500),
                ],
              ],
              version: [course.version],
            }),
          })),
        );
        this.loading.set(false);
      },
      error: (e) => this.fail(e),
    });
  }
  save(editor: Editor) {
    if (this.busy()) return;
    if (editor.form.invalid) {
      editor.form.markAllAsTouched();
      this.error.set(
        "Опис: 10–500 символів. Ціна: ціле число від 0 до 1 000 000.",
      );
      return;
    }
    this.busy.set(editor.course.id);
    this.error.set("");
    this.api.editCourse(editor.course.id, editor.form.getRawValue()).subscribe({
      next: (c) => {
        editor.course = c;
        editor.form.patchValue({ version: c.version });
        this.busy.set("");
        this.notice.set("Курс оновлено. Зміни вже доступні в каталозі.");
      },
      error: (e) => this.fail(e),
    });
  }
  loadAudit() {
    this.loading.set(true);
    this.api.audit().subscribe({
      next: (a) => {
        this.audit.set(a);
        this.loading.set(false);
      },
      error: (e) => this.fail(e),
    });
  }
  actionLabel(action: string) {
    return (
      (
        {
          "application.status": "Змінено статус заявки",
          "application.delete": "Видалено заявку",
          "course.update": "Оновлено курс",
        } as Record<string, string>
      )[action] || action
    );
  }
  logout() {
    this.api.logout().subscribe({
      next: () => {
        this.state.session.set(null);
        this.router.navigate(["/admin/login"]);
      },
      error: (e) => this.fail(e),
    });
  }
}
