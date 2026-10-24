/* ==========================================================================
   "Build your brekky" order calculator (home page)
   Markup: BREKKY BUILDER block in index.html. Styles: end of styles.css.
   Prices are in pence and must match menu.html.
   ========================================================================== */
(function () {
  var root = document.getElementById("builder-app");
  if (!root) return;

  var DELIVERY = 300;
  var PHONE = "07984 730030";
  var STORE_KEY = "rnt-brekky-order";

  var MENU = [
    {
      id: "breakfasts", label: "Breakfasts", style: "tiles",
      items: [
        { id: "standard", name: "Standard Breakfast", price: 900, desc: "1 bacon, 1 sausage, egg, black pudding, mushrooms, beans, tomato & 1 toast" },
        { id: "large", name: "Large Breakfast", price: 1200, desc: "2 bacon, 2 sausages, egg, black pudding, hash brown, mushrooms, beans, tomato & 2 toast" },
        { id: "veggie", name: "Veggie Breakfast", price: 900, desc: "Vegetarian sausage, egg, mushrooms, hash brown, beans, tomato & 2 toast" },
        { id: "family", name: "Family Breakfast", price: 3000, desc: "4 bacon, 4 sausages, 4 eggs, mushrooms, 4 black pudding, 4 hash browns, beans, tomato and toast" },
        { id: "omelette", name: "Breakfast Omelette", price: 850, desc: "Sausage, bacon, cheese, mushrooms, served with a pot of beans" }
      ]
    },
    {
      id: "toasties", label: "Toasties", style: "rows",
      items: [
        { id: "t-bacon", name: "Bacon toastie", price: 400 },
        { id: "t-sausage", name: "Sausage toastie", price: 400 },
        { id: "t-egg", name: "Egg toastie", price: 300 },
        { id: "t-bacon-egg", name: "Bacon & egg toastie", price: 470 },
        { id: "t-sausage-egg", name: "Sausage & egg toastie", price: 470 },
        { id: "t-veggie", name: "Veggie sausage toastie", price: 400 },
        { id: "t-veggie-egg", name: "Veggie sausage & egg toastie", price: 470 }
      ]
    },
    {
      id: "extras", label: "Extras", style: "rows",
      items: [
        { id: "x-sausage", name: "Extra sausage", price: 150 },
        { id: "x-bacon", name: "Extra bacon", price: 130 },
        { id: "x-egg", name: "Extra egg", price: 100 },
        { id: "x-hash", name: "Extra hash brown", price: 100 },
        { id: "x-mushroom", name: "Extra mushroom", price: 100 },
        { id: "x-toast", name: "Extra toast", price: 80 },
        { id: "x-pudding", name: "Extra black pudding", price: 100 }
      ]
    }
  ];

  var byId = {};
  MENU.forEach(function (group) { group.items.forEach(function (item) { byId[item.id] = item; }); });

  var qty = {};
  try {
    var saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    Object.keys(saved).forEach(function (k) { if (byId[k] && saved[k] > 0) qty[k] = Math.min(20, saved[k] | 0); });
  } catch (e) { /* storage unavailable: start empty */ }

  var money = function (p) { return p < 100 ? p + "p" : "£" + (p / 100).toFixed(2).replace(/\.00$/, ""); };
  var moneyFull = function (p) { return "£" + (p / 100).toFixed(2); };
  var esc = function (s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); };

  var tabsEl = root.querySelector(".builder__tabs");
  var panelsEl = root.querySelector(".builder__panels");
  var linesEl = root.querySelector(".pad__lines");
  var emptyEl = root.querySelector(".pad__empty");
  var sumsEl = root.querySelector(".pad__sums");
  var subEl = root.querySelector("[data-subtotal]");
  var totalEl = root.querySelector("[data-total]");
  var sayEl = root.querySelector(".pad__say");
  var sayText = root.querySelector("[data-say]");
  var clearBtn = root.querySelector("[data-clear]");
  var countEls = root.querySelectorAll("[data-count]");

  /* ---------- render picker ---------- */
  var stepper = function (item) {
    return '<div class="stepper" data-item="' + item.id + '">' +
      '<button type="button" class="stepper__btn" data-step="-1" aria-label="Remove one ' + esc(item.name) + '">−</button>' +
      '<output class="stepper__qty" aria-live="polite" aria-label="' + esc(item.name) + ' quantity">0</output>' +
      '<button type="button" class="stepper__btn stepper__btn--add" data-step="1" aria-label="Add one ' + esc(item.name) + '">+</button>' +
      "</div>";
  };

  MENU.forEach(function (group, i) {
    var tab = document.createElement("button");
    tab.type = "button";
    tab.className = "builder__tab";
    tab.id = "btab-" + group.id;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", "bpanel-" + group.id);
    tab.setAttribute("aria-selected", i === 0 ? "true" : "false");
    tab.tabIndex = i === 0 ? 0 : -1;
    tab.innerHTML = group.label + ' <span class="builder__tab-count" data-tabcount="' + group.id + '"></span>';
    tabsEl.appendChild(tab);

    var panel = document.createElement("div");
    panel.className = "builder__panel builder__panel--" + group.style;
    panel.id = "bpanel-" + group.id;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);
    panel.hidden = i !== 0;

    panel.innerHTML = group.items.map(function (item) {
      if (group.style === "tiles") {
        return '<div class="plate-tile" data-tile="' + item.id + '">' +
          '<div class="plate-tile__top"><h3>' + esc(item.name) + '</h3><span class="plate-tile__price">' + money(item.price) + "</span></div>" +
          '<p>' + esc(item.desc) + "</p>" + stepper(item) + "</div>";
      }
      return '<div class="pick-row" data-tile="' + item.id + '">' +
        '<span class="pick-row__name">' + esc(item.name) + '</span><span class="pick-row__price">' + money(item.price) + "</span>" +
        stepper(item) + "</div>";
    }).join("");
    panelsEl.appendChild(panel);
  });

  /* ---------- tabs ---------- */
  var tabs = [].slice.call(tabsEl.querySelectorAll('[role="tab"]'));
  var selectTab = function (tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabsEl.addEventListener("click", function (e) {
    var t = e.target.closest('[role="tab"]');
    if (t) selectTab(t);
  });
  tabsEl.addEventListener("keydown", function (e) {
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === "ArrowRight") { selectTab(tabs[(i + 1) % tabs.length], true); e.preventDefault(); }
    if (e.key === "ArrowLeft") { selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true); e.preventDefault(); }
  });

  /* ---------- quantities ---------- */
  panelsEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-step]");
    if (!btn) return;
    var id = btn.closest("[data-item]").getAttribute("data-item");
    var next = Math.max(0, Math.min(20, (qty[id] || 0) + Number(btn.getAttribute("data-step"))));
    if (next) qty[id] = next; else delete qty[id];
    render(id);
  });

  linesEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-remove]");
    if (!btn) return;
    delete qty[btn.getAttribute("data-remove")];
    render();
  });

  clearBtn.addEventListener("click", function () {
    qty = {};
    render();
  });

  /* ---------- render order pad ---------- */
  function render(bumped) {
    root.querySelectorAll("[data-item]").forEach(function (s) {
      var id = s.getAttribute("data-item");
      var n = qty[id] || 0;
      s.querySelector(".stepper__qty").textContent = n;
      s.querySelector('[data-step="-1"]').disabled = n === 0;
      s.closest("[data-tile]").classList.toggle("is-picked", n > 0);
    });

    MENU.forEach(function (group) {
      var n = group.items.reduce(function (sum, item) { return sum + (qty[item.id] || 0); }, 0);
      root.querySelector('[data-tabcount="' + group.id + '"]').textContent = n ? n : "";
    });

    var ids = [];
    MENU.forEach(function (group) { group.items.forEach(function (item) { if (qty[item.id]) ids.push(item.id); }); });

    var subtotal = 0, count = 0;
    linesEl.innerHTML = ids.map(function (id) {
      var item = byId[id], n = qty[id];
      subtotal += item.price * n;
      count += n;
      return '<li class="pad__line' + (id === bumped ? " is-bumped" : "") + '">' +
        '<span class="pad__qty">' + n + "×</span>" +
        '<span class="pad__name">' + esc(item.name) + "</span>" +
        '<span class="pad__amt">' + moneyFull(item.price * n) + "</span>" +
        '<button type="button" class="pad__x" data-remove="' + id + '" aria-label="Remove ' + esc(item.name) + '">×</button>' +
        "</li>";
    }).join("");

    var has = ids.length > 0;
    emptyEl.hidden = has;
    sumsEl.hidden = !has;
    sayEl.hidden = !has;
    clearBtn.hidden = !has;
    subEl.textContent = moneyFull(subtotal);
    totalEl.textContent = moneyFull(has ? subtotal + DELIVERY : 0);
    countEls.forEach(function (el) {
      el.textContent = has ? count + (count === 1 ? " item" : " items") + " · " + moneyFull(subtotal + DELIVERY) : "Nothing yet";
    });
    sayText.textContent = "“" + ids.map(function (id) { return qty[id] + " × " + byId[id].name; }).join(", ") + ", please!”";

    try { localStorage.setItem(STORE_KEY, JSON.stringify(qty)); } catch (e) { /* ignore */ }
  }

  root.querySelector("[data-phone]").textContent = PHONE;
  render();
})();
