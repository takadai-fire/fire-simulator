function yen(n) {
  n = Math.round(n);

  if (n >= 10000) {
    const oku = Math.floor(n / 10000);
    const man = n % 10000;

    if (man === 0) {
      return oku.toLocaleString() + "億円";
    }

    return oku.toLocaleString() + "億" + man.toLocaleString() + "万円";
  }

  return n.toLocaleString() + "万円";
}
function calcTarget(spend, income, rate) {
  return Math.max(0, spend - income) / rate;
}
function simulate() {
  const age = +document.getElementById("age").value;
  let assets = +document.getElementById("assets").value;
  const monthly = +document.getElementById("monthly").value;
  const r = +document.getElementById("return").value / 100;
  const spend = +document.getElementById("spend").value;
  const income = +document.getElementById("income").value;
  const rates = [0.03, 0.035, 0.04];
  const rows = [];
  let age40 = assets;
  let series = [{ age, assets }];
  let found = {};
  for (let y = 1; y <= 80; y++) {
    // 年末に積立すると仮定した簡易計算
    assets = assets * (1 + r) + monthly * 12;
    const a = age + y;
    series.push({ age: a, assets });
    rates.forEach((rate) => {
      const target = calcTarget(spend, income, rate);
      if (found[rate] === undefined && assets >= target) found[rate] = a;
    });
  }
  let html = "";
  rates.forEach((rate) => {
    const target = calcTarget(spend, income, rate);
    const fa =
      found[rate] === undefined ? "80歳までに未達" : found[rate] + "歳";
    html += `<div class="result"><div>${(rate * 100).toFixed(1)}%取り崩し</div><div class="big">${yen(target)}</div><div>到達目安：${fa}</div></div>`;
  });
  document.getElementById("summary").innerHTML = html;
  let t =
    "<table><tr><th>取り崩し率</th><th>必要資産</th><th>FIRE到達年齢</th></tr>";
  rates.forEach((rate) => {
    t += `<tr><td>${(rate * 100).toFixed(1)}%</td><td>${yen(calcTarget(spend, income, rate))}</td><td>${found[rate] === undefined ? "80歳までに未達" : found[rate] + "歳"}</td></tr>`;
  });
  t += "</table>";
  document.getElementById("table").innerHTML = t;
  draw(
    series,
    rates.map((x) => calcTarget(spend, income, x)),
  );
}
function draw(series, targets) {
  const c = document.getElementById("chart"),
    ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  const pad = { l: 60, r: 20, t: 20, b: 40 },
    W = c.width - pad.l - pad.r,
    H = c.height - pad.t - pad.b;
  const max = Math.max(...series.map((x) => x.assets), ...targets) * 1.08;
  const minAge = series[0].age,
    maxAge = series[series.length - 1].age;
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    let y = pad.t + (H * i) / 5;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(pad.l + W, y);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 3;
  series.forEach((p, i) => {
    let x = pad.l + ((p.age - minAge) / (maxAge - minAge)) * W;
    let y = pad.t + H - (p.assets / max) * H;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.stroke();
  ctx.fillStyle = "#555";
  ctx.font = "14px sans-serif";
  ctx.fillText("資産（万円）", 8, 18);
  ctx.fillText(minAge + "歳", pad.l, pad.t + H + 25);
  ctx.fillText(maxAge + "歳", pad.l + W - 35, pad.t + H + 25);
}
simulate();
