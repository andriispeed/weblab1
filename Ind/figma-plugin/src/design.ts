// Shared design specification: both Figma and browser preview render this tree.
export const colors = {
  primary: '#7A5C00', hover: '#5A4400', tint: '#FFF8E6',
  ink: '#22231F', muted: '#61635B', paper: '#FAF9F6', white: '#FFFFFF',
  line: '#DEDFD6', soft: '#ECEEE6', success: '#326047', error: '#AF352C',
  dark: '#252A24', darkMuted: '#BFC6B8', darkLine: '#4C5348', lime: '#DCE5A5',
} as const;
export type Color = keyof typeof colors;
export type Item = {
  kind: 'box' | 'text' | 'instance'; name: string; w?: number | 'fill'; h?: number;
  direction?: 'row' | 'column'; gap?: number; pad?: number | [number, number, number, number];
  bg?: Color; stroke?: Color; radius?: number; align?: 'start' | 'center';
  between?: boolean; children?: Item[]; text?: string; size?: number;
  weight?: 'Regular' | 'Medium' | 'Semi Bold' | 'Bold'; color?: Color;
  line?: number; tracking?: number; textAlign?: 'left' | 'center';
  ref?: string; overrides?: Record<string, string>; target?: string;
  action?: 'back'; opacity?: number; focus?: boolean;
};
export type Component = { key: string; group: string; variant?: string; spec: Item; description: string };
export type Screen = { key: string; name: string; device: Device; spec: Item; auxiliary?: boolean };
export type Device = 'Desktop' | 'Tablet' | 'Mobile';
export const devices: Record<Device, { width: number; viewport: number; margin: number; columns: number }> = {
  Desktop: { width: 1440, viewport: 900, margin: 120, columns: 12 },
  Tablet: { width: 768, viewport: 1024, margin: 32, columns: 8 },
  Mobile: { width: 390, viewport: 844, margin: 20, columns: 4 },
};
export const components: Component[] = [];
const box = (name: string, children: Item[], props: Partial<Item> = {}): Item => ({ kind: 'box', name, direction: 'column', w: 'fill', gap: 16, children, ...props });
const text = (value: string, size = 16, weight: Item['weight'] = 'Regular', color: Color = 'ink', props: Partial<Item> = {}): Item => ({ kind: 'text', name: value.split('\n')[0].slice(0, 60), text: value, size, weight, color, line: size < 20 ? 1.5 : 1.15, w: 'fill', ...props });
const row = (name: string, children: Item[], props: Partial<Item> = {}): Item => box(name, children, { direction: 'row', ...props });
const rule = (color: Color = 'line'): Item => box('Divider', [], { h: 1, bg: color, gap: 0 });
const instance = (ref: string, w: number | 'fill', overrides: Record<string,string> = {}, target?: string): Item => ({ kind: 'instance', name: ref, ref, w, overrides, target });
function add(key: string, group: string, spec: Item, variant?: string, description = '') {
  components.push({ key, group, spec, variant, description });
}

// Components are genuine Figma masters; repeated UI uses instances.
for (const tone of ['Primary', 'Secondary', 'Dark'] as const) {
  for (const state of ['Default', 'Hover', 'Focus', 'Disabled'] as const) {
    const disabled = state === 'Disabled';
    const bg: Color = disabled ? 'soft' : tone === 'Primary' ? (state === 'Hover' ? 'hover' : 'primary') : tone === 'Dark' ? 'dark' : 'white';
    add(`button.${tone}.${state}`, 'Button', row('Button', [text('Обрати курс  ↗', 15, 'Semi Bold', disabled ? 'muted' : tone === 'Secondary' ? 'primary' : 'white', { name: 'Label', textAlign: 'center' })], {
      w: 216, h: 48, pad: [12, 20, 12, 20], align: 'center', bg,
      stroke: tone === 'Secondary' ? 'line' : undefined, radius: 4, focus: state === 'Focus',
    }), `Tone=${tone}, State=${state}`, 'Кнопка · 48 px · текст редагується в екземплярі.');
  }
}
for (const state of ['Default', 'Focus', 'Error', 'Filled'] as const) {
  add(`input.${state}`, 'Input', box('Field', [
    text('Email', 14, 'Medium', 'ink', { name: 'Label' }),
    row('Input surface', [text(state === 'Filled' ? 'andrii@example.com' : 'you@example.com', 16, 'Regular', state === 'Filled' ? 'ink' : 'muted', { name: 'Value' })], {
      pad: 12, bg: 'white', stroke: state === 'Error' ? 'error' : state === 'Focus' ? 'primary' : 'line', radius: 4,
    }),
    text(state === 'Error' ? 'Введи коректну email-адресу' : 'Для відповіді щодо навчання', 12, 'Regular', state === 'Error' ? 'error' : 'muted', { name: 'Hint' }),
  ], { w: 320, gap: 8 }), `State=${state}`, 'Поле з постійною міткою та підказкою.');
}
for (const state of ['Inactive','Active'] as const) {
  add(`tab.${state}`, 'Filter', row('Filter', [text('Усі курси', 14, 'Medium', state === 'Active' ? 'white' : 'ink', { name: 'Label', textAlign: 'center' })], {
    w: 150, pad: [10, 12, 10, 12], bg: state === 'Active' ? 'primary' : 'white', stroke: state === 'Active' ? 'primary' : 'line', radius: 4,
  }), `State=${state}`);
}
add('badge', 'Badge', row('Badge', [text('З нуля', 12, 'Semi Bold', 'primary', { name: 'Label', textAlign: 'center' })], { w: 112, pad: [6, 10, 6, 10], bg: 'tint', radius: 4 }));
add('brand', 'Brand', row('IT.SCHOOL', [
  box('Brand mark', [text('it', 19, 'Bold', 'white', { textAlign: 'center' })], { w: 36, h: 36, pad: [6, 0, 6, 0], bg: 'primary', radius: 4 }),
  text('IT.SCHOOL', 19, 'Bold', 'ink', { w: 124 }),
], { w: 172, gap: 12, align: 'center' }));
for (const [key,glyph] of [['menu','☰'],['close','×']]) {
  add(`icon.${key}`,'Icon button',row('Icon button',[text(glyph,22,'Medium','primary',{name:'Label',textAlign:'center',line:1})],{w:48,h:48,pad:12,bg:'white',stroke:'line',radius:4,align:'center'}),`Icon=${key}`);
}

const courseData = [
  { id: 'frontend', number: '01', category: 'РОЗРОБКА', title: 'Frontend\nDevelopment', short: 'Frontend Development', description: 'Від першої HTML-сторінки до власного застосунку на React.', duration: '4 місяці', tools: 'HTML · CSS · JavaScript · React', price: '4 200 ₴ / міс.', code: '</>', project: 'Власний вебзастосунок' },
  { id: 'python', number: '02', category: 'РОЗРОБКА', title: 'Python\nDevelopment', short: 'Python Development', description: 'Пиши зрозумілий код, працюй з даними та створюй API.', duration: '5 місяців', tools: 'Python · SQL · Git · FastAPI', price: '4 500 ₴ / міс.', code: 'py', project: 'API для власного сервісу' },
  { id: 'qa', number: '03', category: 'ТЕСТУВАННЯ', title: 'QA\nEngineering', short: 'QA Engineering', description: 'Знаходь помилки та допомагай командам створювати якісний продукт.', duration: '3 місяці', tools: 'Test cases · SQL · Postman', price: '3 800 ₴ / міс.', code: '[✓]', project: 'Тестування вебпродукту' },
];
for (const c of courseData) {
  add(`card.${c.id}`, 'Course card', box('Course card', [
    row('Category', [text(c.category, 11, 'Semi Bold', 'muted', { tracking: 1 }), text(c.number, 12, 'Medium', 'primary', { w: 28, textAlign: 'center' })], { align: 'center' }),
    row('Course heading', [text(c.title, 25, 'Semi Bold'), text(c.code, 26, 'Medium', 'primary', { w: 60, textAlign: 'center' })], { align: 'center' }),
    text(c.description, 15, 'Regular', 'muted', { h: 68 }),
    text(c.tools, 12, 'Medium', 'ink'),
    rule(),
    row('Metadata', [text(c.duration, 14, 'Medium'), text('З нуля', 13, 'Regular', 'muted', { w: 58 })]),
    text(c.price, 20, 'Semi Bold'),
    instance('button.Secondary.Default', 'fill', { Label: 'Детальніше про курс  ↗' }),
  ], { w: 384, pad: 24, gap: 20, bg: 'white', stroke: 'line', radius: 4 }), `Course=${c.id}`, 'Повторно використовувана картка з адаптивною шириною.');
}

const button = (label: string, target?: string, tone = 'Primary', w: number | 'fill' = 224): Item => instance(`button.${tone}.Default`, w, { Label: label }, target);
const badge = (label: string, w = 112) => instance('badge', w, { Label: label });
const target = (d: Device, page: string) => `${d}.${page}`;
const isMobile = (d: Device) => d === 'Mobile';
const contentWidth = (d: Device) => devices[d].width - 2 * devices[d].margin;
function section(d: Device, name: string, children: Item[], bg: Color = 'paper', pad?: number): Item {
  const y = pad === undefined ? isMobile(d) ? 40 : 64 : pad;
  return box(name, children, { pad: [y, devices[d].margin, y, devices[d].margin], bg, gap: isMobile(d) ? 24 : 32 });
}
function navigation(d: Device, active: string): Item {
  const navLinks = [['Головна', 'home'], ['Курси', 'catalog'], ['Контакти', 'contact']];
  const brand = instance('brand', 172, {}, target(d, 'home'));
  let children: Item[];
  if (isMobile(d)) {
    children = [brand, box('Flexible space', [], { w: 'fill' }), instance('icon.menu',48,{},target(d,'menu'))];
  } else {
    children = [brand, row('Navigation links', navLinks.map(([label, key]) => box(`Link / ${key}`, [text(label, 14, active === key ? 'Semi Bold' : 'Regular', active === key ? 'primary' : 'ink', { textAlign: 'center' })], { w: 'fill', pad: [12, 0, 12, 0], target: target(d, key) })), { gap: d === 'Desktop' ? 28 : 12 }), button(d === 'Desktop' ? 'Підібрати курс  ↗' : 'Записатися', target(d, 'contact'), 'Primary', d === 'Desktop' ? 200 : 144)];
  }
  return box('Header', [row('Header content', children, { align: 'center', gap: d === 'Desktop' ? 100 : 20, pad: [20, devices[d].margin, 20, devices[d].margin] }), rule()], { gap: 0, bg: 'white' });
}
function footer(d: Device): Item {
  return section(d, 'Footer', [
    box('Footer columns', [
      box('Brand and purpose', [text('IT.SCHOOL', 24, 'Bold', 'white'), text('Практичні навички.\nЗрозумілий шлях у професію.', 15, 'Regular', 'darkMuted')], { w: 'fill' }),
      box('Footer navigation', [text('НАВІГАЦІЯ', 11, 'Semi Bold', 'darkMuted', { tracking: 1 }), ...[['Усі курси', 'catalog'], ['Про курс Python', 'course'], ['Зв’язатися з нами', 'contact']].map(([s,p]) => text(s, 15, 'Medium', 'white', { target: target(d,p) }))], { w: d === 'Desktop' ? 260 : 'fill', gap: 12 }),
      box('Contact information', [text('Є ПИТАННЯ?', 11, 'Semi Bold', 'darkMuted', { tracking: 1 }), text('hello@it-school.example', 15, 'Medium', 'white'), text('Пн–Пт · 09:00–18:00', 14, 'Regular', 'darkMuted')], { w: d === 'Desktop' ? 280 : 'fill', gap: 12 }),
    ], { direction: isMobile(d) ? 'column' : 'row', gap: 32 }),
    rule('darkLine'),
    text('© 2026 IT.SCHOOL · Навчальний проєкт', 12, 'Regular', 'darkMuted'),
  ], 'dark', 40);
}
function heading(eyebrow: string, title: string, description: string, mobile = false): Item {
  return box(title, [text(eyebrow, 11, 'Semi Bold', 'primary', { tracking: 1.4 }), text(title, mobile ? 32 : 44, 'Semi Bold'), text(description, 16, 'Regular', 'muted')], { gap: 16 });
}
function cards(d: Device, ids = ['frontend','python','qa']): Item {
  const cols = d === 'Desktop' ? 3 : d === 'Tablet' ? 2 : 1;
  const rows: Item[] = [];
  for (let i = 0; i < ids.length; i += cols) {
    const items = ids.slice(i, i + cols).map(id => instance(`card.${id}`, 'fill', {}, target(d, id === 'python' ? 'course' : `course-${id}`)));
    // A final tablet card keeps the same width as the cards above it.
    while (items.length < cols) items.push(box('Empty grid cell', [], { w: 'fill' }));
    rows.push(row('Course grid row', items, { gap: 24 }));
  }
  return box('Course grid', rows, { gap: 24 });
}
function learningPanel(d: Device): Item {
  return box('Learning path panel', [
    row('Panel label', [text('ТВІЙ НАСТУПНИЙ КРОК', 11, 'Semi Bold', 'darkMuted', { tracking: 1 }), text('↗', 28, 'Regular', 'lime', { w: 32 })]),
    text('Від першого рядка\nдо власного проєкту.', d === 'Mobile' ? 27 : 32, 'Semi Bold', 'white'),
    ...[
      ['01', 'Розберися в основах', 'Коротка теорія та зрозумілі приклади.'],
      ['02', 'Спробуй на практиці', 'Завдання з перевіркою від ментора.'],
      ['03', 'Покажи результат', 'Завершений проєкт у портфоліо.'],
    ].map(([n,t,s]) => row(t, [text(n, 14, 'Medium', 'lime', { w: 26 }), box('Step description', [text(t, 17, 'Semi Bold', 'white'), text(s, 13, 'Regular', 'darkMuted')], { gap: 6 })], { gap: 16 })),
    rule('darkLine'),
    text('НАВЧАЙСЯ · ПРАКТИКУЙ · СТВОРЮЙ', 10, 'Semi Bold', 'darkMuted', { tracking: 1 }),
  ], { w: 'fill', bg: 'dark', pad: isMobile(d) ? 24 : 32, gap: 26, radius: 4 });
}
function home(d: Device): Item[] {
  return [
    section(d, 'Hero', [
      box('Hero layout', [
        box('Hero copy', [
          text('ОНЛАЙН-ШКОЛА ПРАКТИЧНИХ IT-НАВИЧОК', 11, 'Semi Bold', 'primary', { tracking: 1.1 }),
          text('Твій старт\nв IT.\nЗ практики.', d === 'Desktop' ? 76 : d === 'Tablet' ? 64 : 48, 'Semi Bold', 'ink', { line: 1.1, tracking: -1.6 }),
          text('Обери напрям, навчайся з ментором і створи проєкт, який покаже твої навички.', 18, 'Regular', 'muted'),
          button('Обрати свій курс  ↗', target(d,'catalog'), 'Primary', isMobile(d) ? 'fill' : 244),
          text('Для початківців · Онлайн · Українською', 12, 'Medium', 'muted'),
        ], { w: 'fill', gap: 24 }),
        learningPanel(d),
      ], { direction: d === 'Desktop' ? 'row' : 'column', gap: d === 'Desktop' ? 80 : 32 }),
    ], 'paper', isMobile(d) ? 40 : 64),
    section(d, 'Learning essentials', [box('Essentials grid', [
      ['Практика з першого тижня', 'Пиши код і розв’язуй реальні задачі.'],
      ['Підтримка ментора', 'Отримуй конкретний зворотний зв’язок.'],
      ['Проєкт у портфоліо', 'Збирай результат протягом навчання.'],
    ].map(([t,s], i) => box(t, [text(`0${i+1}`, 12, 'Semi Bold','primary'), text(t,18,'Semi Bold'),text(s,14,'Regular','muted')], { gap: 10 })), { direction: isMobile(d) ? 'column' : 'row', gap: 32 })], 'white', 32),
    section(d, 'Choose a direction', [heading('НАПРЯМИ НАВЧАННЯ', 'Знайди своє в IT.', 'Три напрями. Конкретні навички. Твій перший результат.', isMobile(d)), cards(d), button('Переглянути всі курси  ↗', target(d,'catalog'), 'Secondary', isMobile(d) ? 'fill' : 276)]),
    section(d, 'Consultation CTA', [box('CTA layout', [box('CTA copy',[text('Не знаєш, з чого почати?', isMobile(d) ? 28 : 36,'Semi Bold'),text('Розкажи про свої цілі — допоможемо обрати напрям.',16,'Regular','muted')]),button('Порадитися з нами  ↗', target(d,'contact'), 'Primary', isMobile(d) ? 'fill' : 248)], { direction: d === 'Desktop' ? 'row' : 'column', gap: 28, align: 'start' })], 'tint', 48),
  ];
}
function catalog(d: Device, filter = 'all'): Item[] {
  return [section(d, 'Catalog introduction', [heading('КАТАЛОГ / 2026', 'Навички починаються\nз вибору.', 'Обери курс під свої інтереси. Усі програми починаються з основ.', isMobile(d))], 'paper', 48),
    section(d, 'Catalog results', [
      box('Course filters', [['Усі курси','all'],['Розробка','dev'],['Тестування','qa']].map(([label,id]) => instance(`tab.${filter === id ? 'Active' : 'Inactive'}`, 'fill', { Label: label }, target(d,id === 'all' ? 'catalog' : `catalog-${id}`))), { direction: isMobile(d) ? 'column' : 'row', gap: 12, w: isMobile(d) ? 'fill' : 560 }),
      text(filter === 'all' ? '3 курси · Онлайн · Для початківців' : filter === 'dev' ? '2 курси · Розробка' : '1 курс · Тестування',14,'Regular','muted'),
      cards(d,filter === 'all' ? ['frontend','python','qa'] : filter === 'dev' ? ['frontend','python'] : ['qa']),
    ], 'paper', 24),
    section(d, 'Course selection help', [text('Кожна програма — зрозумілий маршрут.', isMobile(d) ? 28 : 36,'Semi Bold'), text('Подивись програму, навантаження та фінальний проєкт на сторінці курсу. Якщо вагаєшся — почни з консультації.',16,'Regular','muted'),button('Допоможіть обрати  ↗',target(d,'contact'),'Secondary',isMobile(d) ? 'fill' : 264)],'white',48),
  ];
}
function course(d: Device, id = 'python'): Item[] {
  const c = courseData.find(c => c.id === id)!;
  const modules = id === 'python' ? [['Основи Python','Змінні, типи даних, умови, цикли та функції.'],['Структури даних і ООП','Колекції, класи та організація коду.'],['Бази даних та API','SQL, HTTP і створення API на FastAPI.'],['Власний проєкт','Розробка, перевірка та презентація результату.']] : id === 'frontend' ? [['HTML та CSS','Семантична розмітка, стилі та адаптивні сітки.'],['JavaScript','Логіка, події, DOM та робота з API.'],['React','Компоненти, стан і маршрутизація.'],['Власний проєкт','Застосунок, тестування та публікація.']] : [['Основи тестування','Життєвий цикл продукту й типи тестування.'],['Тестова документація','Чеклісти, тест-кейси та баг-репорти.'],['API та бази даних','Postman, HTTP і основи SQL.'],['Фінальний проєкт','Перевірка продукту й звіт про якість.']];
  return [
    section(d,'Course hero',[
      text('← До каталогу курсів',14,'Medium','primary',{ target:target(d,'catalog') }),
      box('Course hero columns',[
        box('Course introduction',[badge('З НУЛЯ · ОНЛАЙН',152),text(c.title,d === 'Desktop' ? 64 : isMobile(d) ? 40 : 52,'Semi Bold'),text(c.description,18,'Regular','muted'),text(c.tools,14,'Medium','primary')],{gap:24}),
        box('Enrollment card',[text('ТВІЙ НАСТУПНИЙ КРОК',11,'Semi Bold','muted',{tracking:1}),text(c.price,32,'Semi Bold'),rule(),text(`${c.duration} · 2 заняття на тиждень`,15,'Medium'),text('Живі онлайн-заняття, практичні роботи та підтримка ментора.',15,'Regular','muted'),button('Записатися на курс  ↗',target(d,`contact-${id}`),'Primary','fill'),text('Залиш заявку — узгодимо деталі навчання.',12,'Regular','muted')],{w:d === 'Desktop' ? 380 : 'fill',pad:24,gap:20,bg:'white',stroke:'line',radius:4}),
      ],{direction:d === 'Desktop' ? 'row' : 'column',gap:d === 'Desktop' ? 80 : 32}),
    ],'paper',48),
    section(d,'Course outcomes',[heading('РЕЗУЛЬТАТ НАВЧАННЯ','Те, що зможеш робити.',`Фінальний результат: ${c.project.toLowerCase()}.`,isMobile(d)),box('Outcomes',[
      ['01','Розуміти інструменти','Використовувати основні технології напряму.'],['02','Працювати самостійно','Розбирати задачі та знаходити рішення.'],['03','Показувати результат','Презентувати власний завершений проєкт.'],
    ].map(([n,t,s])=>box(t,[text(n,12,'Semi Bold','primary'),text(t,20,'Semi Bold'),text(s,15,'Regular','muted')])),{direction:isMobile(d) ? 'column' : 'row',gap:24})],'white',48),
    section(d,'Curriculum',[heading('ПРОГРАМА КУРСУ','Крок за кроком.', 'Чотири послідовні модулі — від основ до фінального проєкту.',isMobile(d)),box('Module list',modules.map(([t,s],i)=>box(`Module ${i+1}`,[row('Module content',[text(`0${i+1}`,16,'Medium','primary',{w:40}),box('Module description',[text(t,20,'Semi Bold'),text(s,15,'Regular','muted')],{gap:8})],{gap:16,pad:[24,0,24,0]}),rule()],{gap:0})),{gap:0})]),
    section(d,'Learning format',[text('Навчайся з підтримкою.',isMobile(d) ? 28 : 36,'Semi Bold'),text('На заняттях розбираєш приклади, між заняттями практикуєшся, а ментор перевіряє твою роботу та пояснює, що покращити.',16,'Regular','muted'),button('Почати навчання  ↗',target(d,`contact-${id}`),'Primary',isMobile(d) ? 'fill' : 244)],'tint',48),
  ];
}
function contact(d: Device, courseId?: string, state: 'default' | 'filled' | 'error' = 'default'): Item[] {
  const selected = courseData.find(c=>c.id === courseId)?.short || 'Допоможіть обрати курс';
  const form = box('Consultation form',[
    text('Заявка на консультацію',24,'Semi Bold'),
    instance(`input.${state === 'filled' ? 'Filled' : 'Default'}`,'fill',{Label:'Твоє ім’я',Value:state === 'filled' ? 'Андрій' : 'Як до тебе звертатися?',Hint:'Достатньо імені'},target(d,`contact-filled${courseId ? `-${courseId}` : ''}`)),
    instance(`input.${state === 'error' ? 'Error' : state === 'filled' ? 'Filled' : 'Default'}`,'fill',{Label:'Email',Value:state === 'filled' ? 'andrii@example.com' : 'you@example.com',Hint:state === 'error' ? 'Перевір формат email: name@example.com' : 'Напишемо щодо навчання'},target(d,`contact-filled${courseId ? `-${courseId}` : ''}`)),
    instance('input.Filled','fill',{Label:'Цікавить напрям',Value:selected,Hint:'Напрям можна уточнити на консультації'}),
    text('Натискаючи кнопку, ти погоджуєшся на використання цих даних для відповіді на заявку.',12,'Regular','muted'),
    button('Надіслати заявку  ↗',target(d,state === 'filled' ? 'success' : `contact-error${courseId ? `-${courseId}` : ''}`),'Primary','fill'),
    text('Напишемо протягом одного робочого дня.',12,'Regular','muted'),
  ],{pad:isMobile(d) ? 20 : 32,gap:20,bg:'white',stroke:'line',radius:4});
  return [section(d,'Contact introduction',[heading('КОНТАКТИ ТА ЗАПИС','Почнемо з розмови.', 'Розкажи про свої цілі. Допоможемо обрати курс і відповімо на запитання.',isMobile(d))],'paper',48),section(d,'Contact content',[
    box('Contact columns',[
      box('Contact details',[text('Ми на зв’язку',28,'Semi Bold'),text('Напиши нам',12,'Medium','muted'),text('hello@it-school.example',isMobile(d) ? 20 : 24,'Semi Bold'),rule(),text('Коли відповідаємо',12,'Medium','muted'),text('Пн–Пт · 09:00–18:00',18,'Medium'),text('Зазвичай відповідаємо протягом одного робочого дня.',15,'Regular','muted'),rule(),text('Як проходить консультація',18,'Semi Bold'),text('01   Обговорюємо твій досвід\n02   Порівнюємо напрями навчання\n03   Плануємо наступний крок',15,'Regular','muted',{line:1.9})],{w:d === 'Desktop' ? 440 : 'fill',gap:20}),form,
    ],{direction:d === 'Desktop' ? 'row' : 'column',gap:d === 'Desktop' ? 96 : 32}),
  ],'paper',24)];
}
function wrap(d: Device, active: string, children: Item[]): Item {
  return box('Full page', [navigation(d,active),...children,footer(d)], { w:devices[d].width,gap:0,bg:'paper' });
}
export function getScreens(): Screen[] {
  const screens: Screen[]=[];
  for (const d of Object.keys(devices) as Device[]) {
    const make = (key:string,name:string,spec:Item,auxiliary=false) => screens.push({key:target(d,key),name,device:d,spec,auxiliary});
    make('home','01 · Головна',wrap(d,'home',home(d)));
    make('catalog','02 · Каталог курсів',wrap(d,'catalog',catalog(d)));
    make('course','03 · Курс Python',wrap(d,'catalog',course(d)));
    make('contact','04 · Контакти та запис',wrap(d,'contact',contact(d)));
    for (const filter of ['dev','qa']) make(`catalog-${filter}`,`Каталог · ${filter === 'dev' ? 'Розробка' : 'Тестування'}`,wrap(d,'catalog',catalog(d,filter)),true);
    for (const id of ['frontend','qa']) make(`course-${id}`,`Курс · ${id}`,wrap(d,'catalog',course(d,id)),true);
    // Each enrollment entry keeps its selected course through form completion.
    for (const id of ['python','frontend','qa']) make(`contact-${id}`,`Запис · ${id}`,wrap(d,'contact',contact(d,id)),true);
    for (const id of [undefined,'python','frontend','qa']) make(`contact-filled${id ? `-${id}` : ''}`,`Заповнена форма · ${id || 'консультація'}`,wrap(d,'contact',contact(d,id,'filled')),true);
    for (const id of [undefined,'python','frontend','qa']) make(`contact-error${id ? `-${id}` : ''}`,`Помилка форми · ${id || 'консультація'}`,wrap(d,'contact',contact(d,id,'error')),true);
    make('success','Заявку надіслано',wrap(d,'contact',[section(d,'Success message',[
      badge('ГОТОВО',112),text('Дякуємо!\nМи на зв’язку.',isMobile(d) ? 40 : 64,'Semi Bold'),text('Твоя заявка прийнята. Напишемо на вказаний email протягом одного робочого дня.',18,'Regular','muted'),button('Повернутися до курсів  ↗',target(d,'catalog'),'Primary',isMobile(d) ? 'fill' : 296),
    ],'tint',isMobile(d) ? 56 : 100)]),true);
    if (d === 'Mobile') make('menu','Мобільне меню',box('Mobile menu',[
      row('Menu header',[instance('brand',172),box('Space',[],{w:'fill'}),{...instance('icon.close',48),action:'back'}],{pad:20,gap:12,align:'center'}),rule(),
      box('Menu items',[... [['Головна','home'],['Каталог курсів','catalog'],['Курс Python','course'],['Контакти','contact']].map(([label,key])=>box(`Menu link ${key}`,[text(label,24,'Medium')],{pad:[16,0,16,0],target:target(d,key)})),button('Підібрати курс  ↗',target(d,'contact'),'Primary','fill')],{pad:20,gap:12}),
    ],{w:390,bg:'paper',gap:0}),true);
  }
  return screens;
}

export function getKitIntro(): Item {
  return box('Design system',[
    text('IT.SCHOOL / DESIGN SYSTEM',13,'Semi Bold','primary',{tracking:2}),
    text('Практичність\nу кожній деталі.',64,'Semi Bold'),
    text('Функціоналізм · Гірчично-коричневий #7A5C00 · Midterm checkpoint',20,'Regular','muted'),
    rule(),
    text('01 / КОЛЬОРОВА СИСТЕМА',12,'Semi Bold','primary',{tracking:1}),
    row('Palette',(['primary','paper','white','ink','muted','line'] as Color[]).map(c=>box(c,[box('Swatch',[],{h:80,bg:c,stroke:'line',radius:4}),text(c,14,'Semi Bold'),text(colors[c],13,'Regular','muted')],{gap:8})),{gap:20}),
    text('02 / ТИПОГРАФІКА · INTER',12,'Semi Bold','primary',{tracking:1}),
    text('Навички, які працюють.',48,'Semi Bold'),
    text('Заголовок секції / 32 px',32,'Semi Bold'),
    text('Основний текст / 16 px. Чітка ієрархія, короткі речення та зрозуміла навігація.',16),
    text('Підпис / 12 px · Допоміжна інформація',12,'Regular','muted'),
    rule(),
    text('03 / СІТКИ ТА ВІДСТУПИ',12,'Semi Bold','primary',{tracking:1}),
    text('Desktop 1440 / 12 колонок / поля 120\nTablet 768 / 8 колонок / поля 32\nMobile 390 / 4 колонки / поля 20',18,'Medium','ink',{line:1.7}),
    text('Відступи: 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96\nЗаокруглення: 4 px · Кнопка: 48 px · Основний фон: #FAF9F6',15,'Regular','muted',{line:1.7}),
    rule(),
    text('04 / ПОВЕДІНКА ТА СЦЕНАРІЇ',12,'Semi Bold','primary',{tracking:1}),
    text('Головна → Каталог → Курс → Запис → Підтвердження\nФільтри каталогу, сторінки трьох курсів, мобільне меню та стани форми.',18,'Medium','ink',{line:1.7}),
    text('Навчальна концепція. Назва школи, ціни та контакти — демонстраційні. Форми прототипу використовують заздалегідь підготовлені дані.',14,'Regular','muted'),
  ],{w:1440,pad:64,gap:28,bg:'white'});
}
