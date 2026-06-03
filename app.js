const STORAGE_KEY = "inkson-costings-v1";
const THEME_KEY = "inkson-theme-v1";
const LAST_COSTING_KEY = "inkson-last-costing-v1";
const ACCENT_KEY = "gcc-accent-v1";
const PROFILE_KEY = "gcc-profile-v1";
const SUPABASE_URL = "https://mtdruznliejklgketgij.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_paCSohSyl8gTTVD6lxouLA_dWYCGaa_";
const CLOUD_TABLE = "costings";
const APP_BUILD = "v2.11";
const NEW_COSTING_LABEL = "Add new Costing";
const MOBILE_NEW_COSTING_LABEL = "Item-Name";
const DEFAULT_ACCENT = "#70a480";

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
let selectedAccent = DEFAULT_ACCENT;
let supabaseClient = null;
let currentUser = null;
let cloudReady = false;

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

function setStepTotal(id, value) {
  const element = $(`#${id}`);
  if (!element) return;
  const valueElement = $(".step-total-value", element);
  if (valueElement) {
    valueElement.textContent = value;
  } else {
    element.textContent = value;
  }
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

function userMetadata() {
  return currentUser?.user_metadata || {};
}

function userProfileStorageKey() {
  return currentUser ? `${PROFILE_KEY}:${currentUser.id}` : PROFILE_KEY;
}

function readUserProfile() {
  if (!currentUser) return {};
  try {
    return JSON.parse(localStorage.getItem(userProfileStorageKey()) || "{}");
  } catch {
    return {};
  }
}

function writeUserProfile(profile) {
  if (!currentUser) return;
  try {
    localStorage.setItem(userProfileStorageKey(), JSON.stringify(profile || {}));
  } catch {
    showToast("Image could not be saved in this browser");
  }
}

function userDisplayName() {
  const metadata = userMetadata();
  const profile = readUserProfile();
  const fullName = [metadata.first_name, metadata.last_name].filter(Boolean).join(" ").trim();
  const fromEmail = currentUser?.email ? currentUser.email.split("@")[0] : "";
  return profile.displayName || metadata.name || metadata.full_name || fullName || fromEmail || "Jody Kahlon";
}

function userFirstName() {
  const fromMetadata = userDisplayName();
  const fromEmail = currentUser?.email ? currentUser.email.split("@")[0] : "there";
  return String(fromMetadata || fromEmail).split(" ")[0] || "there";
}

function initialsForName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "JK";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function businessInitial() {
  const metadata = userMetadata();
  return initialsForName(metadata.business_name || "Business").slice(0, 1);
}

function savedStorageKey() {
  return currentUser ? `${STORAGE_KEY}:${currentUser.id}` : STORAGE_KEY;
}

function lastCostingStorageKey() {
  return currentUser ? `${LAST_COSTING_KEY}:${currentUser.id}` : LAST_COSTING_KEY;
}

function legacyMigrationKey() {
  return currentUser ? `inkson-legacy-migrated:${currentUser.id}` : "";
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

function readAccent() {
  try {
    return localStorage.getItem(ACCENT_KEY) || DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

function saveAccent(accent) {
  try {
    localStorage.setItem(ACCENT_KEY, accent);
  } catch {}
}

function applyAccent(accent) {
  selectedAccent = accent || DEFAULT_ACCENT;
  document.documentElement.style.setProperty("--accent", selectedAccent);
  $$(".accent-swatch").forEach((button) => {
    const isActive = button.dataset.accent?.toLowerCase() === selectedAccent.toLowerCase();
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function applyBusinessLogo(logoDataUrl) {
  $$(".brand-mark").forEach((mark) => {
    if (logoDataUrl) {
      mark.classList.add("has-custom-logo");
      mark.style.backgroundImage = `url("${logoDataUrl}")`;
    } else {
      mark.classList.remove("has-custom-logo");
      mark.style.backgroundImage = "";
    }
  });
}

function updateImagePreview(container, image, fallback, dataUrl, fallbackText) {
  if (!container || !image || !fallback) return;
  if (dataUrl) {
    image.src = dataUrl;
    image.hidden = false;
    fallback.hidden = true;
    container.classList.add("has-image");
  } else {
    image.removeAttribute("src");
    image.hidden = true;
    fallback.hidden = false;
    fallback.textContent = fallbackText;
    container.classList.remove("has-image");
  }
}

function populateSettingsFields() {
  const profile = readUserProfile();
  const displayName = profile.displayName || userDisplayName();
  const displayField = $("#settingsDisplayName");
  const emailField = $("#settingsEmail");
  const passwordField = $("#settingsPassword");
  const confirmField = $("#settingsConfirmPassword");
  const deleteAvatarButton = $("#deleteAvatarButton");
  const deleteLogoButton = $("#deleteLogoButton");

  if (displayField) displayField.value = displayName;
  if (emailField) emailField.value = currentUser?.email || "";
  if (passwordField) passwordField.value = "";
  if (confirmField) confirmField.value = "";

  updateImagePreview(
    $("#settingsAvatarPreview"),
    $("#settingsAvatarImage"),
    $("#settingsAvatarInitials"),
    profile.avatarDataUrl,
    initialsForName(displayName)
  );
  updateImagePreview(
    $("#companyLogoPreview"),
    $("#companyLogoImage"),
    $("#companyLogoInitial"),
    profile.businessLogoDataUrl,
    businessInitial()
  );
  applyBusinessLogo(profile.businessLogoDataUrl);
  if (deleteAvatarButton) deleteAvatarButton.hidden = !profile.avatarDataUrl;
  if (deleteLogoButton) deleteLogoButton.hidden = !profile.businessLogoDataUrl;
}

function splitDisplayName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function resizeImageDataUrl(dataUrl, fileType, maxSize) {
  if (fileType === "image/svg+xml") return Promise.resolve(dataUrl);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const largestSide = Math.max(image.width, image.height);
      if (!largestSide || largestSide <= maxSize) {
        resolve(dataUrl);
        return;
      }

      const scale = maxSize / largestSide;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const outputType = fileType === "image/jpeg" ? "image/jpeg" : "image/png";
      resolve(canvas.toDataURL(outputType, 0.9));
    };
    image.onerror = reject;
    image.src = dataUrl;
  });
}

async function imageFileToDataUrl(file, maxSize) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Choose an image file");
  }
  if (file.size > 6 * 1024 * 1024) {
    throw new Error("Choose an image under 6 MB");
  }
  const dataUrl = await readFileAsDataUrl(file);
  return resizeImageDataUrl(dataUrl, file.type, maxSize);
}

async function handleProfileImageUpload(event, kind) {
  const input = event.target;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  try {
    const profile = readUserProfile();
    const dataUrl = await imageFileToDataUrl(file, kind === "avatar" ? 256 : 640);
    if (kind === "avatar") {
      profile.avatarDataUrl = dataUrl;
    } else {
      profile.businessLogoDataUrl = dataUrl;
    }
    writeUserProfile(profile);
    populateSettingsFields();
    updateGreeting();
    showToast(kind === "avatar" ? "Avatar updated" : "Company logo updated");
  } catch (error) {
    showToast(error.message || "Image upload failed");
  }
}

function deleteProfileImage(kind) {
  const profile = readUserProfile();
  if (kind === "avatar") {
    delete profile.avatarDataUrl;
  } else {
    delete profile.businessLogoDataUrl;
  }
  writeUserProfile(profile);
  populateSettingsFields();
  updateGreeting();
  showToast(kind === "avatar" ? "Avatar deleted" : "Company logo reset");
}

async function saveSettings() {
  const displayName = $("#settingsDisplayName")?.value.trim() || userDisplayName();
  const email = $("#settingsEmail")?.value.trim() || currentUser?.email || "";
  const password = $("#settingsPassword")?.value || "";
  const confirmPassword = $("#settingsConfirmPassword")?.value || "";

  if (password || confirmPassword) {
    if (password !== confirmPassword) {
      showToast("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      showToast("Password must be at least 8 characters");
      return;
    }
  }

  const profile = readUserProfile();
  profile.displayName = displayName;
  writeUserProfile(profile);
  saveAccent(selectedAccent);

  if (supabaseClient && currentUser) {
    const { firstName, lastName } = splitDisplayName(displayName);
    const updates = {
      data: {
        ...userMetadata(),
        name: displayName,
        full_name: displayName,
        first_name: firstName,
        last_name: lastName,
      },
    };
    if (email && email !== currentUser.email) updates.email = email;
    if (password) updates.password = password;

    const { data, error } = await supabaseClient.auth.updateUser(updates);
    if (error) {
      showToast(friendlyAuthError(error));
      return;
    }
    if (data?.user) currentUser = data.user;
  }

  populateSettingsFields();
  updateGreeting();
  closeOpenModals();
  showToast("Settings saved");
}

function updateGreeting() {
  const hour = new Date().getHours();
  const period = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  setText("greetingText", `Good ${period}, ${userFirstName()}!`);
}

function openModal(id) {
  const modal = $(`#${id}`);
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  const closeButton = $("[data-close-modal]", modal);
  if (closeButton) requestAnimationFrame(() => closeButton.focus());
}

function closeModal(modal) {
  if (!modal) return;
  modal.hidden = true;
  if (!$(".modal-backdrop:not([hidden])")) {
    document.body.classList.remove("modal-open");
  }
}

function closeOpenModals() {
  $$(".modal-backdrop").forEach(closeModal);
}

function switchSettingsTab(tabName) {
  const nextTab = tabName === "account" ? "account" : "appearance";
  $$(".settings-tab").forEach((button) => {
    const isActive = button.dataset.settingsTab === nextTab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  $("#accountSettingsPanel").hidden = nextTab !== "account";
  $("#appearanceSettingsPanel").hidden = nextTab !== "appearance";
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
      <div class="material-action-buttons">
        <button class="row-icon reset-row" type="button" aria-label="Reset material row" title="Reset row">
          <img src="assets/icons/refresh.svg" alt="" />
        </button>
        <button class="row-icon remove-row" type="button" aria-label="Remove material row" title="Remove row">
          <img src="assets/icons/bin-1.svg" alt="" />
        </button>
      </div>
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
  if (!result) return "neutral";
  if (result.denominator <= 0 || result.wholesaleStatus === "Not wholesale viable") return "danger";
  if (result.retailPrice <= 0) return "neutral";
  if (result.wholesaleStatus === "Weak wholesale margin") return "warning";
  if (result.wholesaleStatus === "Wholesale viable") return "success";
  return "neutral";
}

function getStatusIcon(state) {
  if (state === "success") return "assets/icons/tick.svg";
  if (state === "danger" || state === "warning") return "assets/icons/warning.svg";
  return "assets/icons/info.svg";
}

function getSummaryStatusIcon(state) {
  if (state === "warning") return "assets/icons/info.svg";
  return getStatusIcon(state);
}

function setElementClass(element, baseClass, state) {
  if (!element) return;
  element.className = `${baseClass} summary-state-${state}`;
}

function readLastCostingId() {
  try {
    return localStorage.getItem(lastCostingStorageKey());
  } catch {
    return null;
  }
}

function rememberCurrentCosting() {
  try {
    localStorage.setItem(lastCostingStorageKey(), currentCostingId || "");
  } catch {}
}

function getCurrentCostingTitle() {
  if (!currentCostingId) return newCostingLabel();
  return $("#garmentName").value.trim() || "Untitled costing";
}

function sortedSavedCostings() {
  return readSavedCostings().slice().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

function newCostingLabel() {
  return window.matchMedia("(max-width: 700px)").matches ? MOBILE_NEW_COSTING_LABEL : NEW_COSTING_LABEL;
}

function setSavedCostingMenuOpen(isOpen) {
  const picker = $("#savedCostingPicker");
  const toggle = $("#savedCostingToggle");
  const menu = $("#savedCostingMenu");
  if (!picker || !toggle || !menu) return;

  picker.classList.toggle("is-open", isOpen);
  toggle.setAttribute("aria-expanded", String(isOpen));
  menu.hidden = !isOpen;

  if (isOpen) renderSavedCostingMenu();
}

function renderSavedCostingMenu() {
  const menu = $("#savedCostingMenu");
  if (!menu) return;

  const costings = sortedSavedCostings();
  menu.innerHTML = "";

  if (!costings.length) {
    const empty = document.createElement("button");
    empty.type = "button";
    empty.className = "saved-costing-option is-empty";
    empty.textContent = "No saved costings";
    empty.disabled = true;
    menu.appendChild(empty);
    return;
  }

  costings.forEach((costing) => {
    const option = document.createElement("button");
    const isCurrent = costing.id === currentCostingId;
    option.type = "button";
    option.className = `saved-costing-option${isCurrent ? " is-current" : ""}`;
    option.textContent = costing.title || "Untitled costing";
    option.dataset.costingId = costing.id;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", String(isCurrent));
    menu.appendChild(option);
  });
}

function syncSavedCostingPicker() {
  const current = $("#savedCostingCurrent");
  const select = $("#savedCostings");
  if (current) current.textContent = getCurrentCostingTitle();
  if (select) select.value = currentCostingId || "";
  if ($("#savedCostingPicker")?.classList.contains("is-open")) {
    renderSavedCostingMenu();
  }
}

function updateCurrentCostingLabel() {
  const select = $("#savedCostings");
  const title = getCurrentCostingTitle();

  document.title = `${title} - Inkson Garment Cost Calculator`;

  if (!select) {
    syncSavedCostingPicker();
    return;
  }

  const newOption = select.querySelector('option[value=""]');
  if (newOption) newOption.textContent = newCostingLabel();

  if (!currentCostingId) {
    syncSavedCostingPicker();
    return;
  }

  const currentOption = select.querySelector(`option[value="${CSS.escape(currentCostingId)}"]`);
  if (currentOption) {
    currentOption.textContent = title;
  }
  syncSavedCostingPicker();
}

function updateDisplay() {
  calculations = calculatePricing();
  const competitor = calculateCompetitors(calculations.retailPrice);
  const state = getStatusState(calculations);
  const statusIcon = getStatusIcon(state);
  const statusText = calculations.warning || calculations.wholesaleStatus;

  setStepTotal("garmentBasicsTotal", `${formatMoney(calculations.unitCost)} / unit`);
  setStepTotal("materialsTotal", `${formatMoney(calculations.materials)} / unit`);
  setStepTotal("developmentPerUnit", `${formatMoney(calculations.development.perUnit)} / unit`);
  setStepTotal("labourTotal", `${formatMoney(calculations.labour.total)} / unit`);
  setStepTotal("overheadPerUnit", `${formatMoney(calculations.overhead.perUnit)} / unit`);
  setStepTotal("sellingTotal", `${formatMoney(calculations.sellingTotal)} / unit`);
  setStepTotal("marketAverageTotal", `${formatMoney(competitor.average)} / unit`);

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
  if (summaryStatusIcon) summaryStatusIcon.src = getSummaryStatusIcon(state);
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

function readLocalSavedCostings(key = savedStorageKey()) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeLocalSavedCostings(costings, key = savedStorageKey()) {
  localStorage.setItem(key, JSON.stringify(costings));
}

function readSavedCostings() {
  return readLocalSavedCostings();
}

function writeSavedCostings(costings) {
  writeLocalSavedCostings(costings);
  renderSavedCostings();
}

function cloudStatusText() {
  if (!currentUser) return "Signed out";
  return cloudReady ? "Connected" : "Local fallback";
}

function updateAccountDetails() {
  populateSettingsFields();
  updateGreeting();
}

function normaliseCloudCosting(row) {
  const payload = row.payload || {};
  return {
    ...payload,
    id: payload.id || row.id,
    title: row.title || payload.title || "Untitled costing",
    savedAt: row.saved_at || payload.savedAt || new Date().toISOString(),
  };
}

async function refreshCloudCostings(options = {}) {
  const { quiet = false } = options;
  if (!currentUser || !supabaseClient) return false;

  const { data, error } = await supabaseClient
    .from(CLOUD_TABLE)
    .select("id,title,saved_at,payload")
    .order("saved_at", { ascending: false });

  if (error) {
    cloudReady = false;
    updateAccountDetails();
    if (!quiet) showToast("Cloud save table not ready");
    return false;
  }

  cloudReady = true;
  writeLocalSavedCostings((data || []).map(normaliseCloudCosting));
  renderSavedCostings();
  updateAccountDetails();
  return true;
}

async function saveCostingToCloud(state) {
  if (!currentUser || !supabaseClient) return false;

  const { error } = await supabaseClient.from(CLOUD_TABLE).upsert(
    {
      id: state.id,
      user_id: currentUser.id,
      title: state.title,
      payload: state,
      saved_at: state.savedAt,
    },
    { onConflict: "id" }
  );

  if (error) {
    cloudReady = false;
    updateAccountDetails();
    return false;
  }

  cloudReady = true;
  updateAccountDetails();
  return true;
}

async function deleteCostingFromCloud(id) {
  if (!currentUser || !supabaseClient || !id) return false;

  const { error } = await supabaseClient.from(CLOUD_TABLE).delete().eq("id", id);
  if (error) {
    cloudReady = false;
    updateAccountDetails();
    return false;
  }

  cloudReady = true;
  updateAccountDetails();
  return true;
}

async function migrateLegacyLocalCostings(syncCloud) {
  if (!currentUser) return;

  try {
    const migrationKey = legacyMigrationKey();
    if (localStorage.getItem(migrationKey) === "done") return;

    const legacyCostings = readLocalSavedCostings(STORAGE_KEY);
    if (!legacyCostings.length) {
      localStorage.setItem(migrationKey, "done");
      return;
    }

    const existing = readSavedCostings();
    const existingIds = new Set(existing.map((costing) => costing.id));
    const merged = existing.concat(legacyCostings.filter((costing) => !existingIds.has(costing.id)));
    writeSavedCostings(merged);

    if (syncCloud) {
      for (const costing of legacyCostings) {
        await saveCostingToCloud(costing);
      }
    }

    localStorage.setItem(migrationKey, "done");
    showToast("Previous browser saves copied to this account");
  } catch {}
}

function renderSavedCostings() {
  const select = $("#savedCostings");
  const costings = sortedSavedCostings();
  select.innerHTML = `<option value="">${newCostingLabel()}</option>`;
  costings
    .forEach((costing) => {
      const option = document.createElement("option");
      option.value = costing.id;
      option.textContent = costing.title || "Untitled costing";
      option.selected = costing.id === currentCostingId;
      select.appendChild(option);
    });
  updateCurrentCostingLabel();
}

function handleSavedCostingSelection(id) {
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
}

async function saveCurrentCosting() {
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
  const savedToCloud = await saveCostingToCloud(state);
  showToast(savedToCloud ? "Costing saved to account" : "Costing saved on this browser");
}

async function duplicateCurrentCosting() {
  const state = getFormState();
  state.id = makeId();
  state.title = `${state.title} copy`;
  state.savedAt = new Date().toISOString();
  state.formValues.garmentName = state.title;
  currentCostingId = state.id;
  const costings = readSavedCostings();
  costings.push(state);
  writeSavedCostings(costings);
  rememberCurrentCosting();
  applyFormState(state);
  const savedToCloud = await saveCostingToCloud(state);
  showToast(savedToCloud ? "Costing duplicated to account" : "Costing duplicated on this browser");
}

async function deleteCurrentCosting() {
  if (!currentCostingId) {
    resetForm();
    showToast("Current costing cleared");
    return;
  }

  const deletedId = currentCostingId;
  const costings = readSavedCostings().filter((costing) => costing.id !== currentCostingId);
  writeSavedCostings(costings);
  resetForm();
  const deletedFromCloud = await deleteCostingFromCloud(deletedId);
  showToast(deletedFromCloud ? "Costing deleted from account" : "Costing deleted on this browser");
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

function showAuthPanel(panelName) {
  const nextPanel = panelName || "login";
  const authShell = $("#authShell");
  const statusPanel = $("#authStatusPanel");
  if (authShell) {
    authShell.dataset.authPanel = nextPanel;
    delete authShell.dataset.authStatus;
  }
  if (statusPanel) statusPanel.hidden = true;
  $$(".auth-panel").forEach((panel) => {
    const isActive = panel.dataset.authPanel === nextPanel;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

function setAuthMessage(message = "", state = "") {
  const messageElement = $("#authMessage");
  if (!messageElement) return;
  messageElement.textContent = message;
  messageElement.className = `auth-message${state ? ` ${state}` : ""}`;
  messageElement.hidden = !message;
}

function showAuthStatus(message, state = "loading") {
  const authShell = $("#authShell");
  const statusPanel = $("#authStatusPanel");
  const statusIcon = $("#authStatusIcon");
  const statusText = $("#authStatusText");
  const iconName = state === "error" ? "warning" : state === "success" || state === "login-success" ? "tick" : "info";

  if (authShell) {
    authShell.dataset.authPanel = "status";
    authShell.dataset.authStatus = state;
  }

  $$(".auth-panel").forEach((panel) => {
    panel.classList.remove("is-active");
    panel.hidden = true;
  });

  if (statusIcon) statusIcon.src = `assets/icons/${iconName}.svg`;
  if (statusText) statusText.textContent = message;
  if (statusPanel) statusPanel.hidden = false;
  setAuthMessage("");
}

function authRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

function supabaseSdk() {
  if (window.supabase?.createClient) return window.supabase;
  try {
    if (supabase?.createClient) return supabase;
  } catch {}
  return null;
}

function friendlyAuthError(error) {
  const message = error?.message || "Something went wrong. Please try again.";
  if (message.toLowerCase().includes("invalid login credentials")) return "Email or password is incorrect.";
  if (message.toLowerCase().includes("already registered")) return "This email already has an account.";
  return message;
}

function setAppAccess(isSignedIn) {
  const authShell = $("#authShell");
  const appShell = $("#appShell");
  if (authShell) authShell.hidden = isSignedIn;
  if (appShell) appShell.hidden = !isSignedIn;
}

async function prepareUserCostings() {
  const cloudLoaded = await refreshCloudCostings({ quiet: true });
  await migrateLegacyLocalCostings(cloudLoaded);
  if (cloudLoaded) await refreshCloudCostings({ quiet: true });
  loadInitialCosting();
}

async function handleSignedIn(user, options = {}) {
  const { force = false } = options;
  const isSameUser = currentUser?.id === user?.id;
  currentUser = user || null;
  cloudReady = false;
  setAppAccess(true);
  updateAccountDetails();
  setAuthMessage("");

  if (!isSameUser || force) {
    await prepareUserCostings();
  }
}

function handleSignedOut() {
  currentUser = null;
  cloudReady = false;
  currentCostingId = null;
  setAppAccess(false);
  showAuthPanel("login");
  updateAccountDetails();
  setAuthMessage("");
  document.title = "Inkson Garment Cost Calculator";
}

async function handleLogin(event) {
  event.preventDefault();
  const email = $("#loginEmail").value.trim();
  const password = $("#loginPassword").value;
  showAuthStatus("Checking your account...", "loading");
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    showAuthPanel("login");
    setAuthMessage(friendlyAuthError(error), "error");
    return;
  }

  if (data?.user) {
    showAuthStatus("Successfully logged in, please wait while you are being redirected.", "login-success");
    await handleSignedIn(data.user, { force: true });
    showToast("Signed in");
  }
}

async function handleSignup(event) {
  event.preventDefault();
  const firstName = $("#signupFirstName").value.trim();
  const lastName = $("#signupLastName").value.trim();
  const businessName = $("#signupBusinessName").value.trim();
  const email = $("#signupEmail").value.trim();
  const password = $("#signupPassword").value;
  const confirmPassword = $("#signupConfirmPassword").value;

  if (password !== confirmPassword) {
    showAuthPanel("signup");
    setAuthMessage("Passwords do not match.", "error");
    return;
  }

  showAuthStatus("Checking your account...", "loading");
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        business_name: businessName,
      },
      emailRedirectTo: authRedirectUrl(),
    },
  });

  if (error) {
    showAuthPanel("signup");
    setAuthMessage(friendlyAuthError(error), "error");
    return;
  }

  if (data?.session?.user) {
    showAuthStatus("Account created. You can now sign in.", "success");
    await handleSignedIn(data.session.user, { force: true });
    showToast("Account created");
    return;
  }

  showAuthStatus("Account created. You can now sign in.", "success");
  window.setTimeout(() => showAuthPanel("login"), 1800);
}

async function handleForgotPassword(event) {
  event.preventDefault();
  const email = $("#resetEmail").value.trim();
  showAuthStatus("Sending reset link...", "loading");
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: authRedirectUrl(),
  });

  if (error) {
    showAuthPanel("forgot");
    setAuthMessage(friendlyAuthError(error), "error");
    return;
  }

  showAuthStatus("Password reset sent. Check your email.", "success");
  window.setTimeout(() => showAuthPanel("login"), 1800);
}

async function handleUpdatePassword(event) {
  event.preventDefault();
  const password = $("#newPassword").value;
  const confirmPassword = $("#confirmNewPassword").value;

  if (password !== confirmPassword) {
    showAuthPanel("update-password");
    setAuthMessage("Passwords do not match.", "error");
    return;
  }

  showAuthStatus("Updating password...", "loading");
  const { data, error } = await supabaseClient.auth.updateUser({ password });

  if (error) {
    showAuthPanel("update-password");
    setAuthMessage(friendlyAuthError(error), "error");
    return;
  }

  if (data?.user) {
    await handleSignedIn(data.user, { force: true });
    showToast("Password updated");
  }
}

async function initialiseAuth() {
  const sdk = supabaseSdk();
  if (!sdk) {
    setAuthMessage("Account service could not load. Check the internet connection and refresh.", "error");
    setAppAccess(false);
    return;
  }

  supabaseClient = sdk.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY" && session?.user) {
      currentUser = session.user;
      setAppAccess(false);
      showAuthPanel("update-password");
      setAuthMessage("Enter a new password to finish the reset.", "success");
      return;
    }

    if (session?.user) {
      handleSignedIn(session.user);
    } else {
      handleSignedOut();
    }
  });

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    setAuthMessage(friendlyAuthError(error), "error");
    setAppAccess(false);
    return;
  }

  if (data?.session?.user) {
    await handleSignedIn(data.session.user, { force: true });
  } else {
    handleSignedOut();
  }
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

  $("#settingsButton")?.addEventListener("click", () => {
    updateAccountDetails();
    openModal("settingsModal");
  });
  $("#aboutButton")?.addEventListener("click", () => openModal("aboutModal"));
  $$("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.closest(".modal-backdrop")));
  });
  $$(".modal-backdrop").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });
  $$(".settings-tab").forEach((button) => {
    button.addEventListener("click", () => switchSettingsTab(button.dataset.settingsTab));
  });
  $$(".accent-swatch").forEach((button) => {
    button.addEventListener("click", () => applyAccent(button.dataset.accent));
  });
  $$("[data-settings-save]").forEach((button) => {
    button.addEventListener("click", saveSettings);
  });
  $("#manageAvatarButton")?.addEventListener("click", () => $("#avatarUploadInput")?.click());
  $("#avatarUploadInput")?.addEventListener("change", (event) => handleProfileImageUpload(event, "avatar"));
  $("#deleteAvatarButton")?.addEventListener("click", () => deleteProfileImage("avatar"));
  $("#manageLogoButton")?.addEventListener("click", () => {
    $("#logoUploadInput")?.click();
  });
  $("#logoUploadInput")?.addEventListener("change", (event) => handleProfileImageUpload(event, "logo"));
  $("#deleteLogoButton")?.addEventListener("click", () => deleteProfileImage("logo"));
  $("#signOutButton")?.addEventListener("click", async () => {
    await supabaseClient?.auth.signOut();
    handleSignedOut();
    showToast("Signed out");
  });

  $$("[data-auth-view]").forEach((button) => {
    button.addEventListener("click", () => {
      showAuthPanel(button.dataset.authView);
      setAuthMessage("");
    });
  });
  $("#loginForm")?.addEventListener("submit", handleLogin);
  $("#signupForm")?.addEventListener("submit", handleSignup);
  $("#forgotPasswordForm")?.addEventListener("submit", handleForgotPassword);
  $("#updatePasswordForm")?.addEventListener("submit", handleUpdatePassword);

  $("#savedCostingToggle").addEventListener("click", () => {
    const picker = $("#savedCostingPicker");
    setSavedCostingMenuOpen(!picker.classList.contains("is-open"));
  });

  $("#savedCostingMenu").addEventListener("click", (event) => {
    const option = event.target.closest(".saved-costing-option");
    if (!option || option.disabled) return;
    setSavedCostingMenuOpen(false);
    handleSavedCostingSelection(option.dataset.costingId || "");
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#savedCostingPicker")) {
      setSavedCostingMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setSavedCostingMenuOpen(false);
      closeOpenModals();
    }
  });

  window.addEventListener("resize", syncSavedCostingPicker);

  $("#savedCostings").addEventListener("change", (event) => {
    handleSavedCostingSelection(event.target.value);
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
updateGreeting();
applyAccent(readAccent());
applyTheme(document.documentElement.dataset.theme);
initialiseAuth();
