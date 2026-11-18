import "reflect-metadata";
import { Module, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { json, Request, Response, NextFunction } from "express";
import { Database } from "./database";
import { AuthService, AdminGuard, RateLimit } from "./security";
import {
  PublicController,
  AuthController,
  AdminController,
} from "./controllers";

@Module({
  controllers: [PublicController, AuthController, AdminController],
  providers: [Database, AuthService, AdminGuard, RateLimit],
})
class AppModule {}

async function bootstrap() {
  const publicUrl = new URL(
    process.env.PUBLIC_URL || "http://localhost:4200/it-school/",
  );
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    logger: ["error", "warn", "log"],
  });
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(json({ limit: "16kb", type: "application/json" }));
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", "no-store");
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      if (req.headers.origin !== publicUrl.origin)
        return res.status(403).json({ message: "Недозволене джерело запиту." });
      if (req.method !== "DELETE" && !req.is("application/json"))
        return res.status(415).json({ message: "Очікується JSON." });
    }
    next();
  });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableShutdownHooks();
  const config = new DocumentBuilder()
    .setTitle("IT.SCHOOL API")
    .setDescription(
      "Курси, заявки та захищена панель команди. Сесія в HttpOnly cookie; зміни потребують X-CSRF-Token.",
    )
    .setVersion("2.0")
    .addCookieAuth("it_school_session")
    .addServer(publicUrl.pathname.replace(/\/$/, ""))
    .build();
  SwaggerModule.setup(
    "api/docs",
    app,
    SwaggerModule.createDocument(app, config),
    {
      swaggerOptions: { supportedSubmitMethods: [] },
      customSiteTitle: "IT.SCHOOL · API",
    },
  );
  await app.init();
  await app.get(AuthService).initializeAdmin();
  await app.listen(Number(process.env.PORT || 3100), "0.0.0.0");
}
bootstrap().catch(() => {
  console.error(
    "API initialization failed. Check database connectivity and required environment variables.",
  );
  process.exit(1);
});
