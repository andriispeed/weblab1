import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import {
  createHash,
  randomBytes,
  scrypt as rawScrypt,
  timingSafeEqual,
  randomUUID,
} from "node:crypto";
import { promisify } from "node:util";
import { Database } from "./database";
import { Request } from "express";
const scrypt = promisify(rawScrypt);
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const cookieName = "it_school_session";
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE !== "false",
  sameSite: "strict" as const,
  path: "/it-school/",
};
export type AdminRequest = Request & {
  admin?: { id: string; username: string; csrf: string; tokenHash: string };
};

@Injectable()
export class AuthService {
  constructor(private db: Database) {}
  async initializeAdmin() {
    if ((await this.db.query("SELECT id FROM admin_users LIMIT 1")).length)
      return;
    const password = process.env.ADMIN_INITIAL_PASSWORD;
    if (!password || password.length < 16)
      throw new Error(
        "ADMIN_INITIAL_PASSWORD must have at least 16 characters",
      );
    const salt = randomBytes(16).toString("hex");
    const hash = (await scrypt(password, salt, 64)) as Buffer;
    await this.db.query(
      "INSERT INTO admin_users(id,username,password_hash) VALUES ($1,$2,$3) ON CONFLICT(username) DO NOTHING",
      [
        randomUUID(),
        process.env.ADMIN_USERNAME || "admin",
        salt + ":" + hash.toString("hex"),
      ],
    );
  }
  async login(username: string, password: string) {
    const [admin] = await this.db.query(
      "SELECT * FROM admin_users WHERE username=$1",
      [username],
    );
    const [salt, hex] = admin?.password_hash?.split(":") || [
      "00000000000000000000000000000000",
      "00".repeat(64),
    ];
    const actual = (await scrypt(password, salt, 64)) as Buffer;
    if (!timingSafeEqual(actual, Buffer.from(hex, "hex")) || !admin)
      throw new UnauthorizedException("Неправильний логін або пароль.");
    const token = randomBytes(32).toString("hex"),
      csrf = randomBytes(32).toString("hex");
    await this.db.query("DELETE FROM sessions WHERE expires_at < now()");
    await this.db.query(
      "INSERT INTO sessions(token_hash,admin_id,csrf,expires_at) VALUES($1,$2,$3,now()+interval '8 hours')",
      [digest(token), admin.id, csrf],
    );
    return { token, csrf, username: admin.username };
  }
  async identify(req: AdminRequest) {
    const token = (req.headers.cookie || "")
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(cookieName + "="))
      ?.slice(cookieName.length + 1);
    if (!token || !/^[a-f0-9]{64}$/.test(token))
      throw new UnauthorizedException("Увійди до панелі команди.");
    const [session] = await this.db.query(
      "SELECT a.id,a.username,s.csrf FROM sessions s JOIN admin_users a ON a.id=s.admin_id WHERE token_hash=$1 AND expires_at>now()",
      [digest(token)],
    );
    if (!session)
      throw new UnauthorizedException("Сесія завершилася. Увійди ще раз.");
    req.admin = { ...session, tokenHash: digest(token) };
    return req.admin!;
  }
  async logout(tokenHash: string) {
    await this.db.query("DELETE FROM sessions WHERE token_hash=$1", [
      tokenHash,
    ]);
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AdminRequest>();
    const admin = await this.auth.identify(req);
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const csrf = req.headers["x-csrf-token"];
      if (
        typeof csrf !== "string" ||
        !/^[a-f0-9]{64}$/.test(csrf) ||
        !timingSafeEqual(Buffer.from(csrf), Buffer.from(admin.csrf))
      )
        throw new ForbiddenException("Онови сторінку та повтори дію.");
    }
    return true;
  }
}

@Injectable()
export class RateLimit {
  private buckets = new Map<string, { count: number; until: number }>();
  check(key: string, max: number, windowMs: number) {
    const now = Date.now();
    for (const [id, b] of this.buckets)
      if (b.until < now) this.buckets.delete(id);
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { count: 0, until: now + windowMs };
      this.buckets.set(key, bucket);
    }
    if (++bucket.count > max)
      throw new HttpException("Забагато спроб. Спробуй пізніше.", 429);
  }
}
