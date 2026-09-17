(function () {
  var movies = null;

  function addYears() {
    var cards = document.querySelectorAll(".watchlist-grid .watchlist-card");
    if (!cards.length || !movies) return;
    cards.forEach(function (card) {
      if (card.querySelector(".watchlist-year")) return;
      var title = card.querySelector("h3")?.textContent.trim().toLowerCase();
      var movie = movies.find(function (item) { return String(item.title || "").toLowerCase() === title; });
      if (!movie?.year) return;
      var year = document.createElement("p");
      year.className = "meta watchlist-year";
      year.textContent = movie.year;
      card.querySelector(".card-body")?.append(year);
    });
  }

  fetch("/graphql", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "query WatchlistYears { watchlist(limit: 100) { movie { title year } } }" }),
  })
    .then(function (response) { return response.ok ? response.json() : null; })
    .then(function (payload) {
      movies = (payload?.data?.watchlist || []).map(function (item) { return item.movie; });
      addYears();
    })
    .catch(function () {});

  new MutationObserver(addYears).observe(document.documentElement, { childList: true, subtree: true });
})();
