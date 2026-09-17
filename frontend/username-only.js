(function () {
  var syncing = false;

  function simplifyIdentity() {
    document.querySelectorAll(".username-only-hidden").forEach(function (field) {
      if (!field.querySelector('input[name="displayName"]')) field.classList.remove("username-only-hidden");
    });
    var displayName = document.querySelector('input[name="displayName"]');
    var username = document.querySelector('input[name="username"]');
    if (!displayName || !username) return;

    var field = displayName.closest("[data-slot=input-group]");
    if (!field) {
      var parent = displayName.parentElement;
      for (var depth = 0; parent && depth < 5; depth += 1, parent = parent.parentElement) {
        var label = parent.querySelector("label");
        if (label?.textContent.trim().toLowerCase().includes("display name")) {
          field = parent;
          break;
        }
      }
    }
    field?.classList.add("username-only-hidden");

    if (!username.dataset.identitySyncBound) {
      username.dataset.identitySyncBound = "true";
      username.addEventListener("input", function () { window.setTimeout(sync, 0); });
      username.addEventListener("change", function () { window.setTimeout(sync, 0); });
    }
    if (document.activeElement !== username) sync();

    function sync() {
      if (syncing) return;
      var value = username.value.replace(/^@/, "");
      if (displayName.value === value) return;
      var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      syncing = true;
      setter?.call(displayName, value);
      displayName.dispatchEvent(new Event("input", { bubbles: true }));
      window.queueMicrotask(function () { syncing = false; });
    }
  }

  function simplifyHomeHeading() {
    var heading = document.querySelector(".intro h1");
    var match = heading?.textContent.match(/^What did you watch, (.+)\?$/);
    if (heading && match && [...match[1]].length > 15) heading.textContent = "What did you watch?";
  }

  var observer = new MutationObserver(simplifyIdentity);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  simplifyIdentity();
  simplifyHomeHeading();
})();
