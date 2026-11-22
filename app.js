const $ = (id) => document.getElementById(id);
const KEY = "wealthos_v1_state";
const defaults = { balance: 1, goalName: "First $100", goalTarget: 100 };
let state = {...defaults};
try {
  const stored = JSON.parse(localStorage.getItem(KEY) || "null");
  if (stored && Number.isFinite(stored.balance) && typeof stored.goalName === "string" && Number.isFinite(stored.goalTarget)) state = {...defaults, ...stored};
} catch (_) {}
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }
function money(value) { return "$" + Number(value).toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2}); }
function render() {
  const pct = Math.min(100, Math.max(0, state.balance / Math.max(1, state.goalTarget) * 100));
  $("balance").textContent = money(state.balance);
  $("miniBalance").textContent = money(state.balance);
  $("miniTarget").textContent = "$" + state.goalTarget.toLocaleString("en-US");
  $("summaryGoalName").textContent = state.goalName;
  $("detailGoalName").textContent = state.goalName;
  $("summaryProgress").style.width = pct + "%";
  $("detailProgress").style.width = pct + "%";
  $("goalProgressText").textContent = `${money(state.balance)} of ${money(state.goalTarget)} · ${pct.toFixed(1)}% complete`;
  $("goalCurrent").textContent = money(state.balance);
  $("goalRemaining").textContent = money(Math.max(0, state.goalTarget - state.balance));
  $("goalPercent").textContent = pct.toFixed(1) + "%";
  $("goalName").value = state.goalName;
  $("goalTarget").value = state.goalTarget;
}
document.querySelectorAll(".tab").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b === button));
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === button.dataset.tab));
}));
$("depositForm").addEventListener("submit", event => {
  event.preventDefault();
  const amount = Number($("depositAmount").value);
  if (!Number.isFinite(amount) || amount <= 0) return;
  state.balance = Math.round((state.balance + amount) * 100) / 100;
  persist(); render();
  $("depositNotice").hidden = false;
  $("depositNotice").textContent = `${money(amount)} added to your demo tracker on this device.`;
  $("depositForm").reset();
});
$("goalForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("goalName").value.trim();
  const target = Number($("goalTarget").value);
  if (!name || !Number.isFinite(target) || target <= 0) return;
  state.goalName = name;
  state.goalTarget = target;
  persist(); render();
});
$("years").addEventListener("input", () => $("yearsOut").textContent = $("years").value + ($("years").value === "1" ? " year" : " years"));
$("rate").addEventListener("input", () => $("rateOut").textContent = $("rate").value + "%");
$("plannerForm").addEventListener("submit", event => {
  event.preventDefault();
  const monthly = Number($("monthly").value), years = Number($("years").value), rate = Number($("rate").value) / 1200;
  if (!Number.isFinite(monthly) || monthly < 0) return;
  const n = years * 12;
  const future = rate === 0 ? state.balance + monthly * n : state.balance * Math.pow(1 + rate, n) + monthly * ((Math.pow(1 + rate, n) - 1) / rate);
  $("projectedValue").textContent = money(future);
  $("projectionNote").textContent = `Based on ${money(state.balance)} starting savings, ${money(monthly)} added monthly for ${years} years and a hypothetical ${(Number($("rate").value))}% annual return compounded monthly.`;
  $("projection").hidden = false;
});
render();
