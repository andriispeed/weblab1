import { Routes } from "@angular/router";
import { adminGuard } from "./core/api";
export const routes: Routes = [
  {
    path: "",
    title: "IT.SCHOOL — твій старт в IT",
    loadComponent: () => import("./pages/home").then((m) => m.HomePage),
  },
  {
    path: "courses",
    title: "Курси | IT.SCHOOL",
    loadComponent: () => import("./pages/courses").then((m) => m.CoursesPage),
  },
  {
    path: "courses/:id",
    title: "Програма курсу | IT.SCHOOL",
    loadComponent: () => import("./pages/course").then((m) => m.CoursePage),
  },
  {
    path: "contact",
    title: "Заявка на консультацію | IT.SCHOOL",
    loadComponent: () => import("./pages/contact").then((m) => m.ContactPage),
  },
  {
    path: "design",
    title: "Наше дизайн-рішення | IT.SCHOOL",
    loadComponent: () => import("./pages/design").then((m) => m.DesignPage),
  },
  {
    path: "admin/login",
    title: "Вхід команди | IT.SCHOOL",
    loadComponent: () => import("./pages/login").then((m) => m.LoginPage),
  },
  {
    path: "admin",
    title: "Панель команди | IT.SCHOOL",
    canActivate: [adminGuard],
    loadComponent: () => import("./pages/admin").then((m) => m.AdminPage),
  },
  {
    path: "**",
    title: "Сторінку не знайдено | IT.SCHOOL",
    loadComponent: () =>
      import("./pages/not-found").then((m) => m.NotFoundPage),
  },
];
