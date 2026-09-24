import { DEFAULT_OPTIONS } from './restaurants.js';

const STORAGE_KEY = "minimalist_wheel_options";
const COLOR_PALETTE = [
  "#FFB3BA",
  "#FFDFBA",
  "#FFFFBA",
  "#B5EAD7",
  "#C7CEEA",
  "#E2F0CB",
];

let currentOptions = [];
let accumulatedRotation = 0;
let isSpinning = false;

const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const resultTextElement = document.getElementById("resultText");
const newOptionInput = document.getElementById("newOptionInput");
const removeOptionSelect = document.getElementById("removeOptionSelect");
const dataDisplay = document.getElementById("dataDisplay");

function initializeApp() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    currentOptions = JSON.parse(storedData);
  } else {
    currentOptions = [...DEFAULT_OPTIONS];
  }
  updateInterface();
}

function persistOptions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentOptions));
}

function updateInterface() {
  removeOptionSelect.innerHTML = "";
  currentOptions.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.textContent = option;
    removeOptionSelect.appendChild(optionElement);
  });
  dataDisplay.textContent = `目前選項 (${currentOptions.length})： ${currentOptions.join(" 、 ")}`;
  renderWheel();
}

function addOption() {
  if (isSpinning) return;
  const newValue = newOptionInput.value.trim();
  if (newValue && !currentOptions.includes(newValue)) {
    currentOptions.push(newValue);
    newOptionInput.value = "";
    persistOptions();
    updateInterface();
  }
}

function removeOption() {
  if (isSpinning) return;
  const targetValue = removeOptionSelect.value;
  if (targetValue) {
    currentOptions = currentOptions.filter((option) => option !== targetValue);
    persistOptions();
    updateInterface();
  }
}

function renderWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const totalItems = currentOptions.length;

  if (totalItems === 0) {
    ctx.fillStyle = "#F8FAFC";
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
      0,
      2 * Math.PI,
    );
    ctx.fill();
    return;
  }

  const arcRadian = (2 * Math.PI) / totalItems;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const wheelRadius = centerX;

  for (let i = 0; i < totalItems; i++) {
    const startAngle = i * arcRadian - Math.PI / 2 - arcRadian / 2;
    const endAngle = startAngle + arcRadian;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
    ctx.fillStyle = COLOR_PALETTE[i % COLOR_PALETTE.length];
    ctx.fill();

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + arcRadian / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#2C3E50";
    ctx.font = "bold 36px 'Noto Sans TC', sans-serif";
    ctx.fillText(currentOptions[i], wheelRadius - 40, 12);
    ctx.restore();
  }
}

function executeSpin() {
  if (isSpinning || currentOptions.length === 0) return;
  isSpinning = true;
  resultTextElement.innerText = "旋轉中...";

  const baseSpins = (Math.floor(Math.random() * 6) + 5) * 360;
  const randomAngleOffset = Math.floor(Math.random() * 360);
  accumulatedRotation += baseSpins + randomAngleOffset;

  canvas.style.transform = `rotate(${accumulatedRotation}deg)`;

  setTimeout(() => {
    const sliceDegree = 360 / currentOptions.length;
    const relativeAngle = (360 - (accumulatedRotation % 360)) % 360;
    const shiftedAngle = (relativeAngle + sliceDegree / 2) % 360;
    const winningIndex = Math.floor(shiftedAngle / sliceDegree);

    resultTextElement.innerText =
      "🎉 決定吃：" + currentOptions[winningIndex] + "！";
    isSpinning = false;
  }, 4000);
}

document.fonts.ready.then(() => {
  initializeApp();
});
newOptionInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") addOption();
});

window.addOption = addOption;
window.removeOption = removeOption;
window.executeSpin = executeSpin;