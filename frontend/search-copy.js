(function () {
  function normalizeSearchCopy() {
    var homeInput = document.querySelector(".intro .search-field input");
    var reviewInput = document.querySelector(".review-add-page .search-field input");
    var watchlistInput = document.querySelector(".watchlist-add-search .search-field input");
    var friendsInput = document.querySelector(".friends-find.add-page-search .search-field input");
    if (homeInput) homeInput.placeholder = "Search films and shows";
    if (reviewInput) reviewInput.placeholder = "Search films and shows";
    if (watchlistInput) watchlistInput.placeholder = "Search films and shows";
    if (friendsInput) friendsInput.placeholder = "Search by username";

    document.querySelectorAll(
      ".search-field input, .watchlist-search input, .friends-feed-search input, .friends-filters input",
    ).forEach(function (input) {
      var placeholder = input.getAttribute("placeholder");
      if (placeholder) input.setAttribute("placeholder", placeholder.trim().replace(/[.!?]+$/, ""));
    });
  }

  new MutationObserver(normalizeSearchCopy).observe(document.documentElement, { childList: true, subtree: true });
  normalizeSearchCopy();
})();
