// --- CHEI STORAGE ---
const KEY_MOVIES = "watchly_movies";
const KEY_USERS = "watchly.users";
const KEY_HOME = "watchly.homeContent";
const MOVIES_JSON_URL = "../data/movies.json";

// --- DATE DEFAULT ---
let DEFAULT_MOVIES = [];

// --- VARIABILE GLOBALE ---
let toateFilmele = [];
let cautareFilmText = "";
let cautareUserText = "";

// --- UTILITARE ---
function citesteDate(cheie, rezerva) {
  const date = localStorage.getItem(cheie);
  if (date) return normalizeazaDateStocate(cheie, JSON.parse(date));
  return rezerva;
}

function corecteazaImagineVeche(path) {
  if (!path) return path;
  return String(path)
    .replace(/\.\.\/img\/movies\/movie \((\d+)\)\.webp/g, "../img/movie/$1/poster.webp")
    .replace(/\.\.\/img\/hero\/pack ([1-4])\//g, "../img/hero-calltoview/$1/")
    .replace(/\.\.\/movie-det\/1\/thumbs\/thumb\.webp/g, "../img/movie/1/poster.webp")
    .replace(/\.\.\/movie-det\/1\/trailer\/trailer \(1\)\.webp/g, "../img/movie/1/background.webp")
    .replace(/\.\.\/movie-det\/1\/trailer\/trailer \(2\)\.webp/g, "../img/movie/2/background.webp");
}

function normalizeazaDateStocate(cheie, date) {
  if (cheie === KEY_MOVIES && Array.isArray(date)) {
    date.forEach(film => {
      film.poster = corecteazaImagineVeche(film.poster);
      film.heroBg = corecteazaImagineVeche(film.heroBg);
      film.logo = corecteazaImagineVeche(film.logo);
      film.thumbnail = corecteazaImagineVeche(film.thumbnail);
      film.trailerImages = Array.isArray(film.trailerImages) ? film.trailerImages.map(corecteazaImagineVeche) : [];
    });
  }

  if (cheie === KEY_HOME && date) {
    ["trendingMovies", "categories", "comingSoon"].forEach(sec => {
      if (!Array.isArray(date[sec])) return;
      date[sec].forEach(item => {
        item.image = corecteazaImagineVeche(item.image);
      });
    });
  }

  return date;
}

function scrieDate(cheie, valoare) {
  localStorage.setItem(cheie, JSON.stringify(valoare, null, 2));
}

async function incarcaFilmeleImplicite() {
  if (Array.isArray(window.WATCHLY_DEFAULT_MOVIES)) {
    DEFAULT_MOVIES = normalizeazaDateStocate(KEY_MOVIES, window.WATCHLY_DEFAULT_MOVIES);
    return;
  }

  try {
    const raspuns = await fetch(MOVIES_JSON_URL);
    const filme = await raspuns.json();
    DEFAULT_MOVIES = normalizeazaDateStocate(KEY_MOVIES, filme);
  } catch (eroare) {
    DEFAULT_MOVIES = [];
  }
}

function schimbaTab(numeTab) {
  const butoane = document.querySelectorAll("[data-admin-tab]");
  const panouri = document.querySelectorAll("[data-admin-panel]");
  for (let i = 0; i < butoane.length; i++) {
    butoane[i].classList.toggle("active", butoane[i].dataset.adminTab === numeTab);
  }
  for (let i = 0; i < panouri.length; i++) {
    panouri[i].hidden = (panouri[i].dataset.adminPanel !== numeTab);
  }
}

// --- LOGICA FILME ---
function randeazaFilme() {
  const container = document.getElementById("adminMovies");
  const numaraText = document.getElementById("adminCount");
  const text = cautareFilmText.toLowerCase();

  const filtrate = toateFilmele.filter(m => m.title.toLowerCase().includes(text));
  numaraText.textContent = filtrate.length + " movies";

  container.innerHTML = "";
  filtrate.forEach(m => {
    container.innerHTML += `
      <article class="admin-movie">
        <img src="${m.poster}" alt="">
        <div>
          <h3>${m.title}</h3>
          <p>${m.genre} / ${m.year} / ${m.status}</p>
        </div>
        <div class="admin-movie__actions">
          <button class="admin-btn" onclick="pregatesteEditare('${m.id}')">Edit</button>
          <button class="admin-btn admin-btn--danger" onclick="stergeFilm('${m.id}')">Delete</button>
        </div>
      </article>
    `;
  });
}

function salveazaFilm(e) {
  e.preventDefault();
  const idAscuns = document.getElementById("movieId").value;
  const titlu = document.getElementById("title").value;

  const film = {
    id: idAscuns || titlu.toLowerCase().replace(/\s+/g, '-'),
    title: titlu,
    genre: document.getElementById("genre").value,
    category: document.getElementById("category").value,
    year: document.getElementById("year").value,
    duration: document.getElementById("duration").value,
    ageRating: document.getElementById("ageRating").value,
    imdb: document.getElementById("imdb").value,
    buyPrice: Number(document.getElementById("buyPrice").value),
    rentPrice: Number(document.getElementById("rentPrice").value),
    poster: document.getElementById("poster").value,
    heroBg: document.getElementById("heroBg").value,
    logo: document.getElementById("logo").value,
    thumbnail: document.getElementById("thumbnail").value,
    description: document.getElementById("description").value,
    status: document.getElementById("status").value,
    featured: document.getElementById("featured").checked,
    trailerImages: document.getElementById("trailerImages").value.split(",").map(s => s.trim())
  };

  const index = toateFilmele.findIndex(f => f.id === film.id);
  if (index !== -1) toateFilmele[index] = film;
  else toateFilmele.push(film);

  scrieDate(KEY_MOVIES, toateFilmele);
  randeazaFilme();
  e.target.reset();
  document.getElementById("movieId").value = "";
}

function pregatesteEditare(id) {
  const m = toateFilmele.find(f => f.id === id);
  if (!m) return;
  document.getElementById("movieId").value = m.id;
  document.getElementById("title").value = m.title;
  document.getElementById("genre").value = m.genre;
  document.getElementById("category").value = m.category;
  document.getElementById("year").value = m.year;
  document.getElementById("duration").value = m.duration;
  document.getElementById("ageRating").value = m.ageRating;
  document.getElementById("imdb").value = m.imdb;
  document.getElementById("buyPrice").value = m.buyPrice;
  document.getElementById("rentPrice").value = m.rentPrice;
  document.getElementById("poster").value = m.poster;
  document.getElementById("heroBg").value = m.heroBg;
  document.getElementById("logo").value = m.logo;
  document.getElementById("thumbnail").value = m.thumbnail;
  document.getElementById("description").value = m.description;
  document.getElementById("status").value = m.status;
  document.getElementById("featured").checked = m.featured;
  document.getElementById("trailerImages").value = m.trailerImages.join(", ");
}

function stergeFilm(id) {
  if (confirm("Delete this movie?")) {
    toateFilmele = toateFilmele.filter(f => f.id !== id);
    scrieDate(KEY_MOVIES, toateFilmele);
    randeazaFilme();
  }
}

// --- IMPORT / EXPORT JSON ---
function exportaJSON() {
  const box = document.getElementById("jsonBox");
  box.value = JSON.stringify(toateFilmele, null, 2);
}

function importaJSON() {
  const box = document.getElementById("jsonBox");
  try {
    const dateNoi = JSON.parse(box.value);
    if (Array.isArray(dateNoi)) {
      toateFilmele = dateNoi;
      scrieDate(KEY_MOVIES, toateFilmele);
      randeazaFilme();
      alert("Import succesful!");
    }
  } catch (err) {
    alert("Invalid JSON format.");
  }
}

// --- LOGICA HOME CONTENT ---
function randeazaHome() {
  const dateHome = citesteDate(KEY_HOME, { trendingMovies: [], categories: [], comingSoon: [] });
  const container = document.getElementById("adminHomeSections");
  const counter = document.getElementById("homeContentCount");
  
  let totalProduse = 0;
  container.innerHTML = "";

  const sectiuni = ["trendingMovies", "categories", "comingSoon"];
  sectiuni.forEach(sec => {
    totalProduse += dateHome[sec].length;
    let htmlProduse = "";
    dateHome[sec].forEach((item, index) => {
      htmlProduse += `
        <div class="admin-home-item">
          <img src="${item.image}" width="40">
          <span>${item.title}</span>
          <button class="admin-btn admin-btn--danger" onclick="stergeHomeItem('${sec}', ${index})">X</button>
        </div>
      `;
    });
    container.innerHTML += `<div class="admin-home-section"><h3>${sec}</h3><div class="admin-home-items">${htmlProduse || 'Empty'}</div></div>`;
  });
  
  counter.textContent = totalProduse + " items";
}

function salveazaHome(e) {
  e.preventDefault();
  const dateHome = citesteDate(KEY_HOME, { trendingMovies: [], categories: [], comingSoon: [] });
  const sectiune = document.getElementById("homeSection").value;
  const nouItem = {
    title: document.getElementById("homeTitle").value,
    image: document.getElementById("homeImage").value,
    movieId: document.getElementById("homeMovieId").value,
    releaseDate: document.getElementById("homeReleaseDate").value,
    featured: document.getElementById("homeFeatured").checked
  };
  dateHome[sectiune].push(nouItem);
  scrieDate(KEY_HOME, dateHome);
  randeazaHome();
  e.target.reset();
}

function stergeHomeItem(sec, index) {
  const dateHome = citesteDate(KEY_HOME, null);
  dateHome[sec].splice(index, 1);
  scrieDate(KEY_HOME, dateHome);
  randeazaHome();
}

// --- IMPORT / EXPORT HOME CONTENT JSON ---
function exportaHomeJSON() {
  const dateHome = citesteDate(KEY_HOME, { trendingMovies: [], categories: [], comingSoon: [] });
  const box = document.getElementById("homeJsonBox");
  box.value = JSON.stringify(dateHome, null, 2);
}

function importaHomeJSON() {
  const box = document.getElementById("homeJsonBox");
  try {
    const dateNoi = JSON.parse(box.value);
    if (dateNoi && typeof dateNoi === 'object' && 
        (dateNoi.trendingMovies || dateNoi.categories || dateNoi.comingSoon)) {
      scrieDate(KEY_HOME, dateNoi);
      randeazaHome();
      alert("Home Content import succesful!");
    } else {
      alert("Invalid format. Must contain trendingMovies, categories, or comingSoon.");
    }
  } catch (err) {
    alert("Invalid JSON format.");
  }
}

// --- LOGICA UTILIZATORI ---
function randeazaUseri() {
  const container = document.getElementById("adminUsers");
  const lista = citesteDate(KEY_USERS, []);
  const text = cautareUserText.toLowerCase();

  const filtrate = lista.filter(u => u.username.toLowerCase().includes(text) || u.email.toLowerCase().includes(text));
  document.getElementById("adminUsersCount").textContent = filtrate.length + " accounts";

  container.innerHTML = "";
  filtrate.forEach(u => {
    container.innerHTML += `
      <div class="admin-user">
        <div class="admin-user__avatar">${u.username[0].toUpperCase()}</div>
        <div style="flex:1; margin-left:15px;">
          <h3>${u.username}</h3>
          <p>${u.email}</p>
        </div>
        <div class="admin-user__actions">
          <select onchange="actualizeazaUser('${u.id}', 'plan', this.value)">
            <option value="Gold Plan" ${u.plan === 'Gold Plan' ? 'selected' : ''}>Gold Plan</option>
            <option value="Diamond Plan" ${u.plan === 'Diamond Plan' ? 'selected' : ''}>Diamond Plan</option>
            <option value="Platinum Plan" ${u.plan === 'Platinum Plan' ? 'selected' : ''}>Platinum Plan</option>
          </select>
          <select onchange="actualizeazaUser('${u.id}', 'role', this.value)">
            <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
          <button class="admin-btn admin-btn--danger" onclick="stergeUser('${u.id}')">
            Delete
          </button>
        </div>
      </div>
    `;
  });
}

function actualizeazaUser(id, camp, valoare) {
  const lista = citesteDate(KEY_USERS, []);
  const user = lista.find(u => u.id === id);
  if (user) {
    user[camp] = valoare;
    scrieDate(KEY_USERS, lista);
    randeazaUseri();
  }
}

function stergeUser(id) {
  if (confirm("Delete this account?")) {
    let lista = citesteDate(KEY_USERS, []);
    lista = lista.filter(u => u.id !== id);
    scrieDate(KEY_USERS, lista);
    randeazaUseri();
  }
}

// --- INITIALIZARE ---
document.addEventListener("DOMContentLoaded", async function () {
  await incarcaFilmeleImplicite();
  toateFilmele = citesteDate(KEY_MOVIES, DEFAULT_MOVIES);
  
  randeazaFilme();
  randeazaUseri();
  randeazaHome();

  // Tab-uri
  document.querySelectorAll("[data-admin-tab]").forEach(btn => {
    btn.onclick = () => schimbaTab(btn.dataset.adminTab);
  });

  // Formulare
  document.getElementById("movieForm").onsubmit = salveazaFilm;
  document.getElementById("homeContentForm").onsubmit = salveazaHome;

  // Cautare
  document.getElementById("adminSearch").oninput = (e) => { cautareFilmText = e.target.value; randeazaFilme(); };
  document.getElementById("adminUserSearch").oninput = (e) => { cautareUserText = e.target.value; randeazaUseri(); };

  // JSON Buttons
  document.getElementById("exportJsonBtn").onclick = exportaJSON;
  document.getElementById("importJsonBtn").onclick = importaJSON;
  document.getElementById("exportHomeJsonBtn").onclick = exportaHomeJSON;
  document.getElementById("importHomeJsonBtn").onclick = importaHomeJSON;

  // Reset/Clear
  document.getElementById("resetMoviesBtn").onclick = () => {
    if (confirm("Reset?")) {
      if (DEFAULT_MOVIES.length === 0) {
        alert("Filmele initiale nu s-au putut incarca.");
        return;
      }

      toateFilmele = DEFAULT_MOVIES.map(film => ({ ...film }));
      scrieDate(KEY_MOVIES, toateFilmele);
      randeazaFilme();
    }
  };
  
  schimbaTab("movies");
});

// Global functions for HTML buttons
window.pregatesteEditare = pregatesteEditare;
window.stergeFilm = stergeFilm;
window.stergeHomeItem = stergeHomeItem;
window.actualizeazaUser = actualizeazaUser;
window.stergeUser = stergeUser;
window.exportaHomeJSON = exportaHomeJSON;
window.importaHomeJSON = importaHomeJSON;
