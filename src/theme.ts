export type ThemeChoice = "auto" | "light" | "dark";

const KEY = "fp_theme";

export function loadTheme(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "auto" || v === "dark" ? v : "light";
  } catch {
    return "light";
  }
}

/** Thème clair par défaut (charte) ; « auto » suit le réglage du système, « sombre » est un choix explicite. */
export function applyTheme(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    /* stockage indisponible : le choix vaut pour la session */
  }
}
