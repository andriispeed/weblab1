import { Component, input } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Course } from "../core/api";
@Component({
  selector: "app-course-card",
  imports: [DecimalPipe, RouterLink],
  template: ` <article class="course-card">
    <div class="card-top">
      <span class="eyebrow">{{
        course().category === "dev" ? "РОЗРОБКА" : "ТЕСТУВАННЯ"
      }}</span
      ><span class="card-number">0{{ course().position }}</span>
    </div>
    <div class="card-heading">
      <h3 class="gradient-heading">{{ course().title }}</h3>
      <span class="course-icon" aria-hidden="true">{{ course().icon }}</span>
    </div>
    <p class="card-description">{{ course().description }}</p>
    <p class="card-tools">{{ course().tools }}</p>
    <div class="card-meta">
      <span
        >{{ course().duration }}
        {{ course().duration === 5 ? "місяців" : "місяці" }}</span
      ><span>З нуля</span>
    </div>
    <p class="card-price">
      {{ course().price | number }} ₴ <span>/ міс.</span>
    </p>
    <a class="button button--secondary" [routerLink]="['/courses', course().id]"
      >Детальніше про курс <span aria-hidden="true">↗</span></a
    >
  </article>`,
})
export class CourseCard {
  course = input.required<Course>();
}
