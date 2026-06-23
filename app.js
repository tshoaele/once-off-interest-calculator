const INTEREST_RATE = 0.2775;

const amountInput = document.querySelector("#amount");
const interestAmount = document.querySelector("#interestAmount");
const totalAmount = document.querySelector("#totalAmount");
const formula = document.querySelector("#formula");
const installButton = document.querySelector("#installButton");
const themeToggle = document.querySelector("#themeToggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const tabs = document.querySelectorAll(".tab");
const calculatorPanel = document.querySelector("#calculatorPanel");
const amountLabel = document.querySelector("#amountLabel");
const secondaryLabel = document.querySelector("#secondaryLabel");
const primaryLabel = document.querySelector("#primaryLabel");

let calculationMode = "forward";

const number = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function parseAmount(value) {
  const normalized = value.replace(/[^\d.,]/g, "").replace(",", ".");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function formatRand(amount) {
  return `R${number.format(amount)}`;
}

function updateCalculation() {
  const amount = parseAmount(amountInput.value);
  const isReverse = calculationMode === "reverse";
  const original = isReverse ? amount / (1 + INTEREST_RATE) : amount;
  const interest = isReverse ? amount - original : amount * INTEREST_RATE;
  const result = isReverse ? original : amount + interest;

  interestAmount.textContent = formatRand(interest);
  totalAmount.textContent = formatRand(result);
  formula.textContent = isReverse
    ? `${formatRand(amount)} ÷ 1.2775`
    : `${formatRand(amount)} + ${formatRand(interest)}`;
}

amountInput.addEventListener("input", updateCalculation);
amountInput.addEventListener("focus", () => amountInput.select());

function setMode(mode) {
  calculationMode = mode;
  const isReverse = mode === "reverse";

  tabs.forEach((tab) => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  calculatorPanel.setAttribute("aria-labelledby", isReverse ? "reverseTab" : "forwardTab");
  amountLabel.textContent = isReverse ? "Enter total amount" : "Enter amount";
  secondaryLabel.textContent = isReverse ? "Interest included" : "Interest added";
  primaryLabel.textContent = isReverse ? "Original amount" : "Total amount";
  updateCalculation();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isLight = theme === "light";
  themeToggle.setAttribute(
    "aria-label",
    isLight ? "Switch to dark theme" : "Switch to light theme",
  );
  themeColor.setAttribute("content", isLight ? "#f2f0e9" : "#12110f");
  localStorage.setItem("once-off-theme", theme);
}

const savedTheme = localStorage.getItem("once-off-theme");
const preferredTheme =
  savedTheme ||
  (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

setTheme(preferredTheme);

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  setTheme(nextTheme);
});

let installPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!installPrompt) return;

  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installPrompt = null;
  installButton.hidden = true;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

updateCalculation();
