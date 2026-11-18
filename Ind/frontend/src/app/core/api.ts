import { DOCUMENT } from "@angular/common";
import { inject, Injectable, signal } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
} from "@angular/common/http";
import { catchError, map, of, tap } from "rxjs";
import { CanActivateFn, Router } from "@angular/router";

export interface Course {
  id: string;
  title: string;
  category: "dev" | "qa";
  description: string;
  duration: number;
  price: number;
  tools: string;
  icon: string;
  project: string;
  modules: [string, string][];
  position: number;
  version: number;
}
export interface Application {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  courseId: string | null;
  courseTitle: string;
  createdAt: string;
}
export interface ApplicationList {
  items: Application[];
  total: number;
  page: number;
  pages: number;
  stats: { total: number; new: number; contacted: number; enrolled: number };
}
export interface Receipt {
  id: string;
  createdAt: string;
  status: string;
}
export interface Session {
  username: string;
  csrf: string;
}
export interface Audit {
  action: string;
  entityId: string;
  details: Record<string, unknown>;
  createdAt: string;
}

@Injectable({ providedIn: "root" })
export class SecurityState {
  session = signal<Session | null>(null);
}
export const securityInterceptor: HttpInterceptorFn = (req, next) => {
  const state = inject(SecurityState),
    base = new URL("api/", inject(DOCUMENT).baseURI).href;
  if (
    req.url.startsWith(base) &&
    !["GET", "HEAD"].includes(req.method) &&
    state.session()
  )
    req = req.clone({ setHeaders: { "X-CSRF-Token": state.session()!.csrf } });
  return next(req);
};
@Injectable({ providedIn: "root" })
export class Api {
  private http = inject(HttpClient);
  readonly base = new URL("api/", inject(DOCUMENT).baseURI).href;
  courses() {
    return this.http.get<Course[]>(this.base + "courses");
  }
  course(id: string) {
    return this.http.get<Course>(
      this.base + "courses/" + encodeURIComponent(id),
    );
  }
  apply(data: unknown) {
    return this.http.post<Receipt>(this.base + "applications", data);
  }
  me() {
    return this.http.get<Session>(this.base + "auth/me");
  }
  login(data: unknown) {
    return this.http.post<Session>(this.base + "auth/login", data);
  }
  logout() {
    return this.http.post(this.base + "auth/logout", {});
  }
  applications(status = "", q = "", page = 1) {
    return this.http.get<ApplicationList>(this.base + "admin/applications", {
      params: { status, q, page },
    });
  }
  status(id: string, status: string) {
    return this.http.patch(this.base + "admin/applications/" + id, { status });
  }
  remove(id: string) {
    return this.http.delete(this.base + "admin/applications/" + id);
  }
  editCourse(id: string, data: unknown) {
    return this.http.patch<Course>(this.base + "admin/courses/" + id, data);
  }
  audit() {
    return this.http.get<Audit[]>(this.base + "admin/audit");
  }
}
export const adminGuard: CanActivateFn = () => {
  const api = inject(Api),
    state = inject(SecurityState),
    router = inject(Router);
  return api.me().pipe(
    tap((session) => state.session.set(session)),
    map(() => true),
    catchError(() => {
      state.session.set(null);
      return of(router.createUrlTree(["/admin/login"]));
    }),
  );
};
export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0)
      return "Немає з’єднання із сервером. Перевір інтернет і спробуй ще раз.";
    if (error.status >= 500)
      return "Сервіс тимчасово недоступний. Спробуй ще раз трохи пізніше.";
    if (typeof error.error?.message === "string") return error.error.message;
    if (error.status === 400) return "Перевір заповнені поля та повтори дію.";
  }
  return "Не вдалося виконати дію. Спробуй ще раз.";
}
