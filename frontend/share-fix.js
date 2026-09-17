(function () {
  var reviewIndex = [];
  function loadReviewIndex() {
    fetch("/graphql", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: "query ShareReviews { reviews { id text rating user { username displayName } movie { title year poster } } friendActivity(limit: 200) { id text rating user { username displayName } movie { title year poster } } }",
      }),
    })
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (payload) {
        if (payload?.data) {
          reviewIndex = (payload.data.reviews || []).concat(payload.data.friendActivity || []);
          reviewIndex.slice(0, 20).forEach(function (item) {
            var poster = item.movie?.poster;
            if (!poster) return;
            fetch("/share-poster?url=" + encodeURIComponent(poster))
              .then(function (response) { return response.ok ? response.blob() : null; })
              .then(function (blob) {
                if (blob) item.posterFile = new File([blob], "bettrboxd-poster.jpg", { type: blob.type || "image/jpeg" });
              })
              .catch(function () {});
          });
        }
      })
      .catch(function () {});
  }

  loadReviewIndex();
  window.setInterval(function () {
    if (!reviewIndex.length) loadReviewIndex();
  }, 2000);

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/^@/, "").replace(/\s+/g, " ").trim();
  }

  function findReviewId(title, review, username) {
    var cleanTitle = normalize(title).replace(/\s+(?:18|19|20)\d{2}$/, "");
    var cleanReview = normalize(review);
    var cleanUsername = normalize(username);
    var candidates = reviewIndex.filter(function (item) {
      var itemTitle = normalize(item.movie?.title);
      var itemUsername = normalize(item.user?.username || item.user?.displayName);
      var itemDisplayName = normalize(item.user?.displayName);
      return itemTitle === cleanTitle &&
        (!cleanUsername || itemUsername === cleanUsername || itemDisplayName === cleanUsername || cleanUsername === "my");
    });
    var match = candidates.find(function (item) {
      var itemText = normalize(item.text);
      return !cleanReview || itemText.includes(cleanReview.slice(0, 80)) || cleanReview.includes(itemText.slice(0, 80));
    }) || candidates[0];
    return match || { id: new URLSearchParams(window.location.search).get("review") || "" };
  }

  function shareReview(button, title, username, rating, review) {
    title = title.replace(/\s+(?:18|19|20)\d{2}\s*$/, "").trim();
    var matchedReview = findReviewId(title, review, username);
    if (matchedReview.user) {
      username = username === "@kayden" || username === "My"
        ? "@" + matchedReview.user.username
        : matchedReview.user.displayName || matchedReview.user.username;
      review = matchedReview.text || review;
    }
    var reviewId = matchedReview.id;
    var url = reviewId ? "https://bettrboxd.com/?review=" + encodeURIComponent(reviewId) : "https://bettrboxd.com";
    var numericRating = Number.parseFloat(rating);
    var safeRating = Number.isFinite(numericRating) ? Math.max(0, Math.min(5, numericRating)) : 0;
    var fullStars = Math.floor(safeRating);
    var halfStar = safeRating - fullStars >= 0.5 ? "½" : "";
    var stars = "★".repeat(fullStars) + halfStar + "☆".repeat(5 - fullStars - (halfStar ? 1 : 0));
    var text = username + "'s review of " + title + "\n" + stars + "\n\n" + review + "\n\n" + url;

    if (!navigator.share) {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text);
      else window.prompt("Copy this message:", text);
      return;
    }

    var anchor = document.createElement("button");
    anchor.type = "button";
    anchor.setAttribute("aria-hidden", "true");
    anchor.style.cssText = "position:fixed;left:50%;top:58%;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.append(anchor);
    anchor.focus({ preventScroll: true });
    var shareData = { text: text };
    navigator.share(shareData).catch(function (error) {
      if (error?.name !== "AbortError") console.error("Failed to share review:", error);
    }).finally(function () { anchor.remove(); });
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest?.(
      ".review-dialog .dialog-actions .animated-share-main, .kumo-review-card .animated-share-main, .quick-review-toolbar .animated-share-main",
    );
    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    var dialog = button.closest(".review-dialog");
    var card = button.closest(".kumo-review-card");
    var composer = button.closest(".quick-review-toolbar");
    var scope = dialog || card || composer?.closest(".review-box") || document;
    var title = dialog?.querySelector(".dialog-heading h2")?.textContent?.trim()
      || card?.querySelector(".card-body h3")?.textContent?.trim()
      || composer?.closest(".review-box")?.querySelector("h2")?.textContent?.trim()
      || "Bettrboxd review";
    var username = dialog?.querySelector(".spoiler-author-header strong")?.textContent?.trim()
      || card?.querySelector(".review-card-author > span:last-child")?.textContent?.trim()
      || "@kayden";
    var rating = Array.from(scope.querySelectorAll(".stars"))
      .map(function (stars) { return stars.getAttribute("aria-label") || ""; })
      .map(function (label) { return label.match(/([\d.]+) out of 5/)?.[1]; })
      .find(Boolean) || "Unrated";
    var review = dialog?.querySelector(".spoiler-review-preview .dialog-review-text")?.textContent?.trim()
      || dialog?.querySelector(".dialog-review-text")?.textContent?.trim()
      || card?.querySelector(".review-hover-text")?.textContent?.trim()
      || composer?.closest(".review-box")?.querySelector("textarea")?.value?.trim()
      || "";

    shareReview(button, title, username, rating, review);
  }, true);

})();
