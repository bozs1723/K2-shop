/* K2SIGN Pricing Selector — ตาม Developer Handoff Final v1.2
 * Mobile/Tablet: เลือกขนาดก่อน → ราคาตามช่วงจำนวน → toggle 1/2 ด้าน (+N ตามขนาดทันที)
 * ราคา = matrix[size][tier] + (side2 ? surcharge[size] : 0)
 * ห้ามแก้ตัวเลข — source of truth: pricing-data.json (LOCKED 14 ก.ค. 2026) */
(function () {
  "use strict";
  var DATA = JSON.parse(document.getElementById("k2-pricing-data").textContent);

  /* ---------- Desktop: ตารางเต็ม 8×7 + ตารางเพิ่ม 2 ด้าน (สร้างจาก JSON — ไม่ hardcode) ---------- */
  function buildTable1Side() {
    var el = document.getElementById("k2-table-1side");
    if (!el) return;
    var h = '<table class="k2-price"><thead><tr><th class="size-col">ขนาด</th>';
    DATA.qty_tiers.forEach(function (t) { h += "<th>" + t.replace("-", "–") + " ชิ้น</th>"; });
    h += "</tr></thead><tbody>";
    DATA.sizes_cm.forEach(function (s) {
      h += '<tr><td class="size-col">' + s + " ซม." +
        (s === DATA.popular_size ? ' <span class="badge-popular">ยอดนิยม</span>' : "") + "</td>";
      DATA.price_matrix_1side[String(s)].forEach(function (p) { h += "<td>" + p + "</td>"; });
      h += "</tr>";
    });
    h += '<tr class="row-500"><td colspan="' + (DATA.qty_tiers.length + 1) + '">' +
      DATA.over_500_label + "</td></tr></tbody></table>";
    el.innerHTML = h;
  }
  function buildTable2Side() {
    var el = document.getElementById("k2-table-2side");
    if (!el) return;
    var h = '<table class="k2-price"><thead><tr><th class="size-col">ขนาด</th>';
    DATA.sizes_cm.forEach(function (s) { h += "<th>" + s + " ซม.</th>"; });
    h += '</tr></thead><tbody><tr><td class="size-col">เพิ่ม (บาท/ชิ้น)</td>';
    DATA.sizes_cm.forEach(function (s) { h += "<td>+" + DATA.two_side_surcharge[String(s)] + "</td>"; });
    h += "</tr></tbody></table>";
    el.innerHTML = h;
  }
  buildTable1Side();
  buildTable2Side();
  ["k2-note-desktop", "k2-note-mobile"].forEach(function (id) {
    var n = document.getElementById(id);
    if (n) n.textContent = DATA.price_note;
  });

  /* ---------- Mobile/Tablet: Pricing Selector ---------- */
  var root = document.getElementById("k2-pricing-selector");
  if (!root) return;

  var state = { size: DATA.popular_size, side: 1 };

  function calc(size, tierIdx, side) {
    var base = DATA.price_matrix_1side[String(size)][tierIdx];
    return side === 2 ? base + DATA.two_side_surcharge[String(size)] : base;
  }
  // expose for automated test (QA 112 ค่า)
  window.K2_CALC = calc;
  window.K2_DATA = DATA;

  function render() {
    var s = state.size, side = state.side;
    var sur = DATA.two_side_surcharge[String(s)];
    // size chips
    root.querySelectorAll("[data-size]").forEach(function (b) {
      b.classList.toggle("on", Number(b.dataset.size) === s);
      b.setAttribute("aria-pressed", Number(b.dataset.size) === s);
    });
    // side toggle + dynamic +N (Q3: เปลี่ยนตามขนาดทันที)
    root.querySelectorAll("[data-side]").forEach(function (b) {
      b.classList.toggle("on", Number(b.dataset.side) === side);
      if (Number(b.dataset.side) === 2)
        b.querySelector(".sur").textContent = "+" + sur + " บาท/ชิ้น";
    });
    // price rows — ป้าย "ราคาต่อชิ้นตามขนาดและจำนวนที่เลือก" (Q3 ตัด "โดยประมาณ")
    root.querySelector(".k2-ps-title").textContent =
      "ราคาต่อชิ้นตามขนาดและจำนวนที่เลือก — ขนาด " + s + " ซม. (พิมพ์ " + side + " ด้าน)";
    var rows = DATA.qty_tiers.map(function (t, i) {
      return '<div class="k2-ps-row"><span>' + t.replace("-", " – ") +
        ' ชิ้น</span><strong>' + calc(s, i, side) + ' บาท/ชิ้น</strong></div>';
    }).join("");
    root.querySelector(".k2-ps-rows").innerHTML = rows;
  }

  root.addEventListener("click", function (e) {
    var el = e.target.closest("[data-size],[data-side]");
    if (!el) return;
    if (el.dataset.size) state.size = Number(el.dataset.size);
    if (el.dataset.side) state.side = Number(el.dataset.side);
    render();
  });
  render();
})();
