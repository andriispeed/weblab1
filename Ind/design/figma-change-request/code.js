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

  // src/tokens.generated.ts
  var tokens = {
    "colors": {
      "primary": "#7A5C00",
      "primary-hover": "#5A4400",
      "paper": "#FAF9F6",
      "surface": "#FFFFFF",
      "ink": "#22231F",
      "muted": "#61635B",
      "line": "#DEDFD6",
      "tint": "#FFF8E6",
      "dark": "#252A24",
      "dark-muted": "#BFC6B8",
      "error": "#AF352C"
    },
    "gradient": {
      "dark": [
        "#7A5C00",
        "#4F356E",
        "#245F57"
      ],
      "light": [
        "#FFE3A3",
        "#E3D5FF",
        "#B8E8DD"
      ]
    },
    "typography": {
      "fontFamily": "Inter",
      "bodySize": 16
    },
    "spacing": [
      4,
      8,
      12,
      16,
      24,
      32,
      48,
      64
    ],
    "radius": 4,
    "breakpoints": {
      "mobile": 640,
      "tablet": 1e3
    }
  };

  // src/gradient.ts
  var gradientPalettes = tokens.gradient;
  function rgbFromHex(hex2) {
    return [parseInt(hex2.slice(1, 3), 16) / 255, parseInt(hex2.slice(3, 5), 16) / 255, parseInt(hex2.slice(5, 7), 16) / 255];
  }
  function luminance(rgb) {
    return rgb.map((v) => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  }
  function contrast(a, b) {
    const la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  function paletteForBackground(background) {
    return luminance(rgbFromHex(background)) < 0.2 ? gradientPalettes.light : gradientPalettes.dark;
  }
  function minimumContrast(palette, background, steps = 1e3) {
    let minimum = 21;
    const bg = rgbFromHex(background);
    for (let part = 0; part < palette.length - 1; part++) {
      const a = rgbFromHex(palette[part]), b = rgbFromHex(palette[part + 1]);
      for (let i = 0; i <= steps; i++) minimum = Math.min(minimum, contrast(a.map((v, c) => v + (b[c] - v) * i / steps), bg));
    }
    return minimum;
  }
  function isControlOrChrome(name) {
    return /^(header|footer|navigation|button[. /]|icon[. /]|input[. /]|field$|brand$|it\.school$|menu header|menu items|link \/)/i.test(name);
  }
  function isHeading(size, weight) {
    return size >= 24 && /bold|medium/i.test(weight);
  }

  // src/change-request-plugin.ts
  function hex(rgb) {
    return "#" + [rgb.r, rgb.g, rgb.b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
  }
  function nearestBackground(node) {
    var _a;
    let parent = node.parent;
    while (parent && parent.type !== "PAGE" && parent.type !== "DOCUMENT") {
      if ("opacity" in parent && typeof parent.opacity === "number" && parent.opacity < 1) return null;
      if ("fills" in parent && Array.isArray(parent.fills)) {
        const fills = parent.fills.filter((p) => {
          var _a2;
          return p.visible !== false && ((_a2 = p.opacity) != null ? _a2 : 1) > 0;
        });
        if (fills.length) {
          const fill = fills[fills.length - 1];
          if (fill.type !== "SOLID" || ((_a = fill.opacity) != null ? _a : 1) < 1) return null;
          return hex(fill.color);
        }
      }
      parent = parent.parent;
    }
    return null;
  }
  function excluded(node, root) {
    let n = node;
    while (n && n !== root) {
      if (isControlOrChrome(n.name)) return true;
      n = n.parent;
    }
    return false;
  }
  function paint(palette) {
    return { type: "GRADIENT_LINEAR", gradientTransform: [[1, 0, 0], [0, 1, 0]], gradientStops: palette.map((color, i) => {
      const [r, g, b] = rgbFromHex(color);
      return { position: i / 2, color: { r, g, b, a: 1 } };
    }) };
  }
  async function label(section, value, x, y, width) {
    const n = figma.createText();
    n.fontName = { family: "Inter", style: "Medium" };
    n.fontSize = 18;
    n.characters = value;
    n.fills = [{ type: "SOLID", color: { r: 0.14, g: 0.14, b: 0.12 } }];
    n.resize(width, 1);
    n.textAutoResize = "HEIGHT";
    section.appendChild(n);
    n.x = x;
    n.y = y;
    return n;
  }
  async function main() {
    const selected = figma.currentPage.selection;
    const sources = [];
    for (const node of selected) {
      if (node.type === "FRAME") sources.push(node);
      if (node.type === "SECTION") {
        for (const child of node.children) if (child.type === "FRAME") sources.push(child);
      }
    }
    const unique = sources.filter((n, i, a) => a.findIndex((x) => x.id === n.id) === i);
    if (!unique.length || unique.length > 12) {
      figma.closePlugin("\u0412\u0438\u0434\u0456\u043B\u0438 \u0432\u0456\u0434 1 \u0434\u043E 12 \u0444\u0440\u0435\u0439\u043C\u0456\u0432 \u0441\u0442\u043E\u0440\u0456\u043D\u043E\u043A \u0430\u0431\u043E \u0441\u0435\u043A\u0446\u0456\u0457 Desktop / Tablet / Mobile. UI-kit \u0432\u0438\u0434\u0456\u043B\u044F\u0442\u0438 \u043D\u0435 \u043F\u043E\u0442\u0440\u0456\u0431\u043D\u043E.");
      return;
    }
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    const progress = figma.notify("CR15: \u0441\u0442\u0432\u043E\u0440\u044E\u044E \u043A\u043E\u043F\u0456\u0457 \u0432\u0438\u0431\u0440\u0430\u043D\u0438\u0445 \u043C\u0430\u043A\u0435\u0442\u0456\u0432\u2026", { timeout: Infinity });
    const command = figma.command || "compare";
    const modes = command === "full" ? ["full"] : command === "headings" ? ["headings"] : ["original", "full", "headings"];
    const titles = { original: "A \xB7 \u041F\u043E\u0447\u0430\u0442\u043A\u043E\u0432\u0438\u0439 \u043C\u0430\u043A\u0435\u0442", full: "B \xB7 \u041F\u043E\u0432\u043D\u0430 \u0432\u0438\u043C\u043E\u0433\u0430: \u0433\u0440\u0430\u0434\u0456\u0454\u043D\u0442 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0433\u043E \u0442\u0435\u043A\u0441\u0442\u0443", headings: "C \xB7 \u041A\u043E\u043C\u043F\u0440\u043E\u043C\u0456\u0441: \u0433\u0440\u0430\u0434\u0456\u0454\u043D\u0442 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0456\u0432" };
    const right = Math.max(0, ...figma.currentPage.children.map((n) => n.x + n.width));
    const section = figma.createSection();
    section.name = "CR15 \xB7 \u0422\u0440\u0438\u043A\u043E\u043B\u0456\u0440\u043D\u0438\u0439 \u0442\u0435\u043A\u0441\u0442 / \u043F\u043E\u0440\u0456\u0432\u043D\u044F\u043D\u043D\u044F";
    section.x = right + 160;
    section.y = 0;
    section.fills = [{ type: "SOLID", color: { r: 0.92, g: 0.93, b: 0.9 } }];
    const clones = /* @__PURE__ */ new Map();
    let cursorY = 80, maxRight = 0, changed = 0, unknown = 0, lowContrast = 0, minimum = 21;
    const contrastCache = /* @__PURE__ */ new Map();
    for (const source of unique) {
      let x = 40, rowHeight = 0;
      for (const mode of modes) {
        const heading = await label(section, titles[mode], x, cursorY, source.width);
        const copy = source.clone();
        section.appendChild(copy);
        copy.name = `CR15 / ${mode} / ${source.name}`;
        copy.x = x;
        copy.y = cursorY + Math.max(72, heading.height + 20);
        const map = clones.get(mode) || /* @__PURE__ */ new Map();
        map.set(source.id, copy);
        clones.set(mode, map);
        if (mode !== "original") {
          for (const node of copy.findAllWithCriteria({ types: ["TEXT"] })) {
            if (excluded(node, copy) || !node.visible || !node.characters.trim()) continue;
            if (mode === "headings") {
              if (typeof node.fontSize !== "number" || node.fontName === figma.mixed || !isHeading(node.fontSize, node.fontName.style)) continue;
            }
            const background = nearestBackground(node);
            if (!background) {
              unknown++;
              continue;
            }
            const palette = paletteForBackground(background);
            const key = palette.join(",") + background;
            let ratio = contrastCache.get(key);
            if (ratio === void 0) {
              ratio = minimumContrast(palette, background);
              contrastCache.set(key, ratio);
            }
            if (ratio < 4.5) {
              lowContrast++;
              continue;
            }
            node.fills = [paint(palette)];
            node.setPluginData("it-school.cr15", "gradient-main-text");
            minimum = Math.min(minimum, ratio);
            changed++;
          }
        }
        copy.setPluginData("it-school.cr15-mode", mode);
        rowHeight = Math.max(rowHeight, copy.y - cursorY + copy.height);
        x += copy.width + 80;
        maxRight = Math.max(maxRight, x);
      }
      cursorY += rowHeight + 100;
    }
    for (const map of clones.values()) for (const copy of map.values()) {
      const nodes = [copy, ...copy.findAll()];
      for (const node of nodes) if ("reactions" in node && node.reactions.length) {
        const reactions = node.reactions.map((reaction) => ({ trigger: reaction.trigger, actions: (reaction.actions || (reaction.action ? [reaction.action] : [])).map((action) => {
          if (action.type === "NODE" && action.destinationId && map.has(action.destinationId)) return __spreadProps(__spreadValues({}, action), { destinationId: map.get(action.destinationId).id });
          return action;
        }) }));
        await node.setReactionsAsync(reactions);
      }
    }
    const notes = `\u0417\u043C\u0456\u043D\u0435\u043D\u043E \u0442\u0435\u043A\u0441\u0442\u043E\u0432\u0438\u0445 \u0448\u0430\u0440\u0456\u0432: ${changed}. \u041C\u0456\u043D\u0456\u043C\u0430\u043B\u044C\u043D\u0438\u0439 \u0440\u043E\u0437\u0440\u0430\u0445\u043E\u0432\u0430\u043D\u0438\u0439 \u043A\u043E\u043D\u0442\u0440\u0430\u0441\u0442: ${changed ? minimum.toFixed(2) : "\u2014"}:1.
\u041D\u0435\u0432\u0456\u0434\u043E\u043C\u0438\u0439 \u0444\u043E\u043D: ${unknown}; \u043D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043D\u0456\u0439 \u043A\u043E\u043D\u0442\u0440\u0430\u0441\u0442: ${lowContrast} \u2014 \u0442\u0430\u043A\u0456 \u0448\u0430\u0440\u0438 \u0437\u0430\u043B\u0438\u0448\u0435\u043D\u0456 \u0431\u0435\u0437 \u0437\u043C\u0456\u043D \u0442\u0430 \u043F\u043E\u0442\u0440\u0435\u0431\u0443\u044E\u0442\u044C \u0440\u0443\u0447\u043D\u043E\u0457 \u043F\u0435\u0440\u0435\u0432\u0456\u0440\u043A\u0438.
\u0422\u0435\u043C\u043D\u0438\u0439 \u0442\u0435\u043A\u0441\u0442: ${gradientPalettes.dark.join(" \u2192 ")}. \u0421\u0432\u0456\u0442\u043B\u0438\u0439 \u0442\u0435\u043A\u0441\u0442: ${gradientPalettes.light.join(" \u2192 ")}.
\u041E\u0440\u0438\u0433\u0456\u043D\u0430\u043B\u0438 \u0437\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u0456. \u041D\u0430\u0432\u0456\u0433\u0430\u0446\u0456\u044F, \u043A\u043D\u043E\u043F\u043A\u0438, \u043F\u043E\u043B\u044F \u0442\u0430 \u0444\u0443\u0442\u0435\u0440 \u043D\u0435 \u0432\u0445\u043E\u0434\u044F\u0442\u044C \u0434\u043E \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0433\u043E \u0456\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u0439\u043D\u043E\u0433\u043E \u0442\u0435\u043A\u0441\u0442\u0443.
\u0426\u0435 \u043F\u0435\u0440\u0435\u0432\u0456\u0440\u043A\u0430 \u043F\u0430\u043B\u0456\u0442\u0440\u0438 \u043D\u0430 \u0441\u0443\u0446\u0456\u043B\u044C\u043D\u043E\u043C\u0443 \u0444\u043E\u043D\u0456, \u0430 \u043D\u0435 \u043F\u043E\u0432\u043D\u0438\u0439 \u0430\u0443\u0434\u0438\u0442 WCAG. \u041F\u0435\u0440\u0435\u0432\u0456\u0440 Present \u043F\u0456\u0441\u043B\u044F \u0456\u043C\u043F\u043E\u0440\u0442\u0443.`;
    const note = await label(section, notes, 40, cursorY, Math.min(1440, maxRight - 80));
    note.fontSize = 14;
    section.resizeWithoutConstraints(maxRight - 40, cursorY + note.height + 48);
    const first = clones.get(modes.includes("full") ? "full" : modes[0]).get(unique[0].id);
    figma.currentPage.selection = [first];
    figma.viewport.scrollAndZoomIntoView([first]);
    progress.cancel();
    figma.closePlugin(`CR15: \u0433\u043E\u0442\u043E\u0432\u043E, ${changed} \u0442\u0435\u043A\u0441\u0442\u043E\u0432\u0438\u0445 \u0448\u0430\u0440\u0456\u0432. \u041F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043E ${unknown + lowContrast}; \u043F\u043E\u0434\u0440\u043E\u0431\u0438\u0446\u0456 \u043F\u0456\u0434 \u043C\u0430\u043A\u0435\u0442\u0430\u043C\u0438.`);
  }
  main().catch((error) => {
    console.error(error);
    figma.closePlugin(`CR15: ${error instanceof Error ? error.message : String(error)}. \u0417\u0430 \u043F\u043E\u0442\u0440\u0435\u0431\u0438 \u0441\u043A\u0430\u0441\u0443\u0439 \u0441\u0442\u0432\u043E\u0440\u0435\u043D\u0456 \u043A\u043E\u043F\u0456\u0457 \u0447\u0435\u0440\u0435\u0437 Undo.`);
  });
})();
