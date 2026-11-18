import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiCookieAuth, ApiHeader, ApiTags } from "@nestjs/swagger";
import { createHash, randomUUID } from "node:crypto";
import { Request, Response } from "express";
import { Database } from "./database";
import { ApplicationDto, CourseDto, LoginDto, StatusDto } from "./dto";
import {
  AdminGuard,
  AdminRequest,
  AuthService,
  cookieName,
  cookieOptions,
  RateLimit,
} from "./security";

const courseSelect =
  'id,title,category,description,duration,price,tools,icon,project,modules,position,version,updated_at AS "updatedAt"';
@ApiTags("Public")
@Controller()
export class PublicController {
  constructor(
    private db: Database,
    private limit: RateLimit,
  ) {}
  @Get("health") async health() {
    await this.db.query("SELECT 1");
    return { status: "ok", database: "up" };
  }
  @Get("courses") courses() {
    return this.db.query(
      `SELECT ${courseSelect} FROM courses ORDER BY position`,
    );
  }
  @Get("courses/:id") async course(@Param("id") id: string) {
    const [course] = await this.db.query(
      `SELECT ${courseSelect} FROM courses WHERE id=$1`,
      [id],
    );
    if (!course) throw new NotFoundException("Курс не знайдено.");
    return course;
  }
  @Post("applications") async apply(
    @Body() dto: ApplicationDto,
    @Req() req: Request,
  ) {
    this.limit.check("application:" + req.ip, 12, 15 * 60 * 1000);
    const fingerprint = createHash("sha256")
      .update(
        JSON.stringify([
          dto.name,
          dto.email.toLowerCase(),
          dto.course,
          dto.message,
        ]),
      )
      .digest("hex");
    const id = randomUUID();
    await this.db.query(
      "INSERT INTO applications(id,request_id,fingerprint,name,email,course_id,message) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(request_id) DO NOTHING",
      [
        id,
        dto.requestId,
        fingerprint,
        dto.name,
        dto.email.toLowerCase(),
        dto.course === "consultation" ? null : dto.course,
        dto.message,
      ],
    );
    const [row] = await this.db.query(
      'SELECT id,created_at AS "createdAt",fingerprint FROM applications WHERE request_id=$1',
      [dto.requestId],
    );
    if (row.fingerprint !== fingerprint)
      throw new ConflictException(
        "Номер запиту вже використаний. Онови сторінку.",
      );
    return { id: row.id, createdAt: row.createdAt, status: "received" };
  }
}

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private auth: AuthService,
    private limit: RateLimit,
  ) {}
  @Post("login") @HttpCode(200) async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.limit.check("login:" + req.ip, 8, 15 * 60 * 1000);
    const result = await this.auth.login(dto.username, dto.password);
    res.cookie(cookieName, result.token, {
      ...cookieOptions,
      maxAge: 8 * 60 * 60 * 1000,
    });
    return { username: result.username, csrf: result.csrf };
  }
  @Get("me") @UseGuards(AdminGuard) me(@Req() req: AdminRequest) {
    return { username: req.admin!.username, csrf: req.admin!.csrf };
  }
  @Post("logout") @HttpCode(200) @UseGuards(AdminGuard) async logout(
    @Req() req: AdminRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(req.admin!.tokenHash);
    res.clearCookie(cookieName, cookieOptions);
    return { ok: true };
  }
}

@ApiTags("Admin")
@ApiCookieAuth(cookieName)
@ApiHeader({
  name: "X-CSRF-Token",
  description: "Returned by login/me; required for mutations",
})
@UseGuards(AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(private db: Database) {}
  @Get("applications") async applications(
    @Query("status") status = "",
    @Query("q") q = "",
    @Query("page") page = "1",
  ) {
    if (status && !["new", "contacted", "enrolled"].includes(status))
      throw new BadRequestException("Невідомий статус.");
    if (q.length > 100 || !/^\d{1,6}$/.test(page) || Number(page) < 1)
      throw new BadRequestException("Некоректні фільтри.");
    const args = [status, "%" + q.replace(/[\\%_]/g, "\\$&") + "%"];
    const where =
      "WHERE ($1='' OR a.status=$1) AND (a.name ILIKE $2 OR a.email ILIKE $2 OR COALESCE(c.title,'Консультація') ILIKE $2)";
    const [{ total }] = await this.db.query(
      `SELECT count(*)::int AS total FROM applications a LEFT JOIN courses c ON c.id=a.course_id ${where}`,
      args,
    );
    const items = await this.db.query(
      `SELECT a.id,a.name,a.email,a.message,a.status,a.course_id AS "courseId",COALESCE(c.title,'Консультація') AS "courseTitle",a.created_at AS "createdAt" FROM applications a LEFT JOIN courses c ON c.id=a.course_id ${where} ORDER BY a.created_at DESC LIMIT 20 OFFSET $3`,
      [...args, (Number(page) - 1) * 20],
    );
    const [stats] = await this.db.query(
      "SELECT count(*)::int AS total,count(*) FILTER(WHERE status='new')::int AS new,count(*) FILTER(WHERE status='contacted')::int AS contacted,count(*) FILTER(WHERE status='enrolled')::int AS enrolled FROM applications",
    );
    return {
      items,
      total,
      page: Number(page),
      pages: Math.max(1, Math.ceil(total / 20)),
      stats,
    };
  }
  @Patch("applications/:id") async status(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: StatusDto,
    @Req() req: AdminRequest,
  ) {
    return this.db.transaction(async (manager) => {
      const result = await manager.query(
        "UPDATE applications SET status=$1,updated_at=now() WHERE id=$2 RETURNING id,status",
        [dto.status, id],
      );
      const rows = Array.isArray(result[0]) ? result[0] : result;
      const row = rows[0];
      if (!row) throw new NotFoundException("Заявку не знайдено.");
      await manager.query(
        "INSERT INTO audit_log(admin_id,action,entity_id,details) VALUES($1,'application.status',$2,$3)",
        [req.admin!.id, id, JSON.stringify({ status: dto.status })],
      );
      return row;
    });
  }
  @Delete("applications/:id") async remove(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: AdminRequest,
  ) {
    return this.db.transaction(async (manager) => {
      const rows = await manager.query(
        "DELETE FROM applications WHERE id=$1 RETURNING id",
        [id],
      );
      const removed = Array.isArray(rows[0]) ? rows[0] : rows;
      if (!removed.length) throw new NotFoundException("Заявку не знайдено.");
      await manager.query(
        "INSERT INTO audit_log(admin_id,action,entity_id) VALUES($1,'application.delete',$2)",
        [req.admin!.id, id],
      );
      return { ok: true };
    });
  }
  @Patch("courses/:id") async editCourse(
    @Param("id") id: string,
    @Body() dto: CourseDto,
    @Req() req: AdminRequest,
  ) {
    return this.db.transaction(async (manager) => {
      const result = await manager.query(
        "UPDATE courses SET price=$1,description=$2,version=version+1,updated_at=now() WHERE id=$3 AND version=$4 RETURNING " +
          courseSelect,
        [dto.price, dto.description, id, dto.version],
      );
      const rows = Array.isArray(result[0]) ? result[0] : result;
      if (!rows.length)
        throw new ConflictException(
          "Курс уже змінено. Онови список та спробуй ще раз.",
        );
      await manager.query(
        "INSERT INTO audit_log(admin_id,action,entity_id,details) VALUES($1,'course.update',$2,$3)",
        [
          req.admin!.id,
          id,
          JSON.stringify({ price: dto.price, version: dto.version + 1 }),
        ],
      );
      return rows[0];
    });
  }
  @Get("audit") audit() {
    return this.db.query(
      'SELECT action,entity_id AS "entityId",details,created_at AS "createdAt" FROM audit_log ORDER BY id DESC LIMIT 30',
    );
  }
}
