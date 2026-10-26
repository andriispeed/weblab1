"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // src/design.ts
  var colors = {
    primary: "#7A5C00",
    hover: "#5A4400",
    tint: "#FFF8E6",
    ink: "#22231F",
    muted: "#61635B",
    paper: "#FAF9F6",
    white: "#FFFFFF",
    line: "#DEDFD6",
    soft: "#ECEEE6",
    success: "#326047",
    error: "#AF352C",
    dark: "#252A24",
    darkMuted: "#BFC6B8",
    darkLine: "#4C5348",
    lime: "#DCE5A5"
  };
  var devices = {
    Desktop: { width: 1440, viewport: 900, margin: 120, columns: 12 },
    Tablet: { width: 768, viewport: 1024, margin: 32, columns: 8 },
    Mobile: { width: 390, viewport: 844, margin: 20, columns: 4 }
  };
  var components = [];
  var box = (name, children, props = {}) => __spreadValues({ kind: "box", name, direction: "column", w: "fill", gap: 16, children }, props);
  var text = (value, size = 16, weight = "Regular", color = "ink", props = {}) => __spreadValues({ kind: "text", name: value.split("\n")[0].slice(0, 60), text: value, size, weight, color, line: size < 20 ? 1.5 : 1.15, w: "fill" }, props);
  var row = (name, children, props = {}) => box(name, children, __spreadValues({ direction: "row" }, props));
  var rule = (color = "line") => box("Divider", [], { h: 1, bg: color, gap: 0 });
  var instance = (ref, w, overrides = {}, target2) => ({ kind: "instance", name: ref, ref, w, overrides, target: target2 });
  function add(key, group, spec, variant, description = "") {
    components.push({ key, group, spec, variant, description });
  }
  for (const tone of ["Primary", "Secondary", "Dark"]) {
    for (const state of ["Default", "Hover", "Focus", "Disabled"]) {
      const disabled = state === "Disabled";
      const bg = disabled ? "soft" : tone === "Primary" ? state === "Hover" ? "hover" : "primary" : tone === "Dark" ? "dark" : "white";
      add(`button.${tone}.${state}`, "Button", row("Button", [text("\u041E\u0431\u0440\u0430\u0442\u0438 \u043A\u0443\u0440\u0441  \u2197", 15, "Semi Bold", disabled ? "muted" : tone === "Secondary" ? "primary" : "white", { name: "Label", textAlign: "center" })], {
        w: 216,
        h: 48,
        pad: [12, 20, 12, 20],
        align: "center",
        bg,
        stroke: tone === "Secondary" ? "line" : void 0,
        radius: 4,
        focus: state === "Focus"
      }), `Tone=${tone}, State=${state}`, "\u041A\u043D\u043E\u043F\u043A\u0430 \xB7 48 px \xB7 \u0442\u0435\u043A\u0441\u0442 \u0440\u0435\u0434\u0430\u0433\u0443\u0454\u0442\u044C\u0441\u044F \u0432 \u0435\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0456.");
    }
  }
  for (const state of ["Default", "Focus", "Error", "Filled"]) {
    add(`input.${state}`, "Input", box("Field", [
      text("Email", 14, "Medium", "ink", { name: "Label" }),
      row("Input surface", [text(state === "Filled" ? "andrii@example.com" : "you@example.com", 16, "Regular", state === "Filled" ? "ink" : "muted", { name: "Value" })], {
        pad: 12,
        bg: "white",
        stroke: state === "Error" ? "error" : state === "Focus" ? "primary" : "line",
        radius: 4
      }),
      text(state === "Error" ? "\u0412\u0432\u0435\u0434\u0438 \u043A\u043E\u0440\u0435\u043A\u0442\u043D\u0443 email-\u0430\u0434\u0440\u0435\u0441\u0443" : "\u0414\u043B\u044F \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0456 \u0449\u043E\u0434\u043E \u043D\u0430\u0432\u0447\u0430\u043D\u043D\u044F", 12, "Regular", state === "Error" ? "error" : "muted", { name: "Hint" })
    ], { w: 320, gap: 8 }), `State=${state}`, "\u041F\u043E\u043B\u0435 \u0437 \u043F\u043E\u0441\u0442\u0456\u0439\u043D\u043E\u044E \u043C\u0456\u0442\u043A\u043E\u044E \u0442\u0430 \u043F\u0456\u0434\u043A\u0430\u0437\u043A\u043E\u044E.");
  }
  for (const state of ["Inactive", "Active"]) {
    add(`tab.${state}`, "Filter", row("Filter", [text("\u0423\u0441\u0456 \u043A\u0443\u0440\u0441\u0438", 14, "Medium", state === "Active" ? "white" : "ink", { name: "Label", textAlign: "center" })], {
      w: 150,
      pad: [10, 12, 10, 12],
      bg: state === "Active" ? "primary" : "white",
      stroke: state === "Active" ? "primary" : "line",
      radius: 4
    }), `State=${state}`);
  }
  add("badge", "Badge", row("Badge", [text("\u0417 \u043D\u0443\u043B\u044F", 12, "Semi Bold", "primary", { name: "Label", textAlign: "center" })], { w: 112, pad: [6, 10, 6, 10], bg: "tint", radius: 4 }));
  add("brand", "Brand", row("IT.SCHOOL", [
    box("Brand mark", [text("it", 19, "Bold", "white", { textAlign: "center" })], { w: 36, h: 36, pad: [6, 0, 6, 0], bg: "primary", radius: 4 }),
    text("IT.SCHOOL", 19, "Bold", "ink", { w: 124 })
  ], { w: 172, gap: 12, align: "center" }));
  for (const [key, glyph] of [["menu", "\u2630"], ["close", "\xD7"]]) {
    add(`icon.${key}`, "Icon button", row("Icon button", [text(glyph, 22, "Medium", "primary", { name: "Label", textAlign: "center", line: 1 })], { w: 48, h: 48, pad: 12, bg: "white", stroke: "line", radius: 4, align: "center" }), `Icon=${key}`);
  }
  var courseData = [
    { id: "frontend", number: "01", category: "\u0420\u041E\u0417\u0420\u041E\u0411\u041A\u0410", title: "Frontend\nDevelopment", short: "Frontend Development", description: "\u0412\u0456\u0434 \u043F\u0435\u0440\u0448\u043E\u0457 HTML-\u0441\u0442\u043E\u0440\u0456\u043D\u043A\u0438 \u0434\u043E \u0432\u043B\u0430\u0441\u043D\u043E\u0433\u043E \u0437\u0430\u0441\u0442\u043E\u0441\u0443\u043D\u043A\u0443 \u043D\u0430 React.", duration: "4 \u043C\u0456\u0441\u044F\u0446\u0456", tools: "HTML \xB7 CSS \xB7 JavaScript \xB7 React", price: "4 200 \u20B4 / \u043C\u0456\u0441.", code: "</>", project: "\u0412\u043B\u0430\u0441\u043D\u0438\u0439 \u0432\u0435\u0431\u0437\u0430\u0441\u0442\u043E\u0441\u0443\u043D\u043E\u043A" },
    { id: "python", number: "02", category: "\u0420\u041E\u0417\u0420\u041E\u0411\u041A\u0410", title: "Python\nDevelopment", short: "Python Development", description: "\u041F\u0438\u0448\u0438 \u0437\u0440\u043E\u0437\u0443\u043C\u0456\u043B\u0438\u0439 \u043A\u043E\u0434, \u043F\u0440\u0430\u0446\u044E\u0439 \u0437 \u0434\u0430\u043D\u0438\u043C\u0438 \u0442\u0430 \u0441\u0442\u0432\u043E\u0440\u044E\u0439 API.", duration: "5 \u043C\u0456\u0441\u044F\u0446\u0456\u0432", tools: "Python \xB7 SQL \xB7 Git \xB7 FastAPI", price: "4 500 \u20B4 / \u043C\u0456\u0441.", code: "py", project: "API \u0434\u043B\u044F \u0432\u043B\u0430\u0441\u043D\u043E\u0433\u043E \u0441\u0435\u0440\u0432\u0456\u0441\u0443" },
    { id: "qa", number: "03", category: "\u0422\u0415\u0421\u0422\u0423\u0412\u0410\u041D\u041D\u042F", title: "QA\nEngineering", short: "QA Engineering", description: "\u0417\u043D\u0430\u0445\u043E\u0434\u044C \u043F\u043E\u043C\u0438\u043B\u043A\u0438 \u0442\u0430 \u0434\u043E\u043F\u043E\u043C\u0430\u0433\u0430\u0439 \u043A\u043E\u043C\u0430\u043D\u0434\u0430\u043C \u0441\u0442\u0432\u043E\u0440\u044E\u0432\u0430\u0442\u0438 \u044F\u043A\u0456\u0441\u043D\u0438\u0439 \u043F\u0440\u043E\u0434\u0443\u043A\u0442.", duration: "3 \u043C\u0456\u0441\u044F\u0446\u0456", tools: "Test cases \xB7 SQL \xB7 Postman", price: "3 800 \u20B4 / \u043C\u0456\u0441.", code: "[\u2713]", project: "\u0422\u0435\u0441\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0432\u0435\u0431\u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0443" }
  ];
  for (const c of courseData) {
    add(`card.${c.id}`, "Course card", box("Course card", [
      row("Category", [text(c.category, 11, "Semi Bold", "muted", { tracking: 1 }), text(c.number, 12, "Medium", "primary", { w: 28, textAlign: "center" })], { align: "center" }),
      row("Course heading", [text(c.title, 25, "Semi Bold"), text(c.code, 26, "Medium", "primary", { w: 60, textAlign: "center" })], { align: "center" }),
      text(c.description, 15, "Regular", "muted", { h: 68 }),
      text(c.tools, 12, "Medium", "ink"),
      rule(),
      row("Metadata", [text(c.duration, 14, "Medium"), text("\u0417 \u043D\u0443\u043B\u044F", 13, "Regular", "muted", { w: 58 })]),
      text(c.price, 20, "Semi Bold"),
      instance("button.Secondary.Default", "fill", { Label: "\u0414\u0435\u0442\u0430\u043B\u044C\u043D\u0456\u0448\u0435 \u043F\u0440\u043E \u043A\u0443\u0440\u0441  \u2197" })
    ], { w: 384, pad: 24, gap: 20, bg: "white", stroke: "line", radius: 4 }), `Course=${c.id}`, "\u041F\u043E\u0432\u0442\u043E\u0440\u043D\u043E \u0432\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u043E\u0432\u0443\u0432\u0430\u043D\u0430 \u043A\u0430\u0440\u0442\u043A\u0430 \u0437 \u0430\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u043E\u044E \u0448\u0438\u0440\u0438\u043D\u043E\u044E.");
  }
  var button = (label, target2, tone = "Primary", w = 224) => instance(`button.${tone}.Default`, w, { Label: label }, target2);
  var badge = (label, w = 112) => instance("badge", w, { Label: label });
  var target = (d, page) => `${d}.${page}`;
  var isMobile = (d) => d === "Mobile";
  function section(d, name, children, bg = "paper", pad) {
    const y = pad === void 0 ? isMobile(d) ? 40 : 64 : pad;
    return box(name, children, { pad: [y, devices[d].margin, y, devices[d].margin], bg, gap: isMobile(d) ? 24 : 32 });
  }
  function navigation(d, active) {
    const navLinks = [["\u0413\u043E\u043B\u043E\u0432\u043D\u0430", "home"], ["\u041A\u0443\u0440\u0441\u0438", "catalog"], ["\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u0438", "contact"]];
    const brand = instance("brand", 172, {}, target(d, "home"));
    let children;
    if (isMobile(d)) {
      children = [brand, box("Flexible space", [], { w: "fill" }), instance("icon.menu", 48, {}, target(d, "menu"))];
    } else {
      children = [brand, row("Navigation links", navLinks.map(([label, key]) => box(`Link / ${key}`, [text(label, 14, active === key ? "Semi Bold" : "Regular", active === key ? "primary" : "ink", { textAlign: "center" })], { w: "fill", pad: [12, 0, 12, 0], target: target(d, key) })), { gap: d === "Desktop" ? 28 : 12 }), button(d === "Desktop" ? "\u041F\u0456\u0434\u0456\u0431\u0440\u0430\u0442\u0438 \u043A\u0443\u0440\u0441  \u2197" : "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u0438\u0441\u044F", target(d, "contact"), "Primary", d === "Desktop" ? 200 : 144)];
    }
    return box("Header", [row("Header content", children, { align: "center", gap: d === "Desktop" ? 100 : 20, pad: [20, devices[d].margin, 20, devices[d].margin] }), rule()], { gap: 0, bg: "white" });
  }
  function footer(d) {
    return section(d, "Footer", [
      box("Footer columns", [
        box("Brand and purpose", [text("IT.SCHOOL", 24, "Bold", "white"), text("\u041F\u0440\u0430\u043A\u0442\u0438\u0447\u043D\u0456 \u043D\u0430\u0432\u0438\u0447\u043A\u0438.\n\u0417\u0440\u043E\u0437\u0443\u043C\u0456\u043B\u0438\u0439 \u0448\u043B\u044F\u0445 \u0443 \u043F\u0440\u043E\u0444\u0435\u0441\u0456\u044E.", 15, "Regular", "darkMuted")], { w: "fill" }),
        box("Footer navigation", [text("\u041D\u0410\u0412\u0406\u0413\u0410\u0426\u0406\u042F", 11, "Semi Bold", "darkMuted", { tracking: 1 }), ...[["\u0423\u0441\u0456 \u043A\u0443\u0440\u0441\u0438", "catalog"], ["\u041F\u0440\u043E \u043A\u0443\u0440\u0441 Python", "course"], ["\u0417\u0432\u2019\u044F\u0437\u0430\u0442\u0438\u0441\u044F \u0437 \u043D\u0430\u043C\u0438", "contact"]].map(([s, p]) => text(s, 15, "Medium", "white", { target: target(d, p) }))], { w: d === "Desktop" ? 260 : "fill", gap: 12 }),
        box("Contact information", [text("\u0404 \u041F\u0418\u0422\u0410\u041D\u041D\u042F?", 11, "Semi Bold", "darkMuted", { tracking: 1 }), text("hello@it-school.example", 15, "Medium", "white"), text("\u041F\u043D\u2013\u041F\u0442 \xB7 09:00\u201318:00", 14, "Regular", "darkMuted")], { w: d === "Desktop" ? 280 : "fill", gap: 12 })
      ], { direction: isMobile(d) ? "column" : "row", gap: 32 }),
      rule("darkLine"),
      text("\xA9 2026 IT.SCHOOL \xB7 \u041D\u0430\u0432\u0447\u0430\u043B\u044C\u043D\u0438\u0439 \u043F\u0440\u043E\u0454\u043A\u0442", 12, "Regular", "darkMuted")
    ], "dark", 40);
  }
  function heading(eyebrow, title, description, mobile = false) {
    return box(title, [text(eyebrow, 11, "Semi Bold", "primary", { tracking: 1.4 }), text(title, mobile ? 32 : 44, "Semi Bold"), text(description, 16, "Regular", "muted")], { gap: 16 });
  }
  function cards(d, ids = ["frontend", "python", "qa"]) {
    const cols = d === "Desktop" ? 3 : d === "Tablet" ? 2 : 1;
    const rows = [];
    for (let i = 0; i < ids.length; i += cols) {
      const items = ids.slice(i, i + cols).map((id) => instance(`card.${id}`, "fill", {}, target(d, id === "python" ? "course" : `course-${id}`)));
      while (items.length < cols) items.push(box("Empty grid cell", [], { w: "fill" }));
      rows.push(row("Course grid row", items, { gap: 24 }));
    }
    return box("Course grid", rows, { gap: 24 });
  }
  function learningPanel(d) {
    return box("Learning path panel", [
      row("Panel label", [text("\u0422\u0412\u0406\u0419 \u041D\u0410\u0421\u0422\u0423\u041F\u041D\u0418\u0419 \u041A\u0420\u041E\u041A", 11, "Semi Bold", "darkMuted", { tracking: 1 }), text("\u2197", 28, "Regular", "lime", { w: 32 })]),
      text("\u0412\u0456\u0434 \u043F\u0435\u0440\u0448\u043E\u0433\u043E \u0440\u044F\u0434\u043A\u0430\n\u0434\u043E \u0432\u043B\u0430\u0441\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0454\u043A\u0442\u0443.", d === "Mobile" ? 27 : 32, "Semi Bold", "white"),
      ...[
        ["01", "\u0420\u043E\u0437\u0431\u0435\u0440\u0438\u0441\u044F \u0432 \u043E\u0441\u043D\u043E\u0432\u0430\u0445", "\u041A\u043E\u0440\u043E\u0442\u043A\u0430 \u0442\u0435\u043E\u0440\u0456\u044F \u0442\u0430 \u0437\u0440\u043E\u0437\u0443\u043C\u0456\u043B\u0456 \u043F\u0440\u0438\u043A\u043B\u0430\u0434\u0438."],
        ["02", "\u0421\u043F\u0440\u043E\u0431\u0443\u0439 \u043D\u0430 \u043F\u0440\u0430\u043A\u0442\u0438\u0446\u0456", "\u0417\u0430\u0432\u0434\u0430\u043D\u043D\u044F \u0437 \u043F\u0435\u0440\u0435\u0432\u0456\u0440\u043A\u043E\u044E \u0432\u0456\u0434 \u043C\u0435\u043D\u0442\u043E\u0440\u0430."],
        ["03", "\u041F\u043E\u043A\u0430\u0436\u0438 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", "\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u0439 \u043F\u0440\u043E\u0454\u043A\u0442 \u0443 \u043F\u043E\u0440\u0442\u0444\u043E\u043B\u0456\u043E."]
      ].map(([n, t, s]) => row(t, [text(n, 14, "Medium", "lime", { w: 26 }), box("Step description", [text(t, 17, "Semi Bold", "white"), text(s, 13, "Regular", "darkMuted")], { gap: 6 })], { gap: 16 })),
      rule("darkLine"),
      text("\u041D\u0410\u0412\u0427\u0410\u0419\u0421\u042F \xB7 \u041F\u0420\u0410\u041A\u0422\u0418\u041A\u0423\u0419 \xB7 \u0421\u0422\u0412\u041E\u0420\u042E\u0419", 10, "Semi Bold", "darkMuted", { tracking: 1 })
    ], { w: "fill", bg: "dark", pad: isMobile(d) ? 24 : 32, gap: 26, radius: 4 });
  }
  function home(d) {
    return [
      section(d, "Hero", [
        box("Hero layout", [
          box("Hero copy", [
            text("\u041E\u041D\u041B\u0410\u0419\u041D-\u0428\u041A\u041E\u041B\u0410 \u041F\u0420\u0410\u041A\u0422\u0418\u0427\u041D\u0418\u0425 IT-\u041D\u0410\u0412\u0418\u0427\u041E\u041A", 11, "Semi Bold", "primary", { tracking: 1.1 }),
            text("\u0422\u0432\u0456\u0439 \u0441\u0442\u0430\u0440\u0442\n\u0432 IT.\n\u0417 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438.", d === "Desktop" ? 76 : d === "Tablet" ? 64 : 48, "Semi Bold", "ink", { line: 1.1, tracking: -1.6 }),
            text("\u041E\u0431\u0435\u0440\u0438 \u043D\u0430\u043F\u0440\u044F\u043C, \u043D\u0430\u0432\u0447\u0430\u0439\u0441\u044F \u0437 \u043C\u0435\u043D\u0442\u043E\u0440\u043E\u043C \u0456 \u0441\u0442\u0432\u043E\u0440\u0438 \u043F\u0440\u043E\u0454\u043A\u0442, \u044F\u043A\u0438\u0439 \u043F\u043E\u043A\u0430\u0436\u0435 \u0442\u0432\u043E\u0457 \u043D\u0430\u0432\u0438\u0447\u043A\u0438.", 18, "Regular", "muted"),
            button("\u041E\u0431\u0440\u0430\u0442\u0438 \u0441\u0432\u0456\u0439 \u043A\u0443\u0440\u0441  \u2197", target(d, "catalog"), "Primary", isMobile(d) ? "fill" : 244),
            text("\u0414\u043B\u044F \u043F\u043E\u0447\u0430\u0442\u043A\u0456\u0432\u0446\u0456\u0432 \xB7 \u041E\u043D\u043B\u0430\u0439\u043D \xB7 \u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u043E\u044E", 12, "Medium", "muted")
          ], { w: "fill", gap: 24 }),
          learningPanel(d)
        ], { direction: d === "Desktop" ? "row" : "column", gap: d === "Desktop" ? 80 : 32 })
      ], "paper", isMobile(d) ? 40 : 64),
      section(d, "Learning essentials", [box("Essentials grid", [
        ["\u041F\u0440\u0430\u043A\u0442\u0438\u043A\u0430 \u0437 \u043F\u0435\u0440\u0448\u043E\u0433\u043E \u0442\u0438\u0436\u043D\u044F", "\u041F\u0438\u0448\u0438 \u043A\u043E\u0434 \u0456 \u0440\u043E\u0437\u0432\u2019\u044F\u0437\u0443\u0439 \u0440\u0435\u0430\u043B\u044C\u043D\u0456 \u0437\u0430\u0434\u0430\u0447\u0456."],
        ["\u041F\u0456\u0434\u0442\u0440\u0438\u043C\u043A\u0430 \u043C\u0435\u043D\u0442\u043E\u0440\u0430", "\u041E\u0442\u0440\u0438\u043C\u0443\u0439 \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u0438\u0439 \u0437\u0432\u043E\u0440\u043E\u0442\u043D\u0438\u0439 \u0437\u0432\u2019\u044F\u0437\u043E\u043A."],
        ["\u041F\u0440\u043E\u0454\u043A\u0442 \u0443 \u043F\u043E\u0440\u0442\u0444\u043E\u043B\u0456\u043E", "\u0417\u0431\u0438\u0440\u0430\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u043F\u0440\u043E\u0442\u044F\u0433\u043E\u043C \u043D\u0430\u0432\u0447\u0430\u043D\u043D\u044F."]
      ].map(([t, s], i) => box(t, [text(`0${i + 1}`, 12, "Semi Bold", "primary"), text(t, 18, "Semi Bold"), text(s, 14, "Regular", "muted")], { gap: 10 })), { direction: isMobile(d) ? "column" : "row", gap: 32 })], "white", 32),
      section(d, "Choose a direction", [heading("\u041D\u0410\u041F\u0420\u042F\u041C\u0418 \u041D\u0410\u0412\u0427\u0410\u041D\u041D\u042F", "\u0417\u043D\u0430\u0439\u0434\u0438 \u0441\u0432\u043E\u0454 \u0432 IT.", "\u0422\u0440\u0438 \u043D\u0430\u043F\u0440\u044F\u043C\u0438. \u041A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u0456 \u043D\u0430\u0432\u0438\u0447\u043A\u0438. \u0422\u0432\u0456\u0439 \u043F\u0435\u0440\u0448\u0438\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442.", isMobile(d)), cards(d), button("\u041F\u0435\u0440\u0435\u0433\u043B\u044F\u043D\u0443\u0442\u0438 \u0432\u0441\u0456 \u043A\u0443\u0440\u0441\u0438  \u2197", target(d, "catalog"), "Secondary", isMobile(d) ? "fill" : 276)]),
      section(d, "Consultation CTA", [box("CTA layout", [box("CTA copy", [text("\u041D\u0435 \u0437\u043D\u0430\u0454\u0448, \u0437 \u0447\u043E\u0433\u043E \u043F\u043E\u0447\u0430\u0442\u0438?", isMobile(d) ? 28 : 36, "Semi Bold"), text("\u0420\u043E\u0437\u043A\u0430\u0436\u0438 \u043F\u0440\u043E \u0441\u0432\u043E\u0457 \u0446\u0456\u043B\u0456 \u2014 \u0434\u043E\u043F\u043E\u043C\u043E\u0436\u0435\u043C\u043E \u043E\u0431\u0440\u0430\u0442\u0438 \u043D\u0430\u043F\u0440\u044F\u043C.", 16, "Regular", "muted")]), button("\u041F\u043E\u0440\u0430\u0434\u0438\u0442\u0438\u0441\u044F \u0437 \u043D\u0430\u043C\u0438  \u2197", target(d, "contact"), "Primary", isMobile(d) ? "fill" : 248)], { direction: d === "Desktop" ? "row" : "column", gap: 28, align: "start" })], "tint", 48)
    ];
  }
  function catalog(d, filter = "all") {
    return [
      section(d, "Catalog introduction", [heading("\u041A\u0410\u0422\u0410\u041B\u041E\u0413 / 2026", "\u041D\u0430\u0432\u0438\u0447\u043A\u0438 \u043F\u043E\u0447\u0438\u043D\u0430\u044E\u0442\u044C\u0441\u044F\n\u0437 \u0432\u0438\u0431\u043E\u0440\u0443.", "\u041E\u0431\u0435\u0440\u0438 \u043A\u0443\u0440\u0441 \u043F\u0456\u0434 \u0441\u0432\u043E\u0457 \u0456\u043D\u0442\u0435\u0440\u0435\u0441\u0438. \u0423\u0441\u0456 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u0438 \u043F\u043E\u0447\u0438\u043D\u0430\u044E\u0442\u044C\u0441\u044F \u0437 \u043E\u0441\u043D\u043E\u0432.", isMobile(d))], "paper", 48),
      section(d, "Catalog results", [
        box("Course filters", [["\u0423\u0441\u0456 \u043A\u0443\u0440\u0441\u0438", "all"], ["\u0420\u043E\u0437\u0440\u043E\u0431\u043A\u0430", "dev"], ["\u0422\u0435\u0441\u0442\u0443\u0432\u0430\u043D\u043D\u044F", "qa"]].map(([label, id]) => instance(`tab.${filter === id ? "Active" : "Inactive"}`, "fill", { Label: label }, target(d, id === "all" ? "catalog" : `catalog-${id}`))), { direction: isMobile(d) ? "column" : "row", gap: 12, w: isMobile(d) ? "fill" : 560 }),
        text(filter === "all" ? "3 \u043A\u0443\u0440\u0441\u0438 \xB7 \u041E\u043D\u043B\u0430\u0439\u043D \xB7 \u0414\u043B\u044F \u043F\u043E\u0447\u0430\u0442\u043A\u0456\u0432\u0446\u0456\u0432" : filter === "dev" ? "2 \u043A\u0443\u0440\u0441\u0438 \xB7 \u0420\u043E\u0437\u0440\u043E\u0431\u043A\u0430" : "1 \u043A\u0443\u0440\u0441 \xB7 \u0422\u0435\u0441\u0442\u0443\u0432\u0430\u043D\u043D\u044F", 14, "Regular", "muted"),
        cards(d, filter === "all" ? ["frontend", "python", "qa"] : filter === "dev" ? ["frontend", "python"] : ["qa"])
      ], "paper", 24),
      section(d, "Course selection help", [text("\u041A\u043E\u0436\u043D\u0430 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u0430 \u2014 \u0437\u0440\u043E\u0437\u0443\u043C\u0456\u043B\u0438\u0439 \u043C\u0430\u0440\u0448\u0440\u0443\u0442.", isMobile(d) ? 28 : 36, "Semi Bold"), text("\u041F\u043E\u0434\u0438\u0432\u0438\u0441\u044C \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u0443, \u043D\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F \u0442\u0430 \u0444\u0456\u043D\u0430\u043B\u044C\u043D\u0438\u0439 \u043F\u0440\u043E\u0454\u043A\u0442 \u043D\u0430 \u0441\u0442\u043E\u0440\u0456\u043D\u0446\u0456 \u043A\u0443\u0440\u0441\u0443. \u042F\u043A\u0449\u043E \u0432\u0430\u0433\u0430\u0454\u0448\u0441\u044F \u2014 \u043F\u043E\u0447\u043D\u0438 \u0437 \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0456\u0457.", 16, "Regular", "muted"), button("\u0414\u043E\u043F\u043E\u043C\u043E\u0436\u0456\u0442\u044C \u043E\u0431\u0440\u0430\u0442\u0438  \u2197", target(d, "contact"), "Secondary", isMobile(d) ? "fill" : 264)], "white", 48)
    ];
  }
  function course(d, id = "python") {
    const c = courseData.find((c2) => c2.id === id);
    const modules = id === "python" ? [["\u041E\u0441\u043D\u043E\u0432\u0438 Python", "\u0417\u043C\u0456\u043D\u043D\u0456, \u0442\u0438\u043F\u0438 \u0434\u0430\u043D\u0438\u0445, \u0443\u043C\u043E\u0432\u0438, \u0446\u0438\u043A\u043B\u0438 \u0442\u0430 \u0444\u0443\u043D\u043A\u0446\u0456\u0457."], ["\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0438 \u0434\u0430\u043D\u0438\u0445 \u0456 \u041E\u041E\u041F", "\u041A\u043E\u043B\u0435\u043A\u0446\u0456\u0457, \u043A\u043B\u0430\u0441\u0438 \u0442\u0430 \u043E\u0440\u0433\u0430\u043D\u0456\u0437\u0430\u0446\u0456\u044F \u043A\u043E\u0434\u0443."], ["\u0411\u0430\u0437\u0438 \u0434\u0430\u043D\u0438\u0445 \u0442\u0430 API", "SQL, HTTP \u0456 \u0441\u0442\u0432\u043E\u0440\u0435\u043D\u043D\u044F API \u043D\u0430 FastAPI."], ["\u0412\u043B\u0430\u0441\u043D\u0438\u0439 \u043F\u0440\u043E\u0454\u043A\u0442", "\u0420\u043E\u0437\u0440\u043E\u0431\u043A\u0430, \u043F\u0435\u0440\u0435\u0432\u0456\u0440\u043A\u0430 \u0442\u0430 \u043F\u0440\u0435\u0437\u0435\u043D\u0442\u0430\u0446\u0456\u044F \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0443."]] : id === "frontend" ? [["HTML \u0442\u0430 CSS", "\u0421\u0435\u043C\u0430\u043D\u0442\u0438\u0447\u043D\u0430 \u0440\u043E\u0437\u043C\u0456\u0442\u043A\u0430, \u0441\u0442\u0438\u043B\u0456 \u0442\u0430 \u0430\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u0456 \u0441\u0456\u0442\u043A\u0438."], ["JavaScript", "\u041B\u043E\u0433\u0456\u043A\u0430, \u043F\u043E\u0434\u0456\u0457, DOM \u0442\u0430 \u0440\u043E\u0431\u043E\u0442\u0430 \u0437 API."], ["React", "\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0438, \u0441\u0442\u0430\u043D \u0456 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0438\u0437\u0430\u0446\u0456\u044F."], ["\u0412\u043B\u0430\u0441\u043D\u0438\u0439 \u043F\u0440\u043E\u0454\u043A\u0442", "\u0417\u0430\u0441\u0442\u043E\u0441\u0443\u043D\u043E\u043A, \u0442\u0435\u0441\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0442\u0430 \u043F\u0443\u0431\u043B\u0456\u043A\u0430\u0446\u0456\u044F."]] : [["\u041E\u0441\u043D\u043E\u0432\u0438 \u0442\u0435\u0441\u0442\u0443\u0432\u0430\u043D\u043D\u044F", "\u0416\u0438\u0442\u0442\u0454\u0432\u0438\u0439 \u0446\u0438\u043A\u043B \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0443 \u0439 \u0442\u0438\u043F\u0438 \u0442\u0435\u0441\u0442\u0443\u0432\u0430\u043D\u043D\u044F."], ["\u0422\u0435\u0441\u0442\u043E\u0432\u0430 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0456\u044F", "\u0427\u0435\u043A\u043B\u0456\u0441\u0442\u0438, \u0442\u0435\u0441\u0442-\u043A\u0435\u0439\u0441\u0438 \u0442\u0430 \u0431\u0430\u0433-\u0440\u0435\u043F\u043E\u0440\u0442\u0438."], ["API \u0442\u0430 \u0431\u0430\u0437\u0438 \u0434\u0430\u043D\u0438\u0445", "Postman, HTTP \u0456 \u043E\u0441\u043D\u043E\u0432\u0438 SQL."], ["\u0424\u0456\u043D\u0430\u043B\u044C\u043D\u0438\u0439 \u043F\u0440\u043E\u0454\u043A\u0442", "\u041F\u0435\u0440\u0435\u0432\u0456\u0440\u043A\u0430 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0443 \u0439 \u0437\u0432\u0456\u0442 \u043F\u0440\u043E \u044F\u043A\u0456\u0441\u0442\u044C."]];
    return [
      section(d, "Course hero", [
        text("\u2190 \u0414\u043E \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0443 \u043A\u0443\u0440\u0441\u0456\u0432", 14, "Medium", "primary", { target: target(d, "catalog") }),
        box("Course hero columns", [
          box("Course introduction", [badge("\u0417 \u041D\u0423\u041B\u042F \xB7 \u041E\u041D\u041B\u0410\u0419\u041D", 152), text(c.title, d === "Desktop" ? 64 : isMobile(d) ? 40 : 52, "Semi Bold"), text(c.description, 18, "Regular", "muted"), text(c.tools, 14, "Medium", "primary")], { gap: 24 }),
          box("Enrollment card", [text("\u0422\u0412\u0406\u0419 \u041D\u0410\u0421\u0422\u0423\u041F\u041D\u0418\u0419 \u041A\u0420\u041E\u041A", 11, "Semi Bold", "muted", { tracking: 1 }), text(c.price, 32, "Semi Bold"), rule(), text(`${c.duration} \xB7 2 \u0437\u0430\u043D\u044F\u0442\u0442\u044F \u043D\u0430 \u0442\u0438\u0436\u0434\u0435\u043D\u044C`, 15, "Medium"), text("\u0416\u0438\u0432\u0456 \u043E\u043D\u043B\u0430\u0439\u043D-\u0437\u0430\u043D\u044F\u0442\u0442\u044F, \u043F\u0440\u0430\u043A\u0442\u0438\u0447\u043D\u0456 \u0440\u043E\u0431\u043E\u0442\u0438 \u0442\u0430 \u043F\u0456\u0434\u0442\u0440\u0438\u043C\u043A\u0430 \u043C\u0435\u043D\u0442\u043E\u0440\u0430.", 15, "Regular", "muted"), button("\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u0438\u0441\u044F \u043D\u0430 \u043A\u0443\u0440\u0441  \u2197", target(d, `contact-${id}`), "Primary", "fill"), text("\u0417\u0430\u043B\u0438\u0448 \u0437\u0430\u044F\u0432\u043A\u0443 \u2014 \u0443\u0437\u0433\u043E\u0434\u0438\u043C\u043E \u0434\u0435\u0442\u0430\u043B\u0456 \u043D\u0430\u0432\u0447\u0430\u043D\u043D\u044F.", 12, "Regular", "muted")], { w: d === "Desktop" ? 380 : "fill", pad: 24, gap: 20, bg: "white", stroke: "line", radius: 4 })
        ], { direction: d === "Desktop" ? "row" : "column", gap: d === "Desktop" ? 80 : 32 })
      ], "paper", 48),
      section(d, "Course outcomes", [heading("\u0420\u0415\u0417\u0423\u041B\u042C\u0422\u0410\u0422 \u041D\u0410\u0412\u0427\u0410\u041D\u041D\u042F", "\u0422\u0435, \u0449\u043E \u0437\u043C\u043E\u0436\u0435\u0448 \u0440\u043E\u0431\u0438\u0442\u0438.", `\u0424\u0456\u043D\u0430\u043B\u044C\u043D\u0438\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442: ${c.project.toLowerCase()}.`, isMobile(d)), box("Outcomes", [
        ["01", "\u0420\u043E\u0437\u0443\u043C\u0456\u0442\u0438 \u0456\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0438", "\u0412\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u043E\u0432\u0443\u0432\u0430\u0442\u0438 \u043E\u0441\u043D\u043E\u0432\u043D\u0456 \u0442\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0456\u0457 \u043D\u0430\u043F\u0440\u044F\u043C\u0443."],
        ["02", "\u041F\u0440\u0430\u0446\u044E\u0432\u0430\u0442\u0438 \u0441\u0430\u043C\u043E\u0441\u0442\u0456\u0439\u043D\u043E", "\u0420\u043E\u0437\u0431\u0438\u0440\u0430\u0442\u0438 \u0437\u0430\u0434\u0430\u0447\u0456 \u0442\u0430 \u0437\u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0438 \u0440\u0456\u0448\u0435\u043D\u043D\u044F."],
        ["03", "\u041F\u043E\u043A\u0430\u0437\u0443\u0432\u0430\u0442\u0438 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", "\u041F\u0440\u0435\u0437\u0435\u043D\u0442\u0443\u0432\u0430\u0442\u0438 \u0432\u043B\u0430\u0441\u043D\u0438\u0439 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u0439 \u043F\u0440\u043E\u0454\u043A\u0442."]
      ].map(([n, t, s]) => box(t, [text(n, 12, "Semi Bold", "primary"), text(t, 20, "Semi Bold"), text(s, 15, "Regular", "muted")])), { direction: isMobile(d) ? "column" : "row", gap: 24 })], "white", 48),
      section(d, "Curriculum", [heading("\u041F\u0420\u041E\u0413\u0420\u0410\u041C\u0410 \u041A\u0423\u0420\u0421\u0423", "\u041A\u0440\u043E\u043A \u0437\u0430 \u043A\u0440\u043E\u043A\u043E\u043C.", "\u0427\u043E\u0442\u0438\u0440\u0438 \u043F\u043E\u0441\u043B\u0456\u0434\u043E\u0432\u043D\u0456 \u043C\u043E\u0434\u0443\u043B\u0456 \u2014 \u0432\u0456\u0434 \u043E\u0441\u043D\u043E\u0432 \u0434\u043E \u0444\u0456\u043D\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0454\u043A\u0442\u0443.", isMobile(d)), box("Module list", modules.map(([t, s], i) => box(`Module ${i + 1}`, [row("Module content", [text(`0${i + 1}`, 16, "Medium", "primary", { w: 40 }), box("Module description", [text(t, 20, "Semi Bold"), text(s, 15, "Regular", "muted")], { gap: 8 })], { gap: 16, pad: [24, 0, 24, 0] }), rule()], { gap: 0 })), { gap: 0 })]),
      section(d, "Learning format", [text("\u041D\u0430\u0432\u0447\u0430\u0439\u0441\u044F \u0437 \u043F\u0456\u0434\u0442\u0440\u0438\u043C\u043A\u043E\u044E.", isMobile(d) ? 28 : 36, "Semi Bold"), text("\u041D\u0430 \u0437\u0430\u043D\u044F\u0442\u0442\u044F\u0445 \u0440\u043E\u0437\u0431\u0438\u0440\u0430\u0454\u0448 \u043F\u0440\u0438\u043A\u043B\u0430\u0434\u0438, \u043C\u0456\u0436 \u0437\u0430\u043D\u044F\u0442\u0442\u044F\u043C\u0438 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0443\u0454\u0448\u0441\u044F, \u0430 \u043C\u0435\u043D\u0442\u043E\u0440 \u043F\u0435\u0440\u0435\u0432\u0456\u0440\u044F\u0454 \u0442\u0432\u043E\u044E \u0440\u043E\u0431\u043E\u0442\u0443 \u0442\u0430 \u043F\u043E\u044F\u0441\u043D\u044E\u0454, \u0449\u043E \u043F\u043E\u043A\u0440\u0430\u0449\u0438\u0442\u0438.", 16, "Regular", "muted"), button("\u041F\u043E\u0447\u0430\u0442\u0438 \u043D\u0430\u0432\u0447\u0430\u043D\u043D\u044F  \u2197", target(d, `contact-${id}`), "Primary", isMobile(d) ? "fill" : 244)], "tint", 48)
    ];
  }
  function contact(d, courseId, state = "default") {
    var _a;
    const selected = ((_a = courseData.find((c) => c.id === courseId)) == null ? void 0 : _a.short) || "\u0414\u043E\u043F\u043E\u043C\u043E\u0436\u0456\u0442\u044C \u043E\u0431\u0440\u0430\u0442\u0438 \u043A\u0443\u0440\u0441";
    const form = box("Consultation form", [
      text("\u0417\u0430\u044F\u0432\u043A\u0430 \u043D\u0430 \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0456\u044E", 24, "Semi Bold"),
      instance(`input.${state === "filled" ? "Filled" : "Default"}`, "fill", { Label: "\u0422\u0432\u043E\u0454 \u0456\u043C\u2019\u044F", Value: state === "filled" ? "\u0410\u043D\u0434\u0440\u0456\u0439" : "\u042F\u043A \u0434\u043E \u0442\u0435\u0431\u0435 \u0437\u0432\u0435\u0440\u0442\u0430\u0442\u0438\u0441\u044F?", Hint: "\u0414\u043E\u0441\u0442\u0430\u0442\u043D\u044C\u043E \u0456\u043C\u0435\u043D\u0456" }, target(d, `contact-filled${courseId ? `-${courseId}` : ""}`)),
      instance(`input.${state === "error" ? "Error" : state === "filled" ? "Filled" : "Default"}`, "fill", { Label: "Email", Value: state === "filled" ? "andrii@example.com" : "you@example.com", Hint: state === "error" ? "\u041F\u0435\u0440\u0435\u0432\u0456\u0440 \u0444\u043E\u0440\u043C\u0430\u0442 email: name@example.com" : "\u041D\u0430\u043F\u0438\u0448\u0435\u043C\u043E \u0449\u043E\u0434\u043E \u043D\u0430\u0432\u0447\u0430\u043D\u043D\u044F" }, target(d, `contact-filled${courseId ? `-${courseId}` : ""}`)),
      instance("input.Filled", "fill", { Label: "\u0426\u0456\u043A\u0430\u0432\u0438\u0442\u044C \u043D\u0430\u043F\u0440\u044F\u043C", Value: selected, Hint: "\u041D\u0430\u043F\u0440\u044F\u043C \u043C\u043E\u0436\u043D\u0430 \u0443\u0442\u043E\u0447\u043D\u0438\u0442\u0438 \u043D\u0430 \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0456\u0457" }),
      text("\u041D\u0430\u0442\u0438\u0441\u043A\u0430\u044E\u0447\u0438 \u043A\u043D\u043E\u043F\u043A\u0443, \u0442\u0438 \u043F\u043E\u0433\u043E\u0434\u0436\u0443\u0454\u0448\u0441\u044F \u043D\u0430 \u0432\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u043D\u043D\u044F \u0446\u0438\u0445 \u0434\u0430\u043D\u0438\u0445 \u0434\u043B\u044F \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0456 \u043D\u0430 \u0437\u0430\u044F\u0432\u043A\u0443.", 12, "Regular", "muted"),
      button("\u041D\u0430\u0434\u0456\u0441\u043B\u0430\u0442\u0438 \u0437\u0430\u044F\u0432\u043A\u0443  \u2197", target(d, state === "filled" ? "success" : `contact-error${courseId ? `-${courseId}` : ""}`), "Primary", "fill"),
      text("\u041D\u0430\u043F\u0438\u0448\u0435\u043C\u043E \u043F\u0440\u043E\u0442\u044F\u0433\u043E\u043C \u043E\u0434\u043D\u043E\u0433\u043E \u0440\u043E\u0431\u043E\u0447\u043E\u0433\u043E \u0434\u043D\u044F.", 12, "Regular", "muted")
    ], { pad: isMobile(d) ? 20 : 32, gap: 20, bg: "white", stroke: "line", radius: 4 });
    return [section(d, "Contact introduction", [heading("\u041A\u041E\u041D\u0422\u0410\u041A\u0422\u0418 \u0422\u0410 \u0417\u0410\u041F\u0418\u0421", "\u041F\u043E\u0447\u043D\u0435\u043C\u043E \u0437 \u0440\u043E\u0437\u043C\u043E\u0432\u0438.", "\u0420\u043E\u0437\u043A\u0430\u0436\u0438 \u043F\u0440\u043E \u0441\u0432\u043E\u0457 \u0446\u0456\u043B\u0456. \u0414\u043E\u043F\u043E\u043C\u043E\u0436\u0435\u043C\u043E \u043E\u0431\u0440\u0430\u0442\u0438 \u043A\u0443\u0440\u0441 \u0456 \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u043C\u043E \u043D\u0430 \u0437\u0430\u043F\u0438\u0442\u0430\u043D\u043D\u044F.", isMobile(d))], "paper", 48), section(d, "Contact content", [
      box("Contact columns", [
        box("Contact details", [text("\u041C\u0438 \u043D\u0430 \u0437\u0432\u2019\u044F\u0437\u043A\u0443", 28, "Semi Bold"), text("\u041D\u0430\u043F\u0438\u0448\u0438 \u043D\u0430\u043C", 12, "Medium", "muted"), text("hello@it-school.example", isMobile(d) ? 20 : 24, "Semi Bold"), rule(), text("\u041A\u043E\u043B\u0438 \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0430\u0454\u043C\u043E", 12, "Medium", "muted"), text("\u041F\u043D\u2013\u041F\u0442 \xB7 09:00\u201318:00", 18, "Medium"), text("\u0417\u0430\u0437\u0432\u0438\u0447\u0430\u0439 \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0430\u0454\u043C\u043E \u043F\u0440\u043E\u0442\u044F\u0433\u043E\u043C \u043E\u0434\u043D\u043E\u0433\u043E \u0440\u043E\u0431\u043E\u0447\u043E\u0433\u043E \u0434\u043D\u044F.", 15, "Regular", "muted"), rule(), text("\u042F\u043A \u043F\u0440\u043E\u0445\u043E\u0434\u0438\u0442\u044C \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0456\u044F", 18, "Semi Bold"), text("01   \u041E\u0431\u0433\u043E\u0432\u043E\u0440\u044E\u0454\u043C\u043E \u0442\u0432\u0456\u0439 \u0434\u043E\u0441\u0432\u0456\u0434\n02   \u041F\u043E\u0440\u0456\u0432\u043D\u044E\u0454\u043C\u043E \u043D\u0430\u043F\u0440\u044F\u043C\u0438 \u043D\u0430\u0432\u0447\u0430\u043D\u043D\u044F\n03   \u041F\u043B\u0430\u043D\u0443\u0454\u043C\u043E \u043D\u0430\u0441\u0442\u0443\u043F\u043D\u0438\u0439 \u043A\u0440\u043E\u043A", 15, "Regular", "muted", { line: 1.9 })], { w: d === "Desktop" ? 440 : "fill", gap: 20 }),
        form
      ], { direction: d === "Desktop" ? "row" : "column", gap: d === "Desktop" ? 96 : 32 })
    ], "paper", 24)];
  }
  function wrap(d, active, children) {
    return box("Full page", [navigation(d, active), ...children, footer(d)], { w: devices[d].width, gap: 0, bg: "paper" });
  }
  function getScreens() {
    const screens = [];
    for (const d of Object.keys(devices)) {
      const make = (key, name, spec, auxiliary = false) => screens.push({ key: target(d, key), name, device: d, spec, auxiliary });
      make("home", "01 \xB7 \u0413\u043E\u043B\u043E\u0432\u043D\u0430", wrap(d, "home", home(d)));
      make("catalog", "02 \xB7 \u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u043A\u0443\u0440\u0441\u0456\u0432", wrap(d, "catalog", catalog(d)));
      make("course", "03 \xB7 \u041A\u0443\u0440\u0441 Python", wrap(d, "catalog", course(d)));
      make("contact", "04 \xB7 \u041A\u043E\u043D\u0442\u0430\u043A\u0442\u0438 \u0442\u0430 \u0437\u0430\u043F\u0438\u0441", wrap(d, "contact", contact(d)));
      for (const filter of ["dev", "qa"]) make(`catalog-${filter}`, `\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \xB7 ${filter === "dev" ? "\u0420\u043E\u0437\u0440\u043E\u0431\u043A\u0430" : "\u0422\u0435\u0441\u0442\u0443\u0432\u0430\u043D\u043D\u044F"}`, wrap(d, "catalog", catalog(d, filter)), true);
      for (const id of ["frontend", "qa"]) make(`course-${id}`, `\u041A\u0443\u0440\u0441 \xB7 ${id}`, wrap(d, "catalog", course(d, id)), true);
      for (const id of ["python", "frontend", "qa"]) make(`contact-${id}`, `\u0417\u0430\u043F\u0438\u0441 \xB7 ${id}`, wrap(d, "contact", contact(d, id)), true);
      for (const id of [void 0, "python", "frontend", "qa"]) make(`contact-filled${id ? `-${id}` : ""}`, `\u0417\u0430\u043F\u043E\u0432\u043D\u0435\u043D\u0430 \u0444\u043E\u0440\u043C\u0430 \xB7 ${id || "\u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0456\u044F"}`, wrap(d, "contact", contact(d, id, "filled")), true);
      for (const id of [void 0, "python", "frontend", "qa"]) make(`contact-error${id ? `-${id}` : ""}`, `\u041F\u043E\u043C\u0438\u043B\u043A\u0430 \u0444\u043E\u0440\u043C\u0438 \xB7 ${id || "\u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0456\u044F"}`, wrap(d, "contact", contact(d, id, "error")), true);
      make("success", "\u0417\u0430\u044F\u0432\u043A\u0443 \u043D\u0430\u0434\u0456\u0441\u043B\u0430\u043D\u043E", wrap(d, "contact", [section(d, "Success message", [
        badge("\u0413\u041E\u0422\u041E\u0412\u041E", 112),
        text("\u0414\u044F\u043A\u0443\u0454\u043C\u043E!\n\u041C\u0438 \u043D\u0430 \u0437\u0432\u2019\u044F\u0437\u043A\u0443.", isMobile(d) ? 40 : 64, "Semi Bold"),
        text("\u0422\u0432\u043E\u044F \u0437\u0430\u044F\u0432\u043A\u0430 \u043F\u0440\u0438\u0439\u043D\u044F\u0442\u0430. \u041D\u0430\u043F\u0438\u0448\u0435\u043C\u043E \u043D\u0430 \u0432\u043A\u0430\u0437\u0430\u043D\u0438\u0439 email \u043F\u0440\u043E\u0442\u044F\u0433\u043E\u043C \u043E\u0434\u043D\u043E\u0433\u043E \u0440\u043E\u0431\u043E\u0447\u043E\u0433\u043E \u0434\u043D\u044F.", 18, "Regular", "muted"),
        button("\u041F\u043E\u0432\u0435\u0440\u043D\u0443\u0442\u0438\u0441\u044F \u0434\u043E \u043A\u0443\u0440\u0441\u0456\u0432  \u2197", target(d, "catalog"), "Primary", isMobile(d) ? "fill" : 296)
      ], "tint", isMobile(d) ? 56 : 100)]), true);
      if (d === "Mobile") make("menu", "\u041C\u043E\u0431\u0456\u043B\u044C\u043D\u0435 \u043C\u0435\u043D\u044E", box("Mobile menu", [
        row("Menu header", [instance("brand", 172), box("Space", [], { w: "fill" }), __spreadProps(__spreadValues({}, instance("icon.close", 48)), { action: "back" })], { pad: 20, gap: 12, align: "center" }),
        rule(),
        box("Menu items", [...[["\u0413\u043E\u043B\u043E\u0432\u043D\u0430", "home"], ["\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u043A\u0443\u0440\u0441\u0456\u0432", "catalog"], ["\u041A\u0443\u0440\u0441 Python", "course"], ["\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u0438", "contact"]].map(([label, key]) => box(`Menu link ${key}`, [text(label, 24, "Medium")], { pad: [16, 0, 16, 0], target: target(d, key) })), button("\u041F\u0456\u0434\u0456\u0431\u0440\u0430\u0442\u0438 \u043A\u0443\u0440\u0441  \u2197", target(d, "contact"), "Primary", "fill")], { pad: 20, gap: 12 })
      ], { w: 390, bg: "paper", gap: 0 }), true);
    }
    return screens;
  }
  function getKitIntro() {
    return box("Design system", [
      text("IT.SCHOOL / DESIGN SYSTEM", 13, "Semi Bold", "primary", { tracking: 2 }),
      text("\u041F\u0440\u0430\u043A\u0442\u0438\u0447\u043D\u0456\u0441\u0442\u044C\n\u0443 \u043A\u043E\u0436\u043D\u0456\u0439 \u0434\u0435\u0442\u0430\u043B\u0456.", 64, "Semi Bold"),
      text("\u0424\u0443\u043D\u043A\u0446\u0456\u043E\u043D\u0430\u043B\u0456\u0437\u043C \xB7 \u0413\u0456\u0440\u0447\u0438\u0447\u043D\u043E-\u043A\u043E\u0440\u0438\u0447\u043D\u0435\u0432\u0438\u0439 #7A5C00 \xB7 Midterm checkpoint", 20, "Regular", "muted"),
      rule(),
      text("01 / \u041A\u041E\u041B\u042C\u041E\u0420\u041E\u0412\u0410 \u0421\u0418\u0421\u0422\u0415\u041C\u0410", 12, "Semi Bold", "primary", { tracking: 1 }),
      row("Palette", ["primary", "paper", "white", "ink", "muted", "line"].map((c) => box(c, [box("Swatch", [], { h: 80, bg: c, stroke: "line", radius: 4 }), text(c, 14, "Semi Bold"), text(colors[c], 13, "Regular", "muted")], { gap: 8 })), { gap: 20 }),
      text("02 / \u0422\u0418\u041F\u041E\u0413\u0420\u0410\u0424\u0406\u041A\u0410 \xB7 INTER", 12, "Semi Bold", "primary", { tracking: 1 }),
      text("\u041D\u0430\u0432\u0438\u0447\u043A\u0438, \u044F\u043A\u0456 \u043F\u0440\u0430\u0446\u044E\u044E\u0442\u044C.", 48, "Semi Bold"),
      text("\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u0441\u0435\u043A\u0446\u0456\u0457 / 32 px", 32, "Semi Bold"),
      text("\u041E\u0441\u043D\u043E\u0432\u043D\u0438\u0439 \u0442\u0435\u043A\u0441\u0442 / 16 px. \u0427\u0456\u0442\u043A\u0430 \u0456\u0454\u0440\u0430\u0440\u0445\u0456\u044F, \u043A\u043E\u0440\u043E\u0442\u043A\u0456 \u0440\u0435\u0447\u0435\u043D\u043D\u044F \u0442\u0430 \u0437\u0440\u043E\u0437\u0443\u043C\u0456\u043B\u0430 \u043D\u0430\u0432\u0456\u0433\u0430\u0446\u0456\u044F.", 16),
      text("\u041F\u0456\u0434\u043F\u0438\u0441 / 12 px \xB7 \u0414\u043E\u043F\u043E\u043C\u0456\u0436\u043D\u0430 \u0456\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u044F", 12, "Regular", "muted"),
      rule(),
      text("03 / \u0421\u0406\u0422\u041A\u0418 \u0422\u0410 \u0412\u0406\u0414\u0421\u0422\u0423\u041F\u0418", 12, "Semi Bold", "primary", { tracking: 1 }),
      text("Desktop 1440 / 12 \u043A\u043E\u043B\u043E\u043D\u043E\u043A / \u043F\u043E\u043B\u044F 120\nTablet 768 / 8 \u043A\u043E\u043B\u043E\u043D\u043E\u043A / \u043F\u043E\u043B\u044F 32\nMobile 390 / 4 \u043A\u043E\u043B\u043E\u043D\u043A\u0438 / \u043F\u043E\u043B\u044F 20", 18, "Medium", "ink", { line: 1.7 }),
      text("\u0412\u0456\u0434\u0441\u0442\u0443\u043F\u0438: 8 \xB7 12 \xB7 16 \xB7 20 \xB7 24 \xB7 32 \xB7 40 \xB7 48 \xB7 64 \xB7 80 \xB7 96\n\u0417\u0430\u043E\u043A\u0440\u0443\u0433\u043B\u0435\u043D\u043D\u044F: 4 px \xB7 \u041A\u043D\u043E\u043F\u043A\u0430: 48 px \xB7 \u041E\u0441\u043D\u043E\u0432\u043D\u0438\u0439 \u0444\u043E\u043D: #FAF9F6", 15, "Regular", "muted", { line: 1.7 }),
      rule(),
      text("04 / \u041F\u041E\u0412\u0415\u0414\u0406\u041D\u041A\u0410 \u0422\u0410 \u0421\u0426\u0415\u041D\u0410\u0420\u0406\u0407", 12, "Semi Bold", "primary", { tracking: 1 }),
      text("\u0413\u043E\u043B\u043E\u0432\u043D\u0430 \u2192 \u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u2192 \u041A\u0443\u0440\u0441 \u2192 \u0417\u0430\u043F\u0438\u0441 \u2192 \u041F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043D\u044F\n\u0424\u0456\u043B\u044C\u0442\u0440\u0438 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0443, \u0441\u0442\u043E\u0440\u0456\u043D\u043A\u0438 \u0442\u0440\u044C\u043E\u0445 \u043A\u0443\u0440\u0441\u0456\u0432, \u043C\u043E\u0431\u0456\u043B\u044C\u043D\u0435 \u043C\u0435\u043D\u044E \u0442\u0430 \u0441\u0442\u0430\u043D\u0438 \u0444\u043E\u0440\u043C\u0438.", 18, "Medium", "ink", { line: 1.7 }),
      text("\u041D\u0430\u0432\u0447\u0430\u043B\u044C\u043D\u0430 \u043A\u043E\u043D\u0446\u0435\u043F\u0446\u0456\u044F. \u041D\u0430\u0437\u0432\u0430 \u0448\u043A\u043E\u043B\u0438, \u0446\u0456\u043D\u0438 \u0442\u0430 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u0438 \u2014 \u0434\u0435\u043C\u043E\u043D\u0441\u0442\u0440\u0430\u0446\u0456\u0439\u043D\u0456. \u0424\u043E\u0440\u043C\u0438 \u043F\u0440\u043E\u0442\u043E\u0442\u0438\u043F\u0443 \u0432\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u043E\u0432\u0443\u044E\u0442\u044C \u0437\u0430\u0437\u0434\u0430\u043B\u0435\u0433\u0456\u0434\u044C \u043F\u0456\u0434\u0433\u043E\u0442\u043E\u0432\u043B\u0435\u043D\u0456 \u0434\u0430\u043D\u0456.", 14, "Regular", "muted")
    ], { w: 1440, pad: 64, gap: 28, bg: "white" });
  }

  // src/plugin.ts
  var PREFIX = "IT School / ";
  var masters = /* @__PURE__ */ new Map();
  var variables = /* @__PURE__ */ new Map();
  var textStyles = /* @__PURE__ */ new Map();
  var pending = [];
  var frames = /* @__PURE__ */ new Map();
  var created = [];
  function rgb(hex) {
    return { r: parseInt(hex.slice(1, 3), 16) / 255, g: parseInt(hex.slice(3, 5), 16) / 255, b: parseInt(hex.slice(5, 7), 16) / 255 };
  }
  function paint(key) {
    const p = { type: "SOLID", color: rgb(colors[key]) };
    const v = variables.get(key);
    return v ? figma.variables.setBoundVariableForPaint(p, "color", v) : p;
  }
  function padding(item) {
    return Array.isArray(item.pad) ? item.pad : [item.pad || 0, item.pad || 0, item.pad || 0, item.pad || 0];
  }
  function token(node, field, value) {
    node[field] = value;
    const v = variables.get(`space/${value}`);
    if (v) node.setBoundVariable(field, v);
  }
  function styleKey(item) {
    return `${item.size || 16}/${item.weight || "Regular"}/${item.line || 1.5}/${item.tracking || 0}`;
  }
  async function setText(node, item) {
    const key = styleKey(item);
    let style = textStyles.get(key);
    if (!style) {
      style = figma.createTextStyle();
      style.name = PREFIX + "Type/" + key;
      style.fontName = { family: "Inter", style: item.weight || "Regular" };
      style.fontSize = item.size || 16;
      style.lineHeight = { unit: "PERCENT", value: 100 * (item.line || 1.5) };
      style.letterSpacing = { unit: "PIXELS", value: item.tracking || 0 };
      textStyles.set(key, style);
    }
    await node.setTextStyleIdAsync(style.id);
    node.characters = item.text || "";
    node.fills = [paint(item.color || "ink")];
    node.textAlignHorizontal = item.textAlign === "center" ? "CENTER" : "LEFT";
  }
  function attachReaction(node, item) {
    if ((item.target || item.action) && "setReactionsAsync" in node) {
      pending.push({ node, target: item.target, back: item.action === "back" });
    }
  }
  function childrenWidths(item, width) {
    var _a;
    const children = item.children || [];
    const p = padding(item);
    const available = width - p[1] - p[3];
    if (item.direction !== "row") return children.map((c) => typeof c.w === "number" ? c.w : available);
    const fixed = children.reduce((total, c) => total + (typeof c.w === "number" ? c.w : 0), 0);
    const fills = children.filter((c) => typeof c.w !== "number").length;
    const flexible = (available - fixed - Math.max(0, children.length - 1) * ((_a = item.gap) != null ? _a : 16)) / Math.max(1, fills);
    if (flexible < 0 && fills) throw new Error(`\u041D\u0435\u043C\u0430\u0454 \u043C\u0456\u0441\u0446\u044F \u0432 \u0440\u044F\u0434\u043A\u0443: ${item.name}`);
    return children.map((c) => typeof c.w === "number" ? c.w : Math.max(1, flexible));
  }
  async function populate(node, item, width) {
    var _a;
    node.name = item.name;
    node.layoutMode = item.direction === "row" ? "HORIZONTAL" : "VERTICAL";
    node.resize(width, item.h || 1);
    node.primaryAxisSizingMode = node.layoutMode === "VERTICAL" && !item.h ? "AUTO" : "FIXED";
    node.counterAxisSizingMode = node.layoutMode === "HORIZONTAL" && !item.h ? "AUTO" : "FIXED";
    node.counterAxisAlignItems = item.align === "center" ? "CENTER" : "MIN";
    node.primaryAxisAlignItems = item.between ? "SPACE_BETWEEN" : "MIN";
    const p = padding(item);
    token(node, "paddingTop", p[0]);
    token(node, "paddingRight", p[1]);
    token(node, "paddingBottom", p[2]);
    token(node, "paddingLeft", p[3]);
    token(node, "itemSpacing", (_a = item.gap) != null ? _a : 16);
    node.fills = item.bg ? [paint(item.bg)] : [];
    node.strokes = item.stroke ? [paint(item.stroke)] : [];
    node.strokeWeight = 1;
    node.strokeAlign = "INSIDE";
    node.cornerRadius = item.radius || 0;
    if (item.focus) node.effects = [
      { type: "DROP_SHADOW", color: { r: 1, g: 1, b: 1, a: 1 }, offset: { x: 0, y: 0 }, radius: 0, spread: 2, visible: true, blendMode: "NORMAL" },
      { type: "DROP_SHADOW", color: __spreadProps(__spreadValues({}, rgb(colors.primary)), { a: 1 }), offset: { x: 0, y: 0 }, radius: 0, spread: 4, visible: true, blendMode: "NORMAL" }
    ];
    node.clipsContent = false;
    if (item.opacity !== void 0) node.opacity = item.opacity;
    const widths = childrenWidths(item, width);
    for (const [i, child] of (item.children || []).entries()) {
      const rendered = await render(child, widths[i]);
      node.appendChild(rendered);
      if (child.w === "fill" || child.w === void 0) rendered.layoutSizingHorizontal = "FILL";
    }
    if (!node.children.length && !item.h) node.resize(width, 1);
  }
  async function render(item, availableWidth) {
    const width = typeof item.w === "number" ? item.w : availableWidth;
    if (item.kind === "text") {
      const node2 = figma.createText();
      node2.name = item.name;
      await setText(node2, item);
      node2.resize(width, item.h || 1);
      node2.textAutoResize = item.h ? "NONE" : "HEIGHT";
      attachReaction(node2, item);
      return node2;
    }
    if (item.kind === "instance") {
      const master = masters.get(item.ref);
      if (!master) throw new Error(`\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442 \u043D\u0435 \u0437\u043D\u0430\u0439\u0434\u0435\u043D\u043E: ${item.ref}`);
      const node2 = master.createInstance();
      node2.name = item.name;
      node2.resize(width, node2.height);
      node2.primaryAxisSizingMode = master.primaryAxisSizingMode;
      node2.counterAxisSizingMode = master.counterAxisSizingMode;
      for (const [name, value] of Object.entries(item.overrides || {})) {
        const label = node2.findOne((n) => n.type === "TEXT" && n.name === name);
        if (!label) throw new Error(`\u0428\u0430\u0440 ${name} \u043D\u0435 \u0437\u043D\u0430\u0439\u0434\u0435\u043D\u043E \u0443 ${item.ref}`);
        label.characters = value;
      }
      attachReaction(node2, item);
      return node2;
    }
    const node = figma.createFrame();
    await populate(node, item, width);
    attachReaction(node, item);
    return node;
  }
  function makeSection(name, x, y) {
    const section2 = figma.createSection();
    section2.name = name;
    section2.x = x;
    section2.y = y;
    section2.fills = [{ type: "SOLID", color: rgb("#EBECE7") }];
    created.push(section2);
    return section2;
  }
  function place(section2, node, x, y) {
    section2.appendChild(node);
    node.x = x;
    node.y = y;
  }
  async function createTokens() {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const collection = collections.find((c) => c.name === PREFIX + "Tokens") || figma.variables.createVariableCollection(PREFIX + "Tokens");
    const existing = await figma.variables.getLocalVariablesAsync();
    for (const [key, hex] of Object.entries(colors)) {
      let v = existing.find((v2) => v2.variableCollectionId === collection.id && v2.name === `color/${key}` && v2.resolvedType === "COLOR");
      if (!v) {
        v = figma.variables.createVariable(`color/${key}`, collection, "COLOR");
        v.setValueForMode(collection.defaultModeId, __spreadProps(__spreadValues({}, rgb(hex)), { a: 1 }));
      }
      variables.set(key, v);
    }
    for (const amount of [0, 4, 6, 8, 10, 12, 16, 20, 24, 26, 28, 32, 40, 48, 56, 64, 80, 96, 100, 120]) {
      let v = existing.find((v2) => v2.variableCollectionId === collection.id && v2.name === `space/${amount}` && v2.resolvedType === "FLOAT");
      if (!v) {
        v = figma.variables.createVariable(`space/${amount}`, collection, "FLOAT");
        v.setValueForMode(collection.defaultModeId, amount);
      }
      variables.set(`space/${amount}`, v);
    }
    for (const style of await figma.getLocalTextStylesAsync()) if (style.name.startsWith(PREFIX + "Type/")) textStyles.set(style.name.slice((PREFIX + "Type/").length), style);
  }
  async function makeKit(x, y) {
    const kit = makeSection("00 \xB7 IT.SCHOOL / UI Kit", x, y);
    const intro = await render(getKitIntro(), 1440);
    place(kit, intro, 40, 64);
    let cursor = 64 + intro.height + 64;
    const groups = /* @__PURE__ */ new Map();
    for (const spec of components) {
      const master = figma.createComponent();
      await populate(master, spec.spec, typeof spec.spec.w === "number" ? spec.spec.w : 320);
      master.name = spec.variant || spec.group;
      master.description = spec.description;
      masters.set(spec.key, master);
      const values = groups.get(spec.group) || [];
      values.push(master);
      groups.set(spec.group, values);
    }
    for (const [group, items] of groups) {
      const label = await render({ kind: "text", name: group, text: group.toUpperCase(), size: 16, weight: "Semi Bold", color: "primary" }, 1440);
      place(kit, label, 40, cursor);
      cursor += 44;
      if (items.length > 1) {
        const set = figma.combineAsVariants(items, kit);
        set.name = PREFIX + group;
        set.fills = [paint("white")];
        set.cornerRadius = 4;
        const cols = group === "Button" ? 4 : group === "Input" ? 2 : group === "Course card" ? 3 : 2;
        let rowY = 24;
        let rowH = 0;
        items.forEach((node, index) => {
          if (index > 0 && index % cols === 0) {
            rowY += rowH + 24;
            rowH = 0;
          }
          const col = index % cols;
          node.x = 24 + col * (node.width + 24);
          node.y = rowY;
          rowH = Math.max(rowH, node.height);
        });
        set.resize(Math.max(...items.map((n) => n.x + n.width)) + 24, rowY + rowH + 24);
        set.x = 40;
        set.y = cursor;
        cursor += set.height + 48;
      } else {
        place(kit, items[0], 40, cursor);
        cursor += items[0].height + 48;
      }
    }
    kit.resizeWithoutConstraints(1520, cursor + 40);
    return kit;
  }
  function layoutGrids(d) {
    return [{ pattern: "COLUMNS", alignment: "STRETCH", count: devices[d].columns, gutterSize: 24, offset: devices[d].margin, visible: false, color: __spreadProps(__spreadValues({}, rgb(colors.primary)), { a: 0.08 }) }];
  }
  async function main() {
    const status = figma.notify("\u0421\u0442\u0432\u043E\u0440\u044E\u044E UI-kit \u0456 \u043C\u0430\u043A\u0435\u0442\u0438 IT.SCHOOL\u2026", { timeout: Infinity });
    await Promise.all(["Regular", "Medium", "Semi Bold", "Bold"].map((style) => figma.loadFontAsync({ family: "Inter", style })));
    await createTokens();
    const right = Math.max(0, ...figma.currentPage.children.map((n) => n.x + n.width));
    const originX = right ? right + 240 : 0;
    const kit = await makeKit(originX, 0);
    const screens = getScreens();
    const mainScreens = screens.filter((s) => !s.auxiliary);
    const mainNodes = /* @__PURE__ */ new Map();
    let designY = 0;
    for (const d of Object.keys(devices)) {
      const section2 = makeSection(`${d} \xB7 4 \u043F\u043E\u0432\u043D\u0456 \u0441\u0442\u043E\u0440\u0456\u043D\u043A\u0438`, originX + kit.width + 160, designY);
      let offsetX = 40;
      let tallest = 0;
      for (const spec of mainScreens.filter((s) => s.device === d)) {
        const frame = await render(spec.spec, devices[d].width);
        frame.name = `${d} / ${spec.name}`;
        frame.layoutGrids = layoutGrids(d);
        frame.setPluginData("it-school.screen", spec.key);
        place(section2, frame, offsetX, 64);
        offsetX += frame.width + 80;
        tallest = Math.max(tallest, frame.height);
        mainNodes.set(spec.key, frame);
      }
      section2.resizeWithoutConstraints(offsetX - 40, tallest + 104);
      designY += section2.height + 160;
    }
    let protoY = Math.max(designY, kit.height + 160);
    const starts = [];
    for (const d of Object.keys(devices)) {
      const section2 = makeSection(`Prototype / ${d} \xB7 \u0441\u0446\u0435\u043D\u0430\u0440\u0456\u0457 \u0442\u0430 \u0441\u0442\u0430\u043D\u0438`, originX, protoY);
      const width = devices[d].width;
      const height = devices[d].viewport;
      const perRow = d === "Desktop" ? 4 : d === "Tablet" ? 5 : 6;
      const list = screens.filter((s) => s.device === d);
      for (const [i, spec] of list.entries()) {
        const viewport = figma.createFrame();
        viewport.name = `${d} / ${spec.name} / Prototype`;
        viewport.resize(width, height);
        viewport.fills = [paint("paper")];
        viewport.clipsContent = true;
        viewport.overflowDirection = "VERTICAL";
        viewport.setPluginData("it-school.route", spec.key);
        const content = await render(spec.spec, width);
        viewport.appendChild(content);
        content.x = 0;
        content.y = 0;
        place(section2, viewport, 40 + i % perRow * (width + 80), 64 + Math.floor(i / perRow) * (height + 100));
        frames.set(spec.key, viewport);
        if (spec.key === `${d}.home`) starts.push({ nodeId: viewport.id, name: `IT.SCHOOL / ${d}` });
      }
      section2.resizeWithoutConstraints(80 + perRow * (width + 80) - 80, 104 + Math.ceil(list.length / perRow) * (height + 100) - 100);
      protoY += section2.height + 160;
    }
    for (const reaction of pending) {
      const dest = reaction.target ? frames.get(reaction.target) : void 0;
      if (!dest && !reaction.back) throw new Error(`\u041F\u0435\u0440\u0435\u0445\u0456\u0434 \u043D\u0435 \u0437\u043D\u0430\u0439\u0434\u0435\u043D\u043E: ${reaction.target}`);
      const action = reaction.back ? { type: "BACK" } : { type: "NODE", destinationId: dest.id, navigation: "NAVIGATE", transition: null, preserveScrollPosition: false };
      await reaction.node.setReactionsAsync([{ trigger: { type: "ON_CLICK" }, actions: [action] }]);
    }
    figma.currentPage.flowStartingPoints = [...figma.currentPage.flowStartingPoints, ...starts];
    const first = mainNodes.get("Desktop.home");
    figma.currentPage.selection = [first];
    figma.viewport.scrollAndZoomIntoView([first]);
    status.cancel();
    figma.closePlugin(`\u0413\u043E\u0442\u043E\u0432\u043E: 12 \u043C\u0430\u043A\u0435\u0442\u0456\u0432, ${components.length} \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0456\u0432, ${screens.length} \u0435\u043A\u0440\u0430\u043D\u0456\u0432 \u043F\u0440\u043E\u0442\u043E\u0442\u0438\u043F\u0443. \u0412\u0456\u0434\u043A\u0440\u0438\u0439 Present \u2192 IT.SCHOOL / Desktop, Tablet \u0430\u0431\u043E Mobile.`);
  }
  main().catch((error) => {
    console.error(error);
    figma.closePlugin(`\u041F\u043E\u043C\u0438\u043B\u043A\u0430 \u0433\u0435\u043D\u0435\u0440\u0430\u0442\u043E\u0440\u0430: ${error instanceof Error ? error.message : String(error)}. \u0421\u0442\u0432\u043E\u0440\u0435\u043D\u0456 \u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0438 \u043C\u043E\u0436\u043D\u0430 \u0441\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438 \u0447\u0435\u0440\u0435\u0437 Undo.`);
  });
})();
