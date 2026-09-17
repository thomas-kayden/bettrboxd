(function () {
  var desiredOrder = ["reviews", "followers", "following"];

  function reorderFriendsTabs() {
    var container = document.querySelector(".friends-tabs");
    var buttons = Array.from((container || document).querySelectorAll("button")).filter(function (button) {
      return ["reviews", "followers", "following"].indexOf(button.textContent.trim().toLowerCase()) !== -1;
    });
    if (buttons.length !== desiredOrder.length) return;
    buttons.forEach(function (button) {
      button.style.order = String(desiredOrder.indexOf(button.textContent.trim().toLowerCase()) + 1);
    });
    var parent = buttons[0].parentElement;
    if (!parent || buttons.some(function (button) { return button.parentElement !== parent; })) return;

    if (container && !container.dataset.reviewsDefaulted) {
      var reviewsButton = buttons.find(function (button) {
        return button.textContent.trim().toLowerCase() === "reviews";
      });
      container.dataset.reviewsDefaulted = "true";
      reviewsButton?.click();
    }

    var currentOrder = buttons.map(function (button) {
      return button.textContent.trim().toLowerCase();
    });
    if (currentOrder.join("|") === desiredOrder.join("|")) return;

    buttons
      .sort(function (a, b) {
        var aLabel = a.textContent.trim().toLowerCase();
        var bLabel = b.textContent.trim().toLowerCase();
        return desiredOrder.indexOf(aLabel) - desiredOrder.indexOf(bLabel);
      })
      .forEach(function (button) {
        parent.appendChild(button);
      });
  }

  function simplifyFriendSearch() {
    var input = document.querySelector(".friends-find.add-page-search input");
    if (!input) return;
    input.placeholder = "Search by username";
    input.setAttribute("aria-label", "Search by username");
  }

  function normalizeFriendUsernames() {
    document.querySelectorAll(".friends-person-card b, .friends-find-row b").forEach(function (name) {
      if (!name.textContent.trim().startsWith("@")) name.textContent = "@" + name.textContent.trim();
    });
  }

  var observer = new MutationObserver(function () {
    reorderFriendsTabs();
    simplifyFriendSearch();
    normalizeFriendUsernames();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  reorderFriendsTabs();
  simplifyFriendSearch();
  normalizeFriendUsernames();
  window.setInterval(reorderFriendsTabs, 250);
})();
