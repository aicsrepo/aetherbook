const PALETTES = {
  classic: {
    page: "#f0f2f5",
    surface: "#ffffff",
    text: "#1c1e21",
    accent: "#0866ff",
    scheme: "light"
  },
  twitter: {
    page: "#ffffff",
    surface: "#ffffff",
    text: "#0f1419",
    accent: "#1d9bf0",
    scheme: "light"
  },
  futuristic: {
    page: "#121821",
    surface: "#1c2735",
    text: "#e4edf5",
    accent: "#66b8c5",
    scheme: "dark"
  },
  midnight: {
    page: "#18191a",
    surface: "#242526",
    text: "#e4e6eb",
    accent: "#2d88ff",
    scheme: "dark"
  },
  lavender: {
    page: "#f6f0ff",
    surface: "#ffffff",
    text: "#2c1f3a",
    accent: "#8b5cf6",
    scheme: "light"
  },
  forest: {
    page: "#eaf2eb",
    surface: "#ffffff",
    text: "#1c3025",
    accent: "#287d4a",
    scheme: "light"
  }
};

const COLOR_FIELDS = ["page", "surface", "text", "accent"];
const enabledInput = document.querySelector("#enabled");
const nebulaEnabledInput = document.querySelector("#nebula-enabled");
const nebulaColorInput = document.querySelector("#nebula-color");
const presetInput = document.querySelector("#preset");
const colorsSection = document.querySelector("#custom-colors");
const status = document.querySelector("#status");

function getPaletteFromInputs() {
  return Object.fromEntries(
    COLOR_FIELDS.map((field) => [field, document.querySelector(`#${field}`).value])
  );
}

function showPalette(palette) {
  for (const field of COLOR_FIELDS) {
    document.querySelector(`#${field}`).value = palette[field];
  }
}

function updateCustomFields() {
  colorsSection.hidden = !["custom", "twitter", "futuristic"].includes(presetInput.value);
}

async function saveSettings() {
  const palette =
    ["custom", "twitter", "futuristic"].includes(presetInput.value)
      ? {
          ...getPaletteFromInputs(),
          scheme: presetInput.value === "futuristic" ? "dark" : "light"
        }
      : PALETTES[presetInput.value];

  try {
    await chrome.storage.sync.set({
      enabled: enabledInput.checked,
      nebulaEnabled: nebulaEnabledInput.checked,
      nebulaColor: nebulaColorInput.value,
      preset: presetInput.value,
      palette
    });
    status.textContent = "Theme applied.";
  } catch (error) {
    status.textContent = "Could not save your theme settings.";
    console.error("Aetherbook could not save theme settings.", error);
  }
}

async function initialize() {
  try {
    const settings = await chrome.storage.sync.get({
      enabled: true,
      nebulaEnabled: false,
      nebulaColor: "#7c3aed",
      preset: "classic",
      palette: PALETTES.classic
    });
    enabledInput.checked = settings.enabled;
    nebulaEnabledInput.checked = settings.nebulaEnabled;
    nebulaColorInput.value = settings.nebulaColor;

    const presetName =
      ["twitter", "futuristic"].includes(settings.preset)
        ? settings.preset
        : PALETTES[settings.preset] &&
      COLOR_FIELDS.every(
        (field) => PALETTES[settings.preset][field] === settings.palette[field]
      )
        ? settings.preset
        : Object.entries(PALETTES).find(([, palette]) =>
            COLOR_FIELDS.every((field) => palette[field] === settings.palette[field])
          )?.[0];
    presetInput.value = presetName ?? "custom";
    showPalette(settings.palette);
    updateCustomFields();
  } catch (error) {
    status.textContent = "Could not load your theme settings.";
    console.error("Aetherbook could not load theme settings.", error);
  }
}

enabledInput.addEventListener("change", saveSettings);
nebulaEnabledInput.addEventListener("change", saveSettings);
nebulaColorInput.addEventListener("change", saveSettings);
presetInput.addEventListener("change", () => {
  updateCustomFields();
  if (presetInput.value !== "custom") {
    showPalette(PALETTES[presetInput.value]);
  }
  saveSettings();
});

for (const field of COLOR_FIELDS) {
  document.querySelector(`#${field}`).addEventListener("change", () => {
    if (!["twitter", "futuristic"].includes(presetInput.value)) {
      presetInput.value = "custom";
    }
    updateCustomFields();
    saveSettings();
  });
}

initialize();
