(function () {
  function alignSeeAll() {
    var columns = window.innerWidth <= 1100 ? 2 : 4;
    document.querySelectorAll(".recent .cards").forEach(function (cards) {
      var reviews = Array.from(cards.querySelectorAll(".kumo-review-card:not([data-home-review-id])"));
      var seeAll = cards.querySelector(".see-all-reviews");
      if (!seeAll || !reviews.length) return;
      seeAll.style.gridColumn = "1 / span " + Math.min(columns, reviews.length);
    });
  }

  new MutationObserver(alignSeeAll).observe(document.documentElement, { childList: true, subtree: true });
  alignSeeAll();
  window.addEventListener("resize", alignSeeAll);
})();
