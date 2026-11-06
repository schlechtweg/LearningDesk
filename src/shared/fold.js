// Collapsible subjects on grade pages: remembers open subjects per page, opens the one in the URL hash.
(function () {
  const folds = Array.from(document.querySelectorAll("details.fold"));
  if (!folds.length) return;
  const key = "ld.fold." + location.pathname.split("/").pop();
  const save = () => { try { localStorage.setItem(key, JSON.stringify(folds.filter((d) => d.open).map((d) => d.id))); } catch (e) { /* storage unavailable */ } };
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { saved = null; }
  if (Array.isArray(saved)) folds.forEach((d) => { d.open = saved.includes(d.id); });
  const fromHash = () => { const d = location.hash && document.getElementById(location.hash.slice(1)); if (d && d.tagName === "DETAILS") { d.open = true; d.scrollIntoView({ block: "start" }); save(); } };
  fromHash();
  window.addEventListener("hashchange", fromHash);
  folds.forEach((d) => d.addEventListener("toggle", save));
  const all = (open) => { document.querySelectorAll("details.fold, details.chapfold").forEach((d) => { d.open = open; }); save(); };
  const o = document.getElementById("openAll"), c = document.getElementById("closeAll");
  if (o) o.addEventListener("click", () => all(true));
  if (c) c.addEventListener("click", () => all(false));
})();
