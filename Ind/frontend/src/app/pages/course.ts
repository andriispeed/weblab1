import { Component, inject, signal } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { switchMap, catchError, of } from "rxjs";
import { Api, Course, errorMessage } from "../core/api";
@Component({ imports: [RouterLink, DecimalPipe], templateUrl: "./course.html" })
export class CoursePage {
  course = signal<Course | null>(null);
  error = signal("");
  loading = signal(true);
  private api = inject(Api);
  private title = inject(Title);
  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(
        takeUntilDestroyed(),
        switchMap((params) => {
          this.error.set("");
          this.loading.set(true);
          return this.api.course(params.get("id") || "").pipe(
            catchError((e) => {
              this.error.set(errorMessage(e));
              return of(null);
            }),
          );
        }),
      )
      .subscribe((course) => {
        this.course.set(course);
        this.loading.set(false);
        if (course) this.title.setTitle(course.title + " | IT.SCHOOL");
      });
  }
}
