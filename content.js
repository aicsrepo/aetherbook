const DEFAULT_SETTINGS = {
  enabled: true,
  nebulaEnabled: false,
  nebulaColor: "#7c3aed",
  preset: "classic",
  palette: {
    page: "#f0f2f5",
    surface: "#ffffff",
    text: "#1c1e21",
    accent: "#0866ff",
    scheme: "light"
  }
};
const COLOR_FIELDS = ["page", "surface", "text", "accent"];
const HEX_COLOR = /^#[\da-f]{6}$/i;

function normalizeSettings(settings) {
  const palette = settings.palette ?? DEFAULT_SETTINGS.palette;
  const normalizedPalette = {};

  for (const field of COLOR_FIELDS) {
    normalizedPalette[field] = HEX_COLOR.test(palette[field])
      ? palette[field]
      : DEFAULT_SETTINGS.palette[field];
  }

  normalizedPalette.scheme = palette.scheme === "dark" ? "dark" : "light";
  return {
    enabled: settings.enabled !== false,
    nebulaEnabled: settings.nebulaEnabled === true,
    nebulaColor: HEX_COLOR.test(settings.nebulaColor)
      ? settings.nebulaColor
      : DEFAULT_SETTINGS.nebulaColor,
    preset: settings.preset === "twitter" ? "twitter" : "classic",
    palette: normalizedPalette
  };
}

function applySettings(settings) {
  const normalized = normalizeSettings(settings);
  const root = document.documentElement;

  if (!normalized.enabled) {
    root.classList.remove("aetherbook-theme");
    root.classList.remove("aetherbook-twitter");
    root.classList.remove("aetherbook-nebula");
    root.classList.remove("aetherbook-dark");
    return;
  }

  for (const [field, value] of Object.entries(normalized.palette)) {
    root.style.setProperty(`--aether-${field}`, value);
  }
  root.style.setProperty("--aether-nebula", normalized.nebulaColor);
  root.classList.add("aetherbook-theme");
  root.classList.toggle("aetherbook-twitter", normalized.preset === "twitter");
  root.classList.toggle("aetherbook-nebula", normalized.nebulaEnabled);
  root.classList.toggle("aetherbook-dark", normalized.palette.scheme === "dark");
}

chrome.storage.sync.get(DEFAULT_SETTINGS, applySettings);
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (
    areaName !== "sync" ||
    (!changes.enabled &&
      !changes.nebulaEnabled &&
      !changes.nebulaColor &&
      !changes.palette &&
      !changes.preset)
  ) {
    return;
  }

  chrome.storage.sync.get(DEFAULT_SETTINGS, applySettings);
});
