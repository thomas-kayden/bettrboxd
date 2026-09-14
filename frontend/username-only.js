(function () {
  function simplifyIdentity() {
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
      username.addEventListener("input", sync);
      username.addEventListener("change", sync);
    }
    sync();

    function sync() {
      var value = username.value.replace(/^@/, "");
      var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setter?.call(displayName, value);
      displayName.dispatchEvent(new Event("input", { bubbles: true }));
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
  window.setInterval(function () {
    simplifyIdentity();
    simplifyHomeHeading();
  }, 500);
})();
