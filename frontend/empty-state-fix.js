(function () {
  function cleanEmptyStates() {
    document.querySelectorAll(".search-results-scroll, .watchlist-search-results, .friends-find-results").forEach(function (container) {
      var empty = container.querySelector(".search-empty, .watchlist-search-state, .friends-find-state");
      if (!empty) return;
      var message = empty.textContent.toLowerCase();
      if (message.includes("no title") || message.includes("no people") || message.includes("no users")) {
        container.querySelectorAll(".search-more").forEach(function (more) { more.remove(); });
      }
    });
  }

  new MutationObserver(cleanEmptyStates).observe(document.documentElement, { childList: true, subtree: true });
  cleanEmptyStates();
})();
