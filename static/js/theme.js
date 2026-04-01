function updateTheme() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const hasTheme = urlParams.get("theme") == "light";
  if (hasTheme) {
    const root = document.documentElement;
    root.style.setProperty("--theme-bg", "white");
  }
}

updateTheme();