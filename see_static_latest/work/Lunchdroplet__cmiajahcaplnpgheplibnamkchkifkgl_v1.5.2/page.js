document.addEventListener("lunchdroplet:log", (e) => {
  const { restaurants, text } = e.detail || {};
  if (restaurants) {
    const lines = Object.values(restaurants).map(r =>
      `  ${r.name} — ${r.available ? `${r.numSlots} slots available` : "SOLD OUT"}`
    );
    console.log("[lunchdroplet] Current restaurants:\n" + lines.join("\n"));
  } else if (text) {
    console.log("[lunchdroplet]", text);
  }
});

window.lunchdropletResume = function () {
  document.dispatchEvent(new CustomEvent("lunchdroplet:resume"));
  console.log("[lunchdroplet] Resume requested");
};

window.lunchdropletSync = function () {
  document.dispatchEvent(new CustomEvent("lunchdroplet:sync"));
  console.log("[lunchdroplet] Sync requested");
};
