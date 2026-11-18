import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Pool } from "pg";
import { Initial1795000000000, QueryRunner } from "./migrations/initial";

@Injectable()
export class Database implements OnModuleInit, OnModuleDestroy {
  private pool = new Pool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "it_school",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "it_school",
    max: 5,
    connectionTimeoutMillis: 5000,
    statement_timeout: 10000,
    idleTimeoutMillis: 30000,
  });
  constructor() {
    this.pool.on("error", () =>
      console.error("An idle database connection failed."),
    );
  }
  async onModuleInit() {
    if (!process.env.DB_PASSWORD) throw new Error("DB_PASSWORD is required");
    await this.transaction(async (manager) => {
      await manager.query("SELECT pg_advisory_xact_lock(1795000000)");
      await manager.query(
        "CREATE TABLE IF NOT EXISTS migrations (id serial PRIMARY KEY, timestamp bigint NOT NULL, name varchar NOT NULL)",
      );
      const name = "Initial1795000000000";
      if (
        !(
          await manager.query("SELECT id FROM migrations WHERE name=$1", [name])
        ).length
      ) {
        await new Initial1795000000000().up(manager);
        await manager.query(
          "INSERT INTO migrations(timestamp,name) VALUES($1,$2)",
          [1795000000000, name],
        );
      }
    });
  }
  async onModuleDestroy() {
    await this.pool.end();
  }
  async query<T = any[]>(sql: string, args: any[] = []): Promise<T> {
    return (await this.pool.query(sql, args)).rows as T;
  }
  async transaction<T>(work: (manager: QueryRunner) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await work({
        query: async (sql, args = []) => (await client.query(sql, args)).rows,
      });
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
