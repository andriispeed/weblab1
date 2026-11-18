export interface QueryRunner {
  query(sql: string, args?: any[]): Promise<any[]>;
}

export class Initial1795000000000 {
  async up(r: QueryRunner): Promise<void> {
    await r.query(`
      CREATE TABLE courses (
        id text PRIMARY KEY, title text NOT NULL, category text NOT NULL CHECK(category IN ('dev','qa')),
        description text NOT NULL, duration integer NOT NULL CHECK(duration > 0), price integer NOT NULL CHECK(price >= 0),
        tools text NOT NULL, icon text NOT NULL, project text NOT NULL, modules jsonb NOT NULL,
        position integer NOT NULL, version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE applications (
        id uuid PRIMARY KEY, request_id uuid UNIQUE NOT NULL, fingerprint text NOT NULL,
        name text NOT NULL, email text NOT NULL, course_id text REFERENCES courses(id), message text NOT NULL DEFAULT '',
        status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','enrolled')),
        created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX applications_created ON applications(created_at DESC);
      CREATE INDEX applications_status ON applications(status, created_at DESC);
      CREATE TABLE admin_users (id uuid PRIMARY KEY, username text UNIQUE NOT NULL, password_hash text NOT NULL);
      CREATE TABLE sessions (
        token_hash text PRIMARY KEY, admin_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        csrf text NOT NULL, expires_at timestamptz NOT NULL
      );
      CREATE INDEX sessions_expiry ON sessions(expires_at);
      CREATE TABLE audit_log (
        id bigserial PRIMARY KEY, admin_id uuid REFERENCES admin_users(id), action text NOT NULL,
        entity_id text NOT NULL, details jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
      );
    `);
    const courses = [
      [
        "frontend",
        "Frontend Development",
        "dev",
        "Від першої HTML-сторінки до власного застосунку на React.",
        4,
        4200,
        "HTML · CSS · JavaScript · React",
        "</>",
        "Власний вебзастосунок",
        [
          [
            "HTML та CSS",
            "Семантична структура, адаптивна сітка та стилізація.",
          ],
          ["JavaScript", "Події, робота з DOM та асинхронні запити."],
          [
            "Компонентна розробка",
            "Інтерфейс із повторно використовуваних компонентів.",
          ],
          [
            "Власний проєкт",
            "Створення, перевірка та публікація вебзастосунку.",
          ],
        ],
      ],
      [
        "python",
        "Python Development",
        "dev",
        "Пиши зрозумілий код, працюй з даними та створюй API.",
        5,
        4500,
        "Python · SQL · Git · FastAPI",
        "py",
        "API для власного сервісу",
        [
          ["Основи Python", "Змінні, типи даних, умови, цикли та функції."],
          ["Структури даних і ООП", "Колекції, класи та організація коду."],
          ["Бази даних та API", "SQL, HTTP і створення API на FastAPI."],
          ["Власний проєкт", "Розробка, перевірка та презентація результату."],
        ],
      ],
      [
        "qa",
        "QA Engineering",
        "qa",
        "Знаходь помилки та допомагай командам створювати якісний продукт.",
        3,
        3800,
        "Test cases · SQL · Postman",
        "[✓]",
        "Тестування вебпродукту",
        [
          ["Основи тестування", "Життєвий цикл продукту та типи перевірок."],
          [
            "Тестова документація",
            "Чеклісти, тест-кейси та зрозумілі баг-репорти.",
          ],
          ["API та бази даних", "Перевірки через Postman та запити SQL."],
          [
            "Фінальний проєкт",
            "План тестування й звіт про якість вебпродукту.",
          ],
        ],
      ],
    ];
    for (const [i, c] of courses.entries()) {
      await r.query(
        `INSERT INTO courses(id,title,category,description,duration,price,tools,icon,project,modules,position) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [...c.slice(0, 9), JSON.stringify(c[9]), i + 1],
      );
    }
  }
  async down(): Promise<void> {
    throw new Error(
      "Destructive rollback is disabled. Restore a verified backup explicitly.",
    );
  }
}
