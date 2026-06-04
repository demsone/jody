const STORAGE_KEY = "gcc-costings-v1";
const THEME_KEY = "gcc-theme-v1";
const LAST_COSTING_KEY = "gcc-last-costing-v1";
const ACCENT_KEY = "gcc-accent-v2";
const PROFILE_KEY = "gcc-profile-v1";
const SUPABASE_URL = "https://mtdruznliejklgketgij.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_paCSohSyl8gTTVD6lxouLA_dWYCGaa_";
const CLOUD_TABLE = "costings";
const APP_BUILD = "v2.16";
const NEW_COSTING_LABEL = "Add new Costing";
const MOBILE_NEW_COSTING_LABEL = "Item-Name";
const DEFAULT_ACCENT = "#82b0df";
const ACCENT_STATES = {
  "#ef4b9a": { tint: "rgba(239, 75, 154, 0.1)", hover: "#ef4b9a", bright: "#f16ead" },
  "#82b0df": { tint: "rgba(130, 176, 223, 0.1)", hover: "#6298cd", bright: "#82b0df" },
  "#c4533a": { tint: "rgba(196, 83, 58, 0.1)", hover: "#b8482f", bright: "#c4533a" },
  "#70a480": { tint: "rgba(112, 164, 128, 0.1)", hover: "#518e63", bright: "#70a480" },
  "#c4a35a": { tint: "rgba(196, 163, 90, 0.07)", hover: "#d6a946", bright: "#d6a946" },
  "#d6a946": { tint: "rgba(196, 163, 90, 0.07)", hover: "#d6a946", bright: "#d6a946" },
  "#a8b0ae": { tint: "rgba(168, 176, 174, 0.1)", hover: "#f4edda", bright: "#a8b0ae" },
};
const HELP_PAGES = [
  {
    title: "Intro",
    body: `Cost Calculator User Guide
Understanding the numbers behind garment pricing

This guide explains the logic behind the Garment Cost Calculator. It is not a technical guide for using the interface. It explains what each section means, why the calculator asks for certain numbers, and how it reaches the final recommended retail price.

The calculator is designed to answer one commercial question:

Can I produce this garment, sell it at this price, and keep enough margin for the business to survive?`,
  },
  {
    title: "1. The basic logic",
    body: `A garment has two different numbers:

1. What it costs to make.
2. What it needs to sell for.

These are not the same thing.

If a garment costs $150 to produce, selling it for $180 does not mean the business is healthy. That $30 difference has to support business overheads, selling costs, future development, mistakes, returns, and profit.

The calculator works by building the true unit cost first, then applying a target gross margin to calculate a recommended retail price.

Simple version:

Materials + development recovery + labour + overheads + selling costs = total unit cost

Total unit cost + required margin = recommended retail price`,
  },
  {
    title: "2. The eight sections of the calculator",
    body: `The app is structured as an eight-part costing flow:

1. Garment Details Setup
2. Direct Materials
3. Development Costs
4. Labour
5. Overheads
6. Selling Costs
7. Pricing Output
8. Competitor Comparison

Each section adds a different type of cost or commercial check. The key is not to mix them together. Fabric is not the same as labour. Labour is not the same as overhead. Competitor pricing is not the same as cost.`,
  },
  {
    title: "3. Section 1: Garment Details Setup",
    body: `This section sets the commercial assumptions for the costing.

Main fields:
Garment name
The name of the garment being costed. Example: Baggy Flared Stylist Pant.

Style code
An internal reference code. Useful when costing multiple samples or versions.

Product type
The category of garment. Example: pant, jacket, skirt, dress.

Production quantity
The number of units expected in this production run.

This is very important because some costs are spread across the number of garments being produced. A low production quantity makes each garment more expensive. A higher production quantity usually reduces the cost per unit.

Target gross margin %
The margin you want to keep after covering the unit cost of the garment.

For premium direct-to-consumer fashion, this often needs to be high enough to cover the wider business, not just the sewing.

GST included?
This tells the calculator whether GST should be considered in the final retail logic.

Production model
This describes how the garment is being produced:

Internal: made within the studio.
Local maker: made by a local external manufacturer.
Offshore: made by an overseas production partner.

Pricing model
This tells the calculator whether the garment is being assessed for direct-to-consumer only, or for both direct-to-consumer and wholesale.`,
  },
  {
    title: "4. Section 2: Direct Materials",
    body: `Direct materials are the physical things that go into the garment.

Examples:
Main fabric
Lining
Pocketing
Fusing / interfacing
Zip
Buttons
Hooks and bars
Buckles
D-rings
Rivets
Snaps
Elastic
Thread
Labels
Swing tags
Packaging
Garment bag
Tissue or wrapping
Satchel or box

The calculator usually asks for:

Unit cost
How much one unit costs. Example: fabric cost per metre, one zip, one buckle.

Quantity used
How much is used in one garment.

Waste percentage
Extra allowance for cutting loss, mistakes, shrinkage, or unusable fabric.

Total
The calculated cost of that item for one garment.

Example:

Fabric costs $28 per metre.
The pant uses 2.2 metres.
Waste allowance is 10%.

Fabric cost before waste:
$28 x 2.2 = $61.60

Waste allowance:
10% of $61.60 = $6.16

Total fabric cost:
$67.76

Why this matters:

Direct materials are often the easiest costs to see, but they are not the whole garment cost. A common mistake is pricing from fabric and trims only. That underprices the garment.`,
  },
  {
    title: "5. Section 3: Development Costs",
    body: `Development costs are the costs required to create the garment before it can be produced repeatedly.

Examples:
Pattern making
Sampling labour
Fit sample cost
Calico / toile fabric
Sample trims
Grading
Marker making
Technical documentation
Other development costs

These costs are not attached to only one garment. They are usually spread across a production run.

This is called development recovery.

Example:
Pattern, sampling, grading, and fitting cost $1,200.
The business produces 40 pants.

Development recovery per unit:
$1,200 / 40 = $30 per pant

If you only produce 10 pants:
$1,200 / 10 = $120 per pant

Same development cost. Very different unit impact.

Why this matters:

Development is not free. If the business does not recover development cost, it quietly loses money even when the garment appears profitable.

This section is especially important for you because the goal is to move from bespoke atelier work into repeatable product. Product development has to be treated as a commercial cost.`,
  },
  {
    title: "6. Section 4: Labour",
    body: `Labour is the time required to physically produce the garment.

The calculator can use simple or advanced labour logic.

Simple labour mode:

Total labour hours per garment x hourly rate = labour cost

Example:

A pant takes 2.5 hours to produce.
The labour rate is $45 per hour.

2.5 x $45 = $112.50 labour cost

Advanced labour mode:

This breaks labour into stages:

Cutting
Sewing
Pressing
Finishing
QC inspection
Packing

Example:

Cutting: 0.4 hours
Sewing: 1.8 hours
Pressing: 0.3 hours
Finishing: 0.2 hours
QC: 0.1 hours
Packing: 0.1 hours

Total labour: 2.9 hours
Hourly rate: $45

2.9 x $45 = $130.50 labour cost

Why this matters:

Labour is often underestimated. A garment may look simple but still take significant time to cut, sew, press, inspect, and pack.

For you, labour needs to be treated honestly. Otherwise the business falls back into atelier logic where time is absorbed instead of priced.`,
  },
  {
    title: "7. Section 5: Overheads",
    body: `Overheads are the costs of running the business or studio that are not tied to one specific garment, but still need to be paid.

Examples:

Electricity
Rent or studio allocation
Insurance
Internet
Phone
Equipment depreciation
Machine maintenance and repairs
Petrol / transport
Cleaning
Software subscriptions
Accounting / admin
Other overheads

The calculator spreads monthly overheads across monthly production capacity.

Formula:

Total monthly overheads / monthly production units = overhead cost per garment

Example:

Monthly overheads: $2,000
Monthly production capacity: 50 garments

$2,000 / 50 = $40 overhead per garment

Why this matters:

A garment does not only cost fabric, trims, and labour. The studio lights, machines, insurance, internet, and transport all support production.

If overheads are ignored, the retail price may look attractive but the business may still lose money.`,
  },
  {
    title: "8. Section 6: Selling Costs",
    body: `Selling costs are costs triggered by selling the garment to the customer.

Examples:

Payment gateway percentage
Ecommerce platform fee per unit
Returns reserve percentage
Defect / alteration reserve percentage
Shipping subsidy per unit
Customer packaging extras
Other selling cost

Some selling costs are fixed. Some are percentages of the retail price.

Example fixed cost:

Customer packaging extras: $6 per garment

Example percentage cost:

Payment gateway fee: 2.5% of retail price

Why percentage selling costs are different:

If the recommended retail price changes, percentage-based selling costs also change. The calculator solves these against the recommended retail price so the margin target remains accurate.

Plain English:

A higher retail price usually means higher card/payment fees. The calculator accounts for that rather than pretending the fee is fixed.

Why this matters:

Selling costs are easy to forget because they happen after the garment is made. But they still reduce margin.

Returns are especially important in fashion. Even a small returns reserve helps prevent the business from assuming every sale will be perfect.`,
  },
  {
    title: "9. Section 7: Pricing Output",
    body: `This is where the calculator brings everything together.

It shows:

Direct materials total
Development recovery per unit
Labour cost per unit
Overhead allocation per unit
Selling cost estimate
Total unit cost
Recommended DTC retail price
Gross profit per unit
Gross margin %
Wholesale price
Wholesale profit per unit
Wholesale viable?

The most important output is the recommended DTC retail price.`,
  },
  {
    title: "10. How recommended retail price is calculated",
    body: `The calculator does not simply add a random markup.

It uses the target gross margin.

Formula:

Recommended retail price = total unit cost / (1 - target margin)

Example:

Total unit cost: $180
Target gross margin: 70%

1 - 70% = 30%

$180 / 0.30 = $600

Recommended retail price: $600

Why divide by 0.30?

Because if your business wants to keep 70% margin, the unit cost must only represent 30% of the retail price.

In the example:

Retail price: $600
Unit cost: $180
Gross profit: $420
Gross margin: 70%

This is why retail price can feel high. The calculator is not only covering the garment. It is protecting the business model.`,
  },
  {
    title: "11. What gross profit means",
    body: `Gross profit is the money left after the unit cost is covered.

Formula:

Retail price - total unit cost = gross profit

Example:

Retail price: $600
Total unit cost: $180

$600 - $180 = $420 gross profit

Gross profit is not the same as final business profit. It still needs to support broader business activity, future product development, unsold stock risk, marketing, admin, and tax obligations.`,
  },
  {
    title: "12. What gross margin means",
    body: `Gross margin shows gross profit as a percentage of the retail price.

Formula:

Gross profit / retail price = gross margin

Example:

Gross profit: $420
Retail price: $600

$420 / $600 = 70%

Gross margin shows whether the garment has enough commercial room to support the business.

A garment can sell well and still be weak if the margin is too low.`,
  },
  {
    title: "13. What wholesale price means",
    body: `Wholesale price is the price a retailer or stockist would usually pay the business before selling the garment to the final customer.

A simple industry rule is:

Wholesale price ~= retail price / 2

Example:

Recommended retail price: $600
Wholesale estimate: $300

This means a boutique might buy the pant from the business for around $300 and sell it to the customer for around $600.

Why this matters:

Wholesale changes the economics completely.

Selling direct-to-consumer at $600 is very different from selling wholesale at $300.

The garment still costs the same to make, but the revenue received by the business is much lower.`,
  },
  {
    title: "14. What Not Wholesale Viable means",
    body: `"Not Wholesale Viable" means the garment does not leave enough profit when sold at the estimated wholesale price.

Example:

Recommended retail price: $600
Estimated wholesale price: $300
Total unit cost: $260

Wholesale profit:
$300 - $260 = $40

That may technically be positive, but it is very weak.

Worse example:

Recommended retail price: $600
Estimated wholesale price: $300
Total unit cost: $330

Wholesale profit:
$300 - $330 = -$30

The business loses $30 every time it sells that garment wholesale.

That is not wholesale viable.

Plain English:

The garment might work as a direct-to-consumer product, but not as a wholesale product.

This does not mean the garment is bad. It means wholesale is the wrong channel unless the cost is reduced, the retail price increases, or the wholesale terms change.`,
  },
  {
    title: "15. Why production quantity changes everything",
    body: `Quantity changes the result because some costs are spread across units.

Development cost example:

Development cost: $1,200

If producing 10 units:
$1,200 / 10 = $120 per garment

If producing 40 units:
$1,200 / 40 = $30 per garment

If producing 100 units:
$1,200 / 100 = $12 per garment

This is why small production runs often look expensive. The garment is carrying a bigger share of the development burden.

But producing too many units creates inventory risk.

The business needs to balance:

Lower cost per unit
against
Risk of unsold stock

The calculator helps show that trade-off.`,
  },
  {
    title: "16. Section 8: Competitor Comparison",
    body: `Competitor comparison is a market check, not a costing method.

It helps compare your proposed retail price against similar products from other brands or local designers.

The calculator can show:

Your proposed retail
Lowest competitor price
Highest competitor price
Average competitor price
Market position

Important:

Competitor prices do not tell you what the pant costs to make.

Competitors may have:

Cheaper offshore production
Higher production volume
Different fabric costs
Different rent structures
Different margin requirements
Different discount strategies
Different brand positioning

The competitor comparison should answer:

Does your proposed retail price sit in a believable market range?

It should not answer:

What should you blindly charge?`,
  },
  {
    title: "17. Common costing mistakes",
    body: `Avoid these mistakes:

1. Pricing from fabric and trims only.
2. Forgetting labour time.
3. Treating your time as free.
4. Ignoring overheads.
5. Forgetting development recovery.
6. Forgetting payment fees and selling costs.
7. Assuming wholesale will work automatically.
8. Copying competitor pricing without knowing their cost base.
9. Producing too many units to reduce cost, then getting stuck with stock.
10. Setting price emotionally instead of commercially.`,
  },
  {
    title: "18. How you should use the calculator",
    body: `Use the calculator to test commercial feasibility before committing to production.

For each garment, use it to answer:

What does this really cost per unit?
What retail price does it require?
Can the market support that price?
Can this work direct-to-consumer?
Can this work wholesale?
What production quantity makes sense?
Where is the cost problem?

The calculator should support decision-making, not create paralysis.

If the price comes out too high, the next question is not "is the calculator wrong?"

The next question is:

Which input is causing the problem?

Possible answers:

Fabric is too expensive.
Labour is too high.
Development cost is being spread over too few units.
Overheads are too heavy.
Wholesale is the wrong channel.
The retail target is too low.`,
  },
  {
    title: "Final principle",
    body: `The calculator exists to stop guessing.

It helps move from atelier instinct into product business discipline.

A beautiful garment still needs a working commercial structure.

If the numbers do not work, the business plan needs adjustment before production begins.

That is not failure.

That is exactly what the calculator is for.`,
  },
];

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
let currentHelpPage = 0;

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
  return profile.displayName || metadata.name || metadata.full_name || fullName || fromEmail || "User";
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
  if (!parts.length) return "U";
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
  return currentUser ? `gcc-legacy-migrated:${currentUser.id}` : "";
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
  const accentState = ACCENT_STATES[selectedAccent.toLowerCase()] || ACCENT_STATES[DEFAULT_ACCENT];
  document.documentElement.style.setProperty("--accent", selectedAccent);
  document.documentElement.style.setProperty("--accent-tint", accentState.tint);
  document.documentElement.style.setProperty("--accent-hover", accentState.hover);
  document.documentElement.style.setProperty("--accent-bright", accentState.bright);
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

function syncResponsivePlaceholders() {
  const signupBusinessName = $("#signupBusinessName");
  if (signupBusinessName) {
    signupBusinessName.placeholder = window.innerWidth <= 700 ? "Display name" : "Business name";
  }
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

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatHelpBody(body) {
  return body
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHTML(paragraph).replaceAll("\n", "<br />")}</p>`)
    .join("");
}

function renderHelpPage(index) {
  if (!HELP_PAGES.length) return;
  currentHelpPage = Math.max(0, Math.min(index, HELP_PAGES.length - 1));
  const page = HELP_PAGES[currentHelpPage];
  const article = $("#helpArticle");
  const prev = $("#helpPrevButton");
  const next = $("#helpNextButton");

  if (article) {
    article.innerHTML = `
      <h1 id="aboutTitle">${escapeHTML(page.title)}</h1>
      <div class="help-copy">${formatHelpBody(page.body)}</div>
    `;
    article.scrollTop = 0;
  }
  if (prev) prev.disabled = currentHelpPage === 0;
  if (next) next.disabled = currentHelpPage === HELP_PAGES.length - 1;
  $$(".help-nav-item").forEach((button) => {
    const isActive = Number(button.dataset.helpPage) === currentHelpPage;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function populateHelpViewer() {
  const nav = $("#helpNav");
  if (!nav) return;
  nav.innerHTML = HELP_PAGES.map(
    (page, index) => `<button type="button" class="help-nav-item" data-help-page="${index}">${escapeHTML(page.title)}</button>`
  ).join("");
  renderHelpPage(currentHelpPage);
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

  document.title = `${title} - Garment Cost Calculator`;

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

  setText("compProposedRetail", formatMoney(calculations.retailPrice));
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
  const safeName = (state.title || "garment-costing").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  link.href = url;
  link.download = `${safeName || "garment-costing"}.json`;
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
    `Garment costing summary`,
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
  document.title = "Garment Cost Calculator";
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
  $("#aboutButton")?.addEventListener("click", () => {
    renderHelpPage(currentHelpPage);
    openModal("aboutModal");
  });
  $("#helpNav")?.addEventListener("click", (event) => {
    const button = event.target.closest(".help-nav-item");
    if (!button) return;
    renderHelpPage(Number(button.dataset.helpPage));
  });
  $("#helpPrevButton")?.addEventListener("click", () => renderHelpPage(currentHelpPage - 1));
  $("#helpNextButton")?.addEventListener("click", () => renderHelpPage(currentHelpPage + 1));
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
      return;
    }
    if ($("#aboutModal")?.hidden) return;
    if (event.key === "ArrowLeft") {
      renderHelpPage(currentHelpPage - 1);
    } else if (event.key === "ArrowRight") {
      renderHelpPage(currentHelpPage + 1);
    }
  });

  window.addEventListener("resize", syncSavedCostingPicker);
  window.addEventListener("resize", syncResponsivePlaceholders);

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
populateHelpViewer();
bindEvents();
syncResponsivePlaceholders();
updateGreeting();
applyAccent(readAccent());
applyTheme(document.documentElement.dataset.theme);
initialiseAuth();
