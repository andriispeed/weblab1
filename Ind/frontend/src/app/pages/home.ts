import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Api, Course, errorMessage } from "../core/api";
import { CourseCard } from "../shared/course-card";
@Component({ imports: [RouterLink, CourseCard], templateUrl: "./home.html" })
export class HomePage {
  courses = signal<Course[]>([]);
  error = signal("");
  loading = signal(true);
  private api = inject(Api);
  constructor() {
    this.load();
  }
  load() {
    this.loading.set(true);
    this.error.set("");
    this.api.courses().subscribe({
      next: (data) => {
        this.courses.set(data);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(errorMessage(e));
        this.loading.set(false);
      },
    });
  }
}
