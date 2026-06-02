const STORAGE_KEY = "inkson-costings-v1";
const THEME_KEY = "inkson-theme-v1";
const LAST_COSTING_KEY = "inkson-last-costing-v1";
const APP_BUILD = "v2.02";
const NEW_COSTING_LABEL = "Add new Costing";

const defaultMaterials = [
  "Main fabric",
  "Lining",
  "Pocketing",
  "Fusing / interfacing",
  "Zip",
  "Buttons",
  "Hooks / bars",
  "Buckles",
  "D-rings",
  "Rivets",
  "Snaps",
  "Elastic",
  "Thread",
  "Main label",
  "Size label",
  "Care label",
  "Swing tag",
  "Packaging",
  "Garment bag",
  "Tissue / wrapping",
  "Satchel / box",
];

const developmentFields = [
  ["patternMaking", "Pattern making"],
  ["samplingLabour", "Sampling labour"],
  ["fitSampleCost", "Fit sample cost"],
  ["calicoToileFabric", "Calico / toile fabric"],
  ["sampleTrims", "Sample trims"],
  ["grading", "Grading"],
  ["markerMaking", "Marker making"],
  ["technicalDocumentation", "Technical documentation"],
  ["otherDevelopmentCost", "Other development cost"],
];

const overheadFields = [
  ["electricity", "Electricity"],
  ["rentStudio", "Rent / studio allocation"],
  ["insurance", "Insurance"],
  ["internet", "Internet"],
  ["phone", "Phone"],
  ["equipmentDepreciation", "Equipment depreciation"],
  ["machineMaintenance", "Machine maintenance / repairs"],
  ["petrolTransport", "Petrol / transport"],
  ["cleaning", "Cleaning"],
  ["softwareSubscriptions", "Software subscriptions"],
  ["accountingAdmin", "Accounting / admin"],
  ["otherOverheads", "Other overheads"],
  ["monthlyProductionUnits", "Monthly production capacity / units"],
];

const competitorCount = 5;
let labourMode = "simple";
let currentCostingId = null;
let currentStep = 0;
let calculations = {};

const money = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

const wholeMoney = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function numberValue(id) {
  const value = Number($(`#${id}`)?.value || 0);
  return Number.isFinite(value) ? value : 0;
}

function percentValue(id) {
  return numberValue(id) / 100;
}

function setText(id, value) {
  const element = $(`#${id}`);
  if (element) element.textContent = value;
}

function formatMoney(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return money.format(safeValue);
}

function formatWholeMoney(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return wholeMoney.format(safeValue);
}

function formatPercent(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toFixed(1)}%`;
}

function makeId() {
  return `costing-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  const button = $("#themeToggle");
  if (!button) return;
  button.textContent = nextTheme === "dark" ? "Light" : "Dark";
  button.setAttribute("aria-pressed", String(nextTheme === "dark"));
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

function wizardPanels() {
  return $$(".step-panel");
}

function updateWizardStatus() {
  const panels = wizardPanels();
  const totalSteps = panels.length;
  const activePanel = panels[currentStep];
  const stepTitle = activePanel?.dataset.stepTitle || "";
  setText("wizardStepCount", `Step ${currentStep + 1} of ${totalSteps}`);
  setText("wizardStepTitle", stepTitle);
  const progress = $("#wizardProgress");
  if (progress && totalSteps) {
    progress.style.width = `${((currentStep + 1) / totalSteps) * 100}%`;
  }
}

function showStep(index, shouldScroll = true) {
  const panels = wizardPanels();
  if (!panels.length) return;
  currentStep = Math.max(0, Math.min(index, panels.length - 1));
  panels.forEach((panel, panelIndex) => {
    const isActive = panelIndex === currentStep;
    panel.classList.toggle("is-active", isActive);
    panel.setAttribute("aria-hidden", String(!isActive));
  });
  const activePanel = panels[currentStep];
  const liveSummary = $("#liveSummary");
  if (liveSummary) {
    liveSummary.hidden = activePanel?.classList.contains("commercial-step");
  }
  document.body.dataset.step = String(currentStep + 1);
  updateWizardStatus();
  if (shouldScroll) {
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }
}

function createNumberField(id, label, value = 0) {
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <input id="${id}" name="${id}" type="number" min="0" step="0.01" value="${value}" inputmode="decimal" />
    </div>
  `;
}

function createStaticFields() {
  $("#developmentFields").innerHTML = developmentFields
    .map(([id, label]) => createNumberField(id, label))
    .join("");

  $("#overheadFields").innerHTML = overheadFields
    .map(([id, label]) => {
      const step = id === "monthlyProductionUnits" ? "1" : "0.01";
      const value = id === "monthlyProductionUnits" ? "100" : "0";
      return `
        <div class="field">
          <label for="${id}">${label}</label>
          <input id="${id}" name="${id}" type="number" min="0" step="${step}" value="${value}" inputmode="decimal" />
        </div>
      `;
    })
    .join("");

  $("#competitorFields").innerHTML = Array.from({ length: competitorCount }, (_, index) => {
    const n = index + 1;
    return `
      <div class="competitor-card">
        <h2><span>Competitor</span> <strong>${n}</strong></h2>
        <div class="competitor-grid">
          <div class="field">
            <label for="competitor${n}Brand">Brand name</label>
            <input id="competitor${n}Brand" name="competitor${n}Brand" type="text" />
          </div>
          <div class="field">
            <label for="competitor${n}Product">Product name</label>
            <input id="competitor${n}Product" name="competitor${n}Product" type="text" />
          </div>
          <div class="field">
            <label for="competitor${n}Url">Product URL</label>
            <input id="competitor${n}Url" name="competitor${n}Url" type="url" />
          </div>
          <div class="field">
            <label for="competitor${n}Price">Retail price</label>
            <input id="competitor${n}Price" name="competitor${n}Price" type="number" min="0" step="0.01" inputmode="decimal" />
          </div>
          <div class="field">
            <label for="competitor${n}Notes">Notes</label>
            <textarea id="competitor${n}Notes" name="competitor${n}Notes" rows="2"></textarea>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function createMaterialRow(material = {}) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td data-label="Item"><input class="material-name" type="text" value="${escapeAttribute(material.name || "")}" placeholder="Enter material name" aria-label="Material item name" /></td>
    <td data-label="Unit cost"><input class="material-unit-cost" type="number" min="0" step="0.01" value="${material.unitCost || 0}" inputmode="decimal" aria-label="Unit cost" /></td>
    <td data-label="Qty"><input class="material-quantity" type="number" min="0" step="0.01" value="${material.quantity || 0}" inputmode="decimal" aria-label="Quantity used" /></td>
    <td data-label="Waste %"><input class="material-wastage" type="number" min="0" step="0.1" value="${material.wastage || 0}" inputmode="decimal" aria-label="Wastage percent" /></td>
    <td class="row-total-cell" data-label="Total"><span class="row-total">$0.00</span></td>
    <td class="material-actions">
      <button class="row-icon reset-row" type="button" aria-label="Reset material row" title="Reset row">
        <img src="assets/icons/refresh.svg" alt="" />
      </button>
      <button class="row-icon remove-row" type="button" aria-label="Remove material row" title="Remove row">
        <img src="assets/icons/bin-1.svg" alt="" />
      </button>
    </td>
  `;
  $("#materialsTable tbody").appendChild(tr);
  return tr;
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function loadDefaultMaterials() {
  $("#materialsTable tbody").innerHTML = "";
  defaultMaterials.forEach((name) => createMaterialRow({ name }));
}

function collectMaterials() {
  return $$("#materialsTable tbody tr").map((row) => ({
    name: $(".material-name", row).value,
    unitCost: Number($(".material-unit-cost", row).value) || 0,
    quantity: Number($(".material-quantity", row).value) || 0,
    wastage: Number($(".material-wastage", row).value) || 0,
  }));
}

function calculateMaterials() {
  let total = 0;
  collectMaterials().forEach((material, index) => {
    const rowTotal = material.unitCost * material.quantity * (1 + material.wastage / 100);
    total += rowTotal;
    const row = $$("#materialsTable tbody tr")[index];
    $(".row-total", row).textContent = formatMoney(rowTotal);
  });
  return total;
}

function calculateDevelopment(productionQuantity) {
  const total = developmentFields.reduce((sum, [id]) => sum + numberValue(id), 0);
  return {
    total,
    perUnit: productionQuantity > 0 ? total / productionQuantity : 0,
  };
}

function calculateLabour() {
  if (labourMode === "advanced") {
    const hours =
      numberValue("cuttingHours") +
      numberValue("sewingHours") +
      numberValue("pressingHours") +
      numberValue("finishingHours") +
      numberValue("qcHours") +
      numberValue("packingHours");
    return {
      hours,
      hourlyRate: numberValue("advancedHourlyRate"),
      total: hours * numberValue("advancedHourlyRate"),
    };
  }

  return {
    hours: numberValue("simpleLabourHours"),
    hourlyRate: numberValue("simpleHourlyRate"),
    total: numberValue("simpleLabourHours") * numberValue("simpleHourlyRate"),
  };
}

function calculateOverheads() {
  const total = overheadFields
    .filter(([id]) => id !== "monthlyProductionUnits")
    .reduce((sum, [id]) => sum + numberValue(id), 0);
  const capacity = numberValue("monthlyProductionUnits");
  return {
    total,
    capacity,
    perUnit: capacity > 0 ? total / capacity : 0,
  };
}

function calculatePricing() {
  const productionQuantity = Math.max(1, numberValue("productionQuantity"));
  const targetMargin = Math.min(0.95, Math.max(0, percentValue("targetMargin")));
  const gstIncluded = ($('input[name="gstIncluded"]:checked')?.value || "yes") === "yes";
  const gstMultiplier = gstIncluded ? 1.1 : 1;
  const materials = calculateMaterials();
  const development = calculateDevelopment(productionQuantity);
  const labour = calculateLabour();
  const overhead = calculateOverheads();

  const fixedSelling =
    numberValue("platformFee") +
    numberValue("shippingSubsidy") +
    numberValue("packagingExtras") +
    numberValue("otherSellingCost");
  const sellingPercent =
    percentValue("paymentGatewayPercent") +
    percentValue("returnsReservePercent") +
    percentValue("defectReservePercent");

  const baseCost = materials + development.perUnit + labour.total + overhead.perUnit + fixedSelling;
  const denominator = 1 - targetMargin - sellingPercent * gstMultiplier;
  const netRetailPrice = denominator > 0 ? baseCost / denominator : 0;
  const retailPrice = netRetailPrice * gstMultiplier;
  const variableSelling = retailPrice * sellingPercent;
  const sellingTotal = fixedSelling + variableSelling;
  const unitCost = materials + development.perUnit + labour.total + overhead.perUnit + sellingTotal;
  const grossProfit = netRetailPrice - unitCost;
  const grossMargin = netRetailPrice > 0 ? (grossProfit / netRetailPrice) * 100 : 0;
  const wholesalePrice = retailPrice / 2;
  const wholesaleProfit = wholesalePrice - unitCost;

  let wholesaleStatus = "Needs inputs";
  let wholesaleClass = "";
  let warning = "";
  let warningClass = "";

  if (retailPrice > 0) {
    if (wholesaleProfit < 0) {
      wholesaleStatus = "Not wholesale viable";
      wholesaleClass = "text-bad";
      warning = "Not wholesale viable: wholesale price is below total unit cost.";
      warningClass = "bad";
    } else if (wholesalePrice < unitCost * 2) {
      wholesaleStatus = "Weak wholesale margin";
      wholesaleClass = "text-warn";
      warning = "Warning: weak wholesale margin. Wholesale price is less than 2x total unit cost.";
    } else {
      wholesaleStatus = "Wholesale viable";
      wholesaleClass = "text-good";
    }
  }

  if (denominator <= 0) {
    warning = "Target margin plus percentage selling costs is too high to calculate a viable retail price.";
    warningClass = "bad";
  }

  return {
    productionQuantity,
    targetMargin,
    gstIncluded,
    gstMultiplier,
    materials,
    development,
    labour,
    overhead,
    fixedSelling,
    variableSelling,
    sellingPercent,
    sellingTotal,
    unitCost,
    netRetailPrice,
    retailPrice,
    grossProfit,
    grossMargin,
    wholesalePrice,
    wholesaleProfit,
    wholesaleStatus,
    wholesaleClass,
    warning,
    warningClass,
    denominator,
  };
}

function calculateCompetitors(retailPrice) {
  const prices = Array.from({ length: competitorCount }, (_, index) => numberValue(`competitor${index + 1}Price`))
    .filter((price) => price > 0);

  if (!prices.length || retailPrice <= 0) {
    return {
      lowest: 0,
      highest: 0,
      average: 0,
      position: "No data",
      className: "",
    };
  }

  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const lowerBand = average * 0.9;
  const upperBand = average * 1.1;

  if (retailPrice < lowerBand) {
    return { lowest, highest, average, position: "Below market", className: "text-warn" };
  }
  if (retailPrice > upperBand) {
    return { lowest, highest, average, position: "Above market", className: "text-warn" };
  }
  return { lowest, highest, average, position: "Within market", className: "text-good" };
}

function getStatusState(result) {
  if (!result || result.retailPrice <= 0) return "neutral";
  if (result.denominator <= 0 || result.wholesaleStatus === "Not wholesale viable") return "danger";
  if (result.wholesaleStatus === "Weak wholesale margin") return "warning";
  if (result.wholesaleStatus === "Wholesale viable") return "success";
  return "neutral";
}

function getStatusIcon(state) {
  if (state === "success") return "assets/icons/tick.svg";
  if (state === "danger" || state === "warning") return "assets/icons/warning.svg";
  return "assets/icons/info.svg";
}

function setElementClass(element, baseClass, state) {
  if (!element) return;
  element.className = `${baseClass} summary-state-${state}`;
}

function readLastCostingId() {
  try {
    return localStorage.getItem(LAST_COSTING_KEY);
  } catch {
    return null;
  }
}

function rememberCurrentCosting() {
  try {
    localStorage.setItem(LAST_COSTING_KEY, currentCostingId || "");
  } catch {}
}

function getCurrentCostingTitle() {
  if (!currentCostingId) return NEW_COSTING_LABEL;
  return $("#garmentName").value.trim() || "Untitled costing";
}

function updateCurrentCostingLabel() {
  const select = $("#savedCostings");
  const title = getCurrentCostingTitle();

  document.title = `${title} - Inkson Garment Cost Calculator`;

  if (!select) return;
  const newOption = select.querySelector('option[value=""]');
  if (newOption) newOption.textContent = NEW_COSTING_LABEL;

  if (!currentCostingId) return;

  const currentOption = select.querySelector(`option[value="${CSS.escape(currentCostingId)}"]`);
  if (currentOption) {
    currentOption.textContent = title;
  }
}

function updateDisplay() {
  calculations = calculatePricing();
  const competitor = calculateCompetitors(calculations.retailPrice);
  const state = getStatusState(calculations);
  const statusIcon = getStatusIcon(state);
  const statusText = calculations.warning || calculations.wholesaleStatus;

  setText("garmentBasicsTotal", `${formatMoney(calculations.unitCost)} / unit`);
  setText("materialsTotal", `${formatMoney(calculations.materials)} / unit`);
  setText("developmentPerUnit", `${formatMoney(calculations.development.perUnit)} / unit`);
  setText("labourTotal", `${formatMoney(calculations.labour.total)} / unit`);
  setText("overheadPerUnit", `${formatMoney(calculations.overhead.perUnit)} / unit`);
  setText("sellingTotal", `${formatMoney(calculations.sellingTotal)} / unit`);
  setText("marketAverageTotal", `${formatMoney(competitor.average)} / unit`);
  setText("commercialUnitTotal", `${formatMoney(calculations.unitCost)} / unit`);

  setText("outMaterials", formatMoney(calculations.materials));
  setText("outDevelopment", formatMoney(calculations.development.perUnit));
  setText("outLabour", formatMoney(calculations.labour.total));
  setText("outOverhead", formatMoney(calculations.overhead.perUnit));
  setText("outSelling", formatMoney(calculations.sellingTotal));
  setText("outUnitCost", formatMoney(calculations.unitCost));
  setText("outRetail", formatWholeMoney(calculations.retailPrice));
  setText("outGrossProfit", formatMoney(calculations.grossProfit));
  setText("outGrossMargin", formatPercent(calculations.grossMargin));
  setText("outWholesale", formatMoney(calculations.wholesalePrice));
  setText("outWholesaleProfit", formatMoney(calculations.wholesaleProfit));
  setText("outWholesaleViable", calculations.wholesaleStatus);

  setText("summaryRetail", formatWholeMoney(calculations.retailPrice));
  setText("summaryUnitCost", formatMoney(calculations.unitCost));
  setText("summaryMargin", formatPercent(calculations.grossMargin));
  setText("summaryWholesale", formatMoney(calculations.wholesalePrice));
  setText("summaryWholesaleProfit", formatMoney(calculations.wholesaleProfit));
  updateCurrentCostingLabel();

  const summaryStatus = $("#summaryStatus");
  const wholesaleOutput = $("#outWholesaleViable");
  const summaryStatusIcon = $("#summaryStatusIcon");
  const pricingWarningIcon = $("#pricingWarningIcon");
  setElementClass($("#summaryRetailCard"), "summary-card retail-card", state);
  setElementClass($("#pricingSummaryCard"), "pricing-summary", state);
  if (summaryStatus) summaryStatus.textContent = calculations.wholesaleStatus;
  if (summaryStatusIcon) summaryStatusIcon.src = statusIcon;
  if (pricingWarningIcon) pricingWarningIcon.src = statusIcon;
  setText("pricingWarningText", statusText);
  if (wholesaleOutput) wholesaleOutput.className = calculations.wholesaleClass;

  setText("compInksonRetail", formatMoney(calculations.retailPrice));
  setText("compLowest", formatMoney(competitor.lowest));
  setText("compHighest", formatMoney(competitor.highest));
  setText("compAverage", formatMoney(competitor.average));
  setText("compPosition", competitor.position);
  setText("competitorPosition", competitor.position);
  const compPosition = $("#compPosition");
  const competitorPosition = $("#competitorPosition");
  if (compPosition) compPosition.className = competitor.className;
  if (competitorPosition) competitorPosition.className = competitor.className;
}

function getFormState() {
  const formValues = {};
  $$("#costingForm input, #costingForm select, #costingForm textarea").forEach((field) => {
    if (field.type === "radio") {
      if (field.checked) formValues[field.name] = field.value;
    } else if (!field.className.includes("material-")) {
      formValues[field.id || field.name] = field.value;
    }
  });

  return {
    id: currentCostingId || makeId(),
    build: APP_BUILD,
    savedAt: new Date().toISOString(),
    title: $("#garmentName").value.trim() || "Untitled costing",
    labourMode,
    formValues,
    materials: collectMaterials(),
  };
}

function applyFormState(state, options = {}) {
  const { remember = true } = options;
  if (!state) return;
  currentCostingId = state.id || null;
  labourMode = state.labourMode || "simple";

  Object.entries(state.formValues || {}).forEach(([key, value]) => {
    const field = $(`#${CSS.escape(key)}`) || $(`[name="${CSS.escape(key)}"][value="${CSS.escape(value)}"]`);
    if (!field) return;
    if (field.type === "radio") {
      field.checked = true;
    } else {
      field.value = value;
    }
  });

  $("#materialsTable tbody").innerHTML = "";
  (state.materials?.length ? state.materials : defaultMaterials.map((name) => ({ name }))).forEach(createMaterialRow);
  setLabourMode(labourMode);
  renderSavedCostings();
  showStep(0, false);
  updateDisplay();
  if (remember) rememberCurrentCosting();
}

function readSavedCostings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeSavedCostings(costings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(costings));
  renderSavedCostings();
}

function renderSavedCostings() {
  const select = $("#savedCostings");
  const costings = readSavedCostings();
  select.innerHTML = `<option value="">${NEW_COSTING_LABEL}</option>`;
  costings
    .slice()
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
    .forEach((costing) => {
      const option = document.createElement("option");
      option.value = costing.id;
      option.textContent = costing.title || "Untitled costing";
      option.selected = costing.id === currentCostingId;
      select.appendChild(option);
    });
  updateCurrentCostingLabel();
}

function saveCurrentCosting() {
  const state = getFormState();
  currentCostingId = state.id;
  const costings = readSavedCostings();
  const index = costings.findIndex((costing) => costing.id === state.id);
  if (index >= 0) {
    costings[index] = state;
  } else {
    costings.push(state);
  }
  writeSavedCostings(costings);
  rememberCurrentCosting();
  showToast("Costing saved");
}

function duplicateCurrentCosting() {
  const state = getFormState();
  state.id = makeId();
  state.title = `${state.title} copy`;
  state.formValues.garmentName = state.title;
  currentCostingId = state.id;
  const costings = readSavedCostings();
  costings.push(state);
  writeSavedCostings(costings);
  rememberCurrentCosting();
  applyFormState(state);
  showToast("Costing duplicated");
}

function deleteCurrentCosting() {
  if (!currentCostingId) {
    resetForm();
    showToast("Current costing cleared");
    return;
  }

  const costings = readSavedCostings().filter((costing) => costing.id !== currentCostingId);
  writeSavedCostings(costings);
  resetForm();
  showToast("Costing deleted");
}

function resetForm(options = {}) {
  const { focus = false, remember = true } = options;
  currentCostingId = null;
  $("#costingForm").reset();
  $("#garmentName").value = "";
  $("#styleCode").value = "";
  $("#productType").value = "";
  $("#productionQuantity").value = "50";
  $("#targetMargin").value = "70";
  $("#paymentGatewayPercent").value = "1.8";
  $("#monthlyProductionUnits").value = "100";
  loadDefaultMaterials();
  setLabourMode("simple");
  showStep(0, false);
  renderSavedCostings();
  updateDisplay();
  if (remember) rememberCurrentCosting();
  if (focus) requestAnimationFrame(() => $("#garmentName").focus());
}

function exportJson() {
  const state = getFormState();
  state.calculations = calculations;
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = (state.title || "inkson-costing").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  link.href = url;
  link.download = `${safeName || "inkson-costing"}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("JSON exported");
}

function makeSummaryText() {
  const garment = $("#garmentName").value.trim() || "Untitled garment";
  const style = $("#styleCode").value.trim();
  return [
    `Inkson costing summary`,
    `Build: ${APP_BUILD}`,
    `Garment: ${garment}${style ? ` (${style})` : ""}`,
    `Production quantity: ${calculations.productionQuantity}`,
    `GST included in retail price: ${calculations.gstIncluded ? "yes" : "no"}`,
    `Direct materials: ${formatMoney(calculations.materials)}`,
    `Development recovery per unit: ${formatMoney(calculations.development.perUnit)}`,
    `Labour per unit: ${formatMoney(calculations.labour.total)}`,
    `Overhead allocation per unit: ${formatMoney(calculations.overhead.perUnit)}`,
    `Selling cost estimate: ${formatMoney(calculations.sellingTotal)}`,
    `Total unit cost: ${formatMoney(calculations.unitCost)}`,
    `Recommended DTC retail: ${formatMoney(calculations.retailPrice)}`,
    `Gross profit per unit: ${formatMoney(calculations.grossProfit)}`,
    `Gross margin: ${formatPercent(calculations.grossMargin)}`,
    `Wholesale price: ${formatMoney(calculations.wholesalePrice)}`,
    `Wholesale profit per unit: ${formatMoney(calculations.wholesaleProfit)}`,
    `Wholesale status: ${calculations.wholesaleStatus}`,
  ].join("\n");
}

async function copySummary() {
  const summary = makeSummaryText();
  try {
    await navigator.clipboard.writeText(summary);
    showToast("Pricing summary copied");
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = summary;
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
    showToast("Pricing summary copied");
  }
}

function confirmRefreshCosting() {
  const shouldRefresh = window.confirm(
    "Warning: refreshing will clear all entered data in the current costing. Saved costings will not be deleted. Proceed with care?"
  );

  if (!shouldRefresh) return;
  resetForm();
  showToast("Costing refreshed");
}

function setLabourMode(mode) {
  labourMode = mode;
  $("#simpleLabourButton").classList.toggle("active", mode === "simple");
  $("#advancedLabourButton").classList.toggle("active", mode === "advanced");
  $("#simpleLabourFields").classList.toggle("hidden", mode !== "simple");
  $("#advancedLabourFields").classList.toggle("hidden", mode !== "advanced");
  updateDisplay();
}

function bindEvents() {
  $("#costingForm").addEventListener("input", updateDisplay);
  $("#costingForm").addEventListener("change", updateDisplay);

  $("#materialsTable").addEventListener("click", (event) => {
    const resetButton = event.target.closest(".reset-row");
    if (resetButton) {
      const row = resetButton.closest("tr");
      $(".material-unit-cost", row).value = "0";
      $(".material-quantity", row).value = "0";
      $(".material-wastage", row).value = "0";
      updateDisplay();
      return;
    }

    const button = event.target.closest(".remove-row");
    if (!button) return;
    button.closest("tr").remove();
    updateDisplay();
  });

  $("#addMaterialButton").addEventListener("click", () => {
    const row = createMaterialRow({ name: "" });
    updateDisplay();
    const nameInput = $(".material-name", row);
    row.scrollIntoView({ behavior: "smooth", block: "center" });
    nameInput.focus();
    nameInput.select();
  });

  $("#simpleLabourButton").addEventListener("click", () => setLabourMode("simple"));
  $("#advancedLabourButton").addEventListener("click", () => setLabourMode("advanced"));

  $$(".next-step").forEach((button) => {
    button.addEventListener("click", () => showStep(currentStep + 1));
  });

  $$(".back-step").forEach((button) => {
    button.addEventListener("click", () => showStep(currentStep - 1));
  });

  $("#saveButton").addEventListener("click", saveCurrentCosting);
  $("#saveAtEndButton").addEventListener("click", saveCurrentCosting);
  $("#duplicateButton").addEventListener("click", duplicateCurrentCosting);
  $("#deleteButton").addEventListener("click", deleteCurrentCosting);
  $("#newButton").addEventListener("click", resetForm);
  $("#backToStartButton").addEventListener("click", () => showStep(0));
  $$(".step-refresh-button").forEach((button) => {
    button.addEventListener("click", confirmRefreshCosting);
  });
  $("#exportJsonButton").addEventListener("click", exportJson);
  $("#copySummaryButton").addEventListener("click", copySummary);
  $("#printButton")?.addEventListener("click", () => window.print());
  $("#themeToggle")?.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });

  $("#savedCostings").addEventListener("change", (event) => {
    const id = event.target.value;
    if (!id) {
      resetForm();
      showToast("New costing ready");
      return;
    }

    const costing = readSavedCostings().find((item) => item.id === id);
    if (costing) {
      applyFormState(costing);
      showToast("Costing loaded");
    }
  });
}

function loadInitialCosting() {
  const costings = readSavedCostings();
  const sortedCostings = costings.slice().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  const lastCostingId = readLastCostingId();

  if (lastCostingId === "") {
    resetForm({ focus: false, remember: false });
    return;
  }

  const costing =
    sortedCostings.find((item) => item.id === lastCostingId) ||
    (lastCostingId === null ? sortedCostings[0] : null);

  if (costing) {
    applyFormState(costing, { remember: false });
    return;
  }

  resetForm({ focus: false, remember: false });
}

createStaticFields();
loadDefaultMaterials();
bindEvents();
setText("buildNumber", APP_BUILD);
applyTheme(document.documentElement.dataset.theme);
loadInitialCosting();
