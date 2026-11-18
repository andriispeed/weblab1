import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Api, Course, errorMessage } from "../core/api";
import { CourseCard } from "../shared/course-card";
@Component({
  imports: [FormsModule, RouterLink, CourseCard],
  templateUrl: "./courses.html",
})
export class CoursesPage {
  courses = signal<Course[]>([]);
  error = signal("");
  loading = signal(true);
  query = signal("");
  category = signal("all");
  sort = signal("default");
  private api = inject(Api);
  filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase("uk");
    const items = this.courses().filter(
      (c) =>
        (this.category() === "all" || c.category === this.category()) &&
        `${c.title} ${c.tools}`.toLocaleLowerCase("uk").includes(q),
    );
    return items.sort((a, b) =>
      this.sort() === "price-asc"
        ? a.price - b.price
        : this.sort() === "price-desc"
          ? b.price - a.price
          : a.position - b.position,
    );
  });
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
  reset() {
    this.query.set("");
    this.category.set("all");
    this.sort.set("default");
  }
}
