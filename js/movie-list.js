(async function () {
  let grid = document.getElementById("moviesGrid");
  let countText = document.getElementById("moviesFound");
  let paginationBox = document.getElementById("moviesPagination");
  let allSearchInputs = document.querySelectorAll(".nav-search-input");

  if (!grid || !window.WatchlyStore) return;

  let PAGE_SIZE = 8;
  let allMovies = await window.WatchlyStore.loadMovies();
  
  let movies = [];
  for (let i = 0; i < allMovies.length; i++) {
    if (allMovies[i].status !== "draft") {
      movies.push(allMovies[i]);
    }
  }

  let params = new URLSearchParams(window.location.search);
  let activeQuery = params.get("q") || "";
  let activeGenre = "";
  let activeYear = "";
  let activeRating = 0;
  let currentPage = 1;

  let resultBox = document.createElement("section");
  resultBox.className = "search-result-box";
  let titleArea = grid.parentElement;
  if (titleArea) {
    titleArea.insertBefore(resultBox, grid);
  }

  for (let i = 0; i < allSearchInputs.length; i++) {
    allSearchInputs[i].value = activeQuery;
  }

  function initMobileDropdowns() {
    let triggers = document.querySelectorAll(".dropdown-trigger");
    let clearBtn = document.querySelector(".clear-all");

    for (let i = 0; i < triggers.length; i++) {
      triggers[i].onclick = function (e) {
        e.stopPropagation();
        let menu = this.nextElementSibling;
        let isOpen = this.getAttribute("aria-expanded") === "true";

        for (let j = 0; j < triggers.length; j++) {
          if (triggers[j] !== this) {
            triggers[j].setAttribute("aria-expanded", "false");
            if (triggers[j].nextElementSibling) {
              triggers[j].nextElementSibling.classList.remove("open");
            }
          }
        }

        if (isOpen) {
          this.setAttribute("aria-expanded", "false");
          menu.classList.remove("open");
        } else {
          this.setAttribute("aria-expanded", "true");
          menu.classList.add("open");
        }
      };
    }

    document.onclick = function (e) {
      if (!e.target.closest(".dropdown-filter")) {
        for (let i = 0; i < triggers.length; i++) {
          triggers[i].setAttribute("aria-expanded", "false");
          if (triggers[i].nextElementSibling) {
            triggers[i].nextElementSibling.classList.remove("open");
          }
        }
      }
    };

    let mobileItems = document.querySelectorAll("[data-filter-item]");
    for (let i = 0; i < mobileItems.length; i++) {
      mobileItems[i].onclick = function (e) {
        e.stopPropagation();
        let type = this.getAttribute("data-filter-item");
        let val = this.querySelector(".favorite").textContent.trim();

        if (type === "genres") {
          if (activeGenre === val) activeGenre = ""; else activeGenre = val;
        }
        if (type === "year") {
          if (activeYear === val) activeYear = ""; else activeYear = val;
        }
        if (type === "rating") {
          let num = Number(val.slice(0, 1));
          if (activeRating === num) activeRating = 0; else activeRating = num;
        }

        updateUI();
        currentPage = 1;
        render();
      };
    }
  }

  function createMovieCard(movie) {
    let price = Number(movie.rentPrice || 0).toFixed(2);
    return '<a class="mov-1 movie-list-card" href="../html/movie-detail.html?id=' + encodeURIComponent(movie.id) + '">' +
      '<img class="image-9-icon" src="' + movie.poster + '">' +
      '<div class="rate"><div class="about-us">$' + price + '</div></div>' +
      '<div class="rate2">' +
        '<img class="event-icon" src="../img/icon/Interface/star.svg">' +
        '<div class="about-us">' + movie.imdb + '</div>' +
      '</div>' +
      '<div class="year-price">' +
        '<div class="year5">' +
          '<img class="event-icon" src="../img/icon/Calendar/calendar.svg">' +
          '<div class="favorite">' + movie.year + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="movie-list-card__title">' + movie.title + '</div>' +
    '</a>';
  }

  function render() {
    let query = activeQuery.toLowerCase().trim();
    let visibleMovies = [];

    for (let i = 0; i < movies.length; i++) {
      let m = movies[i];
      let info = (m.title + " " + m.genre + " " + m.category + " " + m.year).toLowerCase();
      
      let matchSearch = !query || info.indexOf(query) !== -1;
      let matchGenre = !activeGenre || info.indexOf(activeGenre.toLowerCase()) !== -1;
      let matchYear = !activeYear || m.year === activeYear;
      let matchRating = !activeRating || Number(m.imdb || 0) >= activeRating;

      if (matchSearch && matchGenre && matchYear && matchRating) {
        visibleMovies.push(m);
      }
    }

    let totalPages = Math.ceil(visibleMovies.length / PAGE_SIZE);
    if (totalPages < 1) totalPages = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    let start = (currentPage - 1) * PAGE_SIZE;
    let end = start + PAGE_SIZE;
    let pageMovies = visibleMovies.slice(start, end);

    renderHeader(visibleMovies.length);

    let html = "";
    for (let i = 0; i < pageMovies.length; i++) {
      html += createMovieCard(pageMovies[i]);
    }
    grid.innerHTML = html;

    if (countText) {
      countText.textContent = visibleMovies.length + " movies found · page " + currentPage + " of " + totalPages;
    }

    renderPagination(totalPages, visibleMovies.length);
  }

  function renderHeader(total) {
    let title = activeQuery ? "Search Result" : "All Movies";
    let subTitle = activeQuery ? 'Results for "' + activeQuery + '"' : "Find your next movie";
    
    let filterLabels = [];
    if (activeGenre) filterLabels.push(activeGenre);
    if (activeYear) filterLabels.push(activeYear);
    if (activeRating) filterLabels.push(activeRating + "+ rating");

    let filterText = "";
    if (filterLabels.length > 0) {
      filterText = " - " + filterLabels.join(", ");
    }

    resultBox.innerHTML = 
      '<div>' +
        '<span class="search-result-label">' + title + '</span>' +
        '<h1>' + subTitle + '</h1>' +
        '<p>' + total + ' movies found' + filterText + '</p>' +
      '</div>' +
      '<form class="search-result-form">' +
        '<img src="../img/icon/Interface/loop.svg">' +
        '<input type="search" value="' + activeQuery + '" placeholder="Search movies">' +
        '<button type="submit">Search</button>' +
      '</form>';

    let form = resultBox.querySelector(".search-result-form");
    form.onsubmit = function (e) {
      e.preventDefault();
      activeQuery = this.querySelector("input").value;
      for (let i = 0; i < allSearchInputs.length; i++) {
        allSearchInputs[i].value = activeQuery;
      }
      currentPage = 1;
      render();
    };
  }

  function renderPagination(totalPages, totalItems) {
    if (!paginationBox) return;
    if (totalItems <= PAGE_SIZE) {
      paginationBox.innerHTML = "";
      return;
    }

    let pageHtml = "";
    let lastP = 0;

    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
        if (p - lastP > 1) {
          pageHtml += '<span class="page-ellipsis">...</span>';
        }
        let activeClass = (p === currentPage) ? "active" : "";
        pageHtml += '<button class="page-btn ' + activeClass + '" data-page="' + p + '">' + p + '</button>';
        lastP = p;
      }
    }

    let prevDisabled = (currentPage === 1) ? "disabled" : "";
    let nextDisabled = (currentPage === totalPages) ? "disabled" : "";

    paginationBox.innerHTML = 
      '<button class="page-arrow" data-page="' + (currentPage - 1) + '" ' + prevDisabled + '>' +
        '<img src="../img/icon/Arrow/Chevron_Left.svg">' +
      '</button>' +
      '<div class="nr">' + pageHtml + '</div>' +
      '<button class="page-arrow" data-page="' + (currentPage + 1) + '" ' + nextDisabled + '>' +
        '<img src="../img/icon/Arrow/Chevron_Right.svg">' +
      '</button>';

    let btns = paginationBox.querySelectorAll("[data-page]");
    for (let i = 0; i < btns.length; i++) {
      btns[i].onclick = function () {
        if (this.hasAttribute("disabled")) return;
        currentPage = Number(this.getAttribute("data-page"));
        render();
        grid.scrollIntoView({ behavior: "smooth" });
      };
    }
  }

  for (let i = 0; i < allSearchInputs.length; i++) {
    allSearchInputs[i].oninput = function () {
      activeQuery = this.value;
      currentPage = 1;
      render();
    };
  }

  let desktopFilters = document.querySelectorAll(".geners3");
  for (let i = 0; i < desktopFilters.length; i++) {
    desktopFilters[i].onclick = function () {
      let group = this.closest(".geners, .geners14").querySelector(".title b").textContent.trim();
      let val = this.querySelector(".favorite").textContent.trim();

      if (group === "Geners") {
        if (activeGenre === val) activeGenre = ""; else activeGenre = val;
      }
      if (group === "Year") {
        if (activeYear === val) activeYear = ""; else activeYear = val;
      }
      if (group === "Rating") {
        let num = Number(val.slice(0, 1));
        if (activeRating === num) activeRating = 0; else activeRating = num;
      }

      updateUI();
      currentPage = 1;
      render();
    };
  }

  let clearAllBtn = document.querySelector(".clear-all");
  if (clearAllBtn) {
    clearAllBtn.onclick = function () {
      activeQuery = "";
      activeGenre = "";
      activeYear = "";
      activeRating = 0;
      for (let i = 0; i < allSearchInputs.length; i++) {
        allSearchInputs[i].value = "";
      }
      updateUI();
      currentPage = 1;
      render();
    };
  }

  function updateUI() {
    let items = document.querySelectorAll(".geners3, [data-filter-item]");
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let val = item.querySelector(".favorite").textContent.trim();
      let isSel = false;

      if (val === activeGenre || val === activeYear || Number(val.slice(0, 1)) === activeRating) {
        isSel = true;
      }
      if (isSel) item.classList.add("is-selected"); else item.classList.remove("is-selected");
    }
  }

  initMobileDropdowns();
  render();
})();