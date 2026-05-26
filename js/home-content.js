const STORAGE_KEY = "watchly.homeContent";

const dateImplicite = {
  trendingMovies: [
    { title: "Galactic Warriors", image: "../img/movie/8/poster.webp", movieId: "galactic-warriors", featured: true },
    { title: "Ne Zha", image: "../img/movie/1/poster.webp", movieId: "ne-zha", featured: false },
    { title: "Aquaman", image: "../img/movie/3/poster.webp", movieId: "aquaman", featured: false },
    { title: "When I Fly Towards You", image: "../img/movie/2/poster.webp", movieId: "when-i-fly-towards-you", featured: true },
    { title: "Cinderella", image: "../img/movie/4/poster.webp", movieId: "cinderella", featured: false },
    { title: "Born Sexy Yesterday", image: "../img/movie/5/poster.webp", movieId: "born-sexy-yesterday", featured: false },
    { title: "Kotovasiya", image: "../img/movie/6/poster.webp", movieId: "kotovasiya", featured: false },
    { title: "Arnie & Barney", image: "../img/movie/7/poster.webp", movieId: "arnie-and-barney", featured: false },
    { title: "Future Signal", image: "../img/movie/15/poster.webp", movieId: "future-signal", featured: true },
    { title: "Midnight Orbit", image: "../img/movie/14/poster.webp", movieId: "midnight-orbit", featured: false },
    { title: "Silent Moon", image: "../img/movie/13/poster.webp", movieId: "silent-moon", featured: false },
    { title: "Blue Horizon", image: "../img/movie/12/poster.webp", movieId: "blue-horizon", featured: false },
    { title: "Last Echo", image: "../img/movie/11/poster.webp", movieId: "last-echo", featured: false },
    { title: "Storm City", image: "../img/movie/8/poster.webp", movieId: "storm-city", featured: false },
    { title: "Golden Road", image: "../img/movie/5/poster.webp", movieId: "golden-road", featured: false },
  ],
  categories: [
    { title: "Action & Adventure", image: "../img/movie/1/poster.webp" },
    { title: "Sci-Fi & Fantasy", image: "../img/movie/2/poster.webp" },
    { title: "Animation", image: "../img/movie/3/poster.webp" },
    { title: "Drama", image: "../img/movie/4/poster.webp" },
    { title: "Comedy", image: "../img/movie/5/poster.webp" },
    { title: "Mystery", image: "../img/movie/6/poster.webp" },
    { title: "Family", image: "../img/movie/7/poster.webp" },
    { title: "Kids", image: "../img/movie/8/poster.webp" },
    { title: "Reality", image: "../img/movie/9/poster.webp" },
    { title: "War & Political", image: "../img/movie/10/poster.webp" },
    { title: "Romance", image: "../img/movie/1/poster.webp" },
    { title: "Crime", image: "../img/movie/2/poster.webp" },
    { title: "Thriller", image: "../img/movie/3/poster.webp" },
    { title: "Documentary", image: "../img/movie/4/poster.webp" },
    { title: "Horror", image: "../img/movie/5/poster.webp" },
  ],
  comingSoon: [
    { title: "Future Signal", image: "../img/movie/15/poster.webp", movieId: "future-signal", releaseDate: "2026-06-20", featured: true },
    { title: "Midnight Orbit", image: "../img/movie/14/poster.webp", movieId: "midnight-orbit", releaseDate: "2026-07-05", featured: false },
    { title: "Silent Moon", image: "../img/movie/13/poster.webp", movieId: "silent-moon", releaseDate: "2026-07-18", featured: false },
    { title: "Blue Horizon", image: "../img/movie/12/poster.webp", movieId: "blue-horizon", releaseDate: "2026-08-02", featured: false },
    { title: "Last Echo", image: "../img/movie/11/poster.webp", movieId: "last-echo", releaseDate: "2026-08-16", featured: false },
    { title: "Red Planet", image: "../img/movie/15/poster.webp", movieId: "", releaseDate: "2026-09-01", featured: false },
    { title: "Night Academy", image: "../img/movie/14/poster.webp", movieId: "", releaseDate: "2026-09-15", featured: false },
    { title: "Ocean Lights", image: "../img/movie/13/poster.webp", movieId: "", releaseDate: "2026-10-04", featured: true },
    { title: "Shadow Runner", image: "../img/movie/12/poster.webp", movieId: "", releaseDate: "2026-10-19", featured: false },
    { title: "Winter Code", image: "../img/movie/11/poster.webp", movieId: "", releaseDate: "2026-11-03", featured: false },
    { title: "Crystal Gate", image: "../img/movie/15/poster.webp", movieId: "", releaseDate: "2026-11-18", featured: false },
    { title: "Broken Stars", image: "../img/movie/14/poster.webp", movieId: "", releaseDate: "2026-12-01", featured: false },
    { title: "Silver River", image: "../img/movie/13/poster.webp", movieId: "", releaseDate: "2026-12-15", featured: false },
    { title: "Final Hour", image: "../img/movie/12/poster.webp", movieId: "", releaseDate: "2027-01-08", featured: false },
    { title: "New Dawn", image: "../img/movie/11/poster.webp", movieId: "", releaseDate: "2027-01-22", featured: true },
  ],
};

function salveazaInStorage(date) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(date));
}

function corecteazaImagineVeche(path) {
  if (!path) return path;
  return String(path)
    .replace(/\.\.\/img\/movies\/movie \((\d+)\)\.webp/g, "../img/movie/$1/poster.webp")
    .replace(/\.\.\/img\/categories\/comingSoon\/movie \((\d+)\)\.webp/g, function (_, index) {
      return "../img/movie/" + (Number(index) + 10) + "/poster.webp";
    })
    .replace(/\.\.\/img\/categories\/geners\/image \((\d+)\)\.webp/g, function (_, index) {
      return "../img/movie/" + (((Number(index) - 1) % 10) + 1) + "/poster.webp";
    });
}

function corecteazaDateVechi(date) {
  let sectiuni = ["trendingMovies", "categories", "comingSoon"];
  for (let i = 0; i < sectiuni.length; i++) {
    let sectiune = sectiuni[i];
    if (!Array.isArray(date[sectiune])) continue;
    for (let j = 0; j < date[sectiune].length; j++) {
      date[sectiune][j].image = corecteazaImagineVeche(date[sectiune][j].image);
    }
  }
  return date;
}

async function obtineDatele() {
  let dateLocale = localStorage.getItem(STORAGE_KEY);
  
  if (dateLocale) {
    let dateCorectate = corecteazaDateVechi(JSON.parse(dateLocale));
    salveazaInStorage(dateCorectate);
    return dateCorectate;
  }

  salveazaInStorage(dateImplicite);
  return dateImplicite;
}

async function afiseazaSectiuneTrending(date) {
  let container = document.getElementById("homeTrendingMovies");
  if (!container) return;

  let codHtml = "";
  for (let i = 0; i < date.trendingMovies.length; i++) {
    let film = date.trendingMovies[i];
    let url = film.movieId ? "../html/movie-detail.html?id=" + film.movieId : "../html/movie.html";
    let badge = film.featured ? '<div class="movie-badge"><img src="../img/icon/Interface/star.svg"></div>' : "";

    codHtml += '<a class="movie-card" href="' + url + '">' +
                 '<div class="movie-image">' +
                   '<img src="' + film.image + '">' + badge +
                 '</div>' +
                 '<h3>' + film.title + '</h3>' +
               '</a>';
  }
  container.innerHTML = codHtml;
}

async function afiseazaSectiuneCategorii(date) {
  let container = document.getElementById("homeTrendingCategories");
  if (!container) return;

  let codHtml = "";
  for (let i = 0; i < date.categories.length; i++) {
    let cat = date.categories[i];
    let clasaImagine = (i === 0) ? "category-image" : "category-generic-image";

    codHtml += '<div class="mov-card mov-' + (i + 1) + '">' +
                 '<img class="' + clasaImagine + '" src="' + cat.image + '">' +
                 '<b class="section-label">' + cat.title + '</b>' +
               '</div>';
  }
  container.innerHTML = codHtml;
}

async function afiseazaSectiuneComingSoon(date) {
  let container = document.getElementById("homeComingSoon");
  if (!container) return;

  let codHtml = "";
  for (let i = 0; i < date.comingSoon.length; i++) {
    let film = date.comingSoon[i];
    let clasaItem = (i === 0) ? "timeline-item active" : "timeline-item";
    let coroana = film.featured ? '<img class="crown-icon" src="../img/icon/Interface/star.svg">' : "";

    codHtml += '<div class="timeline-column">' +
                 '<div class="' + clasaItem + '"><div class="dot"></div></div>' +
                 '<div class="timeline-date">' + film.releaseDate + '</div>' +
                 '<div class="coming-card">' +
                   '<div class="coming-image-wrapper">' +
                     '<img class="coming-image" src="' + film.image + '">' + coroana +
                   '</div>' +
                   '<button class="btn-reserve" type="button">' +
                     '<img class="alarm-clock-icon" src="../img/icon/Interface/clock.svg">' +
                     '<b class="section-label">Reserve</b>' +
                   '</button>' +
                 '</div>' +
               '</div>';
  }
  container.innerHTML = codHtml;
}

async function pornesteHome() {
  let date = await obtineDatele();
  afiseazaSectiuneTrending(date);
  afiseazaSectiuneCategorii(date);
  afiseazaSectiuneComingSoon(date);
}

window.WatchlyHomeContent = {
  read: obtineDatele,
  save: salveazaInStorage,
  defaults: dateImplicite
};

document.addEventListener("DOMContentLoaded", pornesteHome);
