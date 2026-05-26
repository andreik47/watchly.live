// --- GESTIONARE TAB-URI ---
let taburiCont = document.querySelectorAll(".account-tab");
let panouriCont = document.querySelectorAll(".account-panel");

taburiCont.forEach((tab) => {
  tab.addEventListener("click", () => {
    let idTinta = tab.dataset.accountTab;
    if (!idTinta) return;

    // Dezactivez toate tab-urile si panourile
    taburiCont.forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    panouriCont.forEach((p) => {
      p.classList.remove("active");
      p.hidden = true;
    });

    // Activez tab-ul pe care s-a dat click
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");

    let panouActiv = document.getElementById(idTinta);
    if (panouActiv) {
      panouActiv.classList.add("active");
      panouActiv.hidden = false;
    }
  });
});

// --- CONFIGURARE SI REPREZENTARE DATE ---
const CHEIE_COMENZI = "watchly.orders";
const CHEIE_DISPOZITIVE = "watchly.devices";
const PRETURI_PLANURI = {
  "Gold Plan": 9.99,
  "Diamond Plan": 19.99,
  "Platinum Plan": 29.99,
};

// Functii simple pentru citire/scriere in LocalStorage
function citesteDinStorage(cheie, valoareDefault) {
  let date = localStorage.getItem(cheie);
  if (!date) return valoareDefault;
  try {
    return JSON.parse(date);
  } catch (e) {
    return valoareDefault;
  }
}

function scrieInStorage(cheie, date) {
  localStorage.setItem(cheie, JSON.stringify(date, null, 2));
}

// Formateaza data intr-un mod placut (ex: Oct 12, 2023)
function formateazaData(dataString) {
  if (!dataString) return "Nesetat";
  let optiuni = { month: "short", day: "numeric", year: "numeric" };
  return new Date(dataString).toLocaleDateString("en-US", optiuni);
}

// Curata titlul filmului pentru comparare
function normalizeazaTitlu(titlu) {
  if (!titlu) return "";
  return titlu.toString().replace(/\(HD\)/gi, "").trim().toLowerCase();
}

// Aduce filmele din magazinul global
async function iaToateFilmele() {
  if (!window.WatchlyStore) return [];
  let filme = await window.WatchlyStore.loadMovies();
  return filme.filter(f => f.status !== "draft");
}

// Gaseste obiectul film pentru un item din comanda
function gasesteFilmDupaItem(item, listaFilme) {
  // Cautam dupa ID sau dupa titlu
  let gasit = listaFilme.find(f => f.id === item.movieId);
  if (!gasit && item.id) {
    gasit = listaFilme.find(f => item.id.toString().startsWith(f.id));
  }
  if (!gasit) {
    gasit = listaFilme.find(f => normalizeazaTitlu(f.title) === normalizeazaTitlu(item.title));
  }
  return gasit;
}

// --- GESTIONARE DISPOZITIVE ---

function detecteazaDispozitivulCurent() {
  let agent = navigator.userAgent;
  let platforma = navigator.platform;
  
  let tip = "desktop";
  if (agent.includes("Mobi")) tip = "mobile";
  if (agent.includes("Tablet") || agent.includes("iPad")) tip = "tablet";
  if (agent.includes("TV") || agent.includes("SmartTV")) tip = "tv";

  let browser = "Browser";
  if (agent.includes("Edg")) browser = "Edge";
  else if (agent.includes("Chrome")) browser = "Chrome";
  else if (agent.includes("Firefox")) browser = "Firefox";
  else if (agent.includes("Safari")) browser = "Safari";

  let os = "Device";
  if (agent.includes("Win")) os = "Windows";
  else if (agent.includes("Mac")) os = "Mac";
  else if (agent.includes("Android")) os = "Android";
  else if (agent.includes("iPhone") || agent.includes("iPad")) os = "iOS";

  let numeAfisat = `${os} ${tip === "desktop" ? browser : tip}`;

  return {
    id: `${tip}-${browser}-${os}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: numeAfisat,
    type: tip,
    browser: browser,
    os: os,
    lastActive: new Date().toISOString()
  };
}

function iaIconitaDispozitiv(tip) {
  if (tip === "tv") return "../img/icon/System/tv.svg";
  if (tip === "mobile") return "../img/icon/System/phone.svg";
  if (tip === "tablet") return "../img/icon/System/table.svg";
  return "../img/icon/System/pc.svg";
}

function inregistreazaAcestDispozitiv(userId) {
  let curent = detecteazaDispozitivulCurent();
  let toateDispozitivele = citesteDinStorage(CHEIE_DISPOZITIVE, {});
  let listaUser = Array.isArray(toateDispozitivele[userId]) ? toateDispozitivele[userId] : [];

  let indexExistent = listaUser.findIndex(d => d.id === curent.id);
  if (indexExistent !== -1) {
    listaUser[indexExistent] = { ...listaUser[indexExistent], lastActive: curent.lastActive };
  } else {
    listaUser.unshift(curent);
  }

  // Pastram doar ultimele 8 dispozitive
  toateDispozitivele[userId] = listaUser.slice(0, 8);
  scrieInStorage(CHEIE_DISPOZITIVE, toateDispozitivele);
  return curent.id;
}

function formatTimpActiv(dataIso, esteCurent) {
  if (esteCurent) return "Active now";
  if (!dataIso) return "Unknown";
  
  let difMS = Date.now() - new Date(dataIso).getTime();
  let minute = Math.floor(difMS / 60000);
  
  if (minute < 1) return "Just now";
  if (minute < 60) return `Last active: ${minute}m ago`;
  
  let ore = Math.floor(minute / 60);
  if (ore < 24) return `Last active: ${ore}h ago`;
  
  let zile = Math.floor(ore / 24);
  return `Last active: ${zile}d ago`;
}

// --- FUNCTIA PRINCIPALA DE RENDER ---

async function afiseazaDateleContului() {
  let auth = window.WatchlyAuth;
  if (!auth) return;

  let utilizator = auth.getCurrentUser();
  if (!utilizator) {
    window.location.href = "../html/login.html";
    return;
  }

  // Pregatim datele (comenzi, filme, dispozitive)
  let toateComenzile = citesteDinStorage(CHEIE_COMENZI, []);
  let comenzileMele = toateComenzile.filter(c => c.userId === utilizator.id || utilizator.role === "admin");
  let filmeDinStore = await iaToateFilmele();
  let idDeviceCurent = inregistreazaAcestDispozitiv(utilizator.id);

  // Extragem toate produsele din comenzi si le atasam datele despre film
  let toateItemele = comenzileMele.flatMap(c => c.items || []).map(item => {
    let dateFilm = gasesteFilmDupaItem(item, filmeDinStore);
    return {
      ...item,
      movieId: item.movieId || dateFilm?.id,
      genre: item.genre || dateFilm?.genre || "Other",
      poster: item.poster || dateFilm?.poster || "../img/movie/1/poster.webp"
    };
  });

  // 1. Date de baza Profil
  document.querySelectorAll("[data-account-name]").forEach(el => el.textContent = utilizator.fullName || utilizator.username);
  document.querySelectorAll("[data-account-greeting]").forEach(el => el.textContent = `Hi, ${utilizator.fullName || utilizator.username}`);
  document.querySelectorAll("[data-account-plan]").forEach(el => el.textContent = utilizator.plan || "Gold Plan");
  document.querySelectorAll("[data-member-date]").forEach(el => el.textContent = `Member since ${formateazaData(utilizator.createdAt)}`);
  document.querySelectorAll("[data-profile-image]").forEach(img => img.src = utilizator.profileImage || "https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg");

  // Statisici
  let nrRent = toateItemele.filter(i => i.subtitle?.toLowerCase().includes("rent")).length;
  let nrCumparate = toateItemele.length - nrRent;
  
  if (document.querySelector('[data-stat="movies"]')) document.querySelector('[data-stat="movies"]').textContent = nrCumparate;
  if (document.querySelector('[data-stat="rents"]')) document.querySelector('[data-stat="rents"]').textContent = nrRent;
  if (document.querySelector('[data-stat="orders"]')) document.querySelector('[data-stat="orders"]').textContent = comenzileMele.length;
  if (document.querySelector('[data-stat="list"]')) document.querySelector('[data-stat="list"]').textContent = toateItemele.length;

  // 2. Formular Profil
  let campuri = ["fullName", "email", "username", "password", "profileImage", "birthDate", "country", "language"];
  campuri.forEach(camp => {
    let input = document.getElementById("profile" + camp.charAt(0).toUpperCase() + camp.slice(1));
    if (input) input.value = utilizator[camp] || "";
  });

  // 3. Cumparaturi Recente
  let containerPurchases = document.getElementById("accountPurchases");
  if (containerPurchases) {
    let ultimeleFilme = toateItemele.slice(-5).reverse();
    if (ultimeleFilme.length > 0) {
      containerPurchases.innerHTML = ultimeleFilme.map(item => `
        <article class="account-movie-card">
          <img src="${item.poster}" alt="${item.title}">
          <div class="watch-progress"><span style="width: 100%"></span></div>
          <div class="account-card-meta"><strong>${item.title}</strong><small>${item.subtitle || 'Purchased'}</small></div>
        </article>
      `).join("");
    } else {
      containerPurchases.innerHTML = `<p class="account-empty">No purchases yet.</p>`;
    }
  }

  // 4. Genuri Favorite
  let containerGenuri = document.getElementById("accountFavoriteGenres");
  if (containerGenuri) {
    let contorGenuri = {};
    toateItemele.forEach(item => {
      let g = item.genre.split("-")[0].trim();
      contorGenuri[g] = (contorGenuri[g] || 0) + 1;
    });

    let topGenuri = Object.entries(contorGenuri).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    if (topGenuri.length > 0) {
      let maxG = Math.max(...topGenuri.map(g => g[1]));
      containerGenuri.innerHTML = topGenuri.map(([nume, count]) => {
        let filmExemplu = filmeDinStore.find(f => f.genre.includes(nume)) || filmeDinStore[0];
        let proc = Math.max(20, Math.round((count / maxG) * 100));
        return `
          <article class="account-movie-card small">
            <img src="${filmExemplu?.poster || "../img/movie/1/poster.webp"}" alt="${nume}">
            <strong>${nume}</strong>
            <div class="watch-progress"><span style="width: ${proc}%"></span></div>
            <small class="account-genre-count">${count} items</small>
          </article>
        `;
      }).join("");
    } else {
      containerGenuri.innerHTML = `<p class="account-empty">Buy movies to see your favorite genres.</p>`;
    }
  }

  // 5. Filme Salvate (Bookmarks)
  let containerSaved = document.getElementById("accountSavedMovies");
  if (containerSaved) {
    let salvate = auth.loadSavedMovies(utilizator.id);
    if (salvate.length > 0) {
      containerSaved.innerHTML = salvate.slice(0, 5).map(m => `
        <article class="account-movie-card small saved">
          <img src="${m.poster}" alt="${m.title}">
          <strong>${m.title}</strong>
          <button class="bookmark-remove" type="button" data-remove-saved="${m.id}">
            <img src="../img/icon/Menu/x.svg" alt="Remove">
          </button>
        </article>
      `).join("");
    } else {
      containerSaved.innerHTML = `<p class="account-empty">No saved movies.</p>`;
    }
  }

  // 6. Dispozitive
  let containerDevices = document.getElementById("accountDevices");
  if (containerDevices) {
    let listaD = citesteDinStorage(CHEIE_DISPOZITIVE, {})[utilizator.id] || [];
    if (listaD.length > 0) {
      containerDevices.innerHTML = listaD.map(d => {
        let esteAcesta = d.id === idDeviceCurent;
        return `
          <div>
            <img class="device-icon" src="${iaIconitaDispozitiv(d.type)}" alt="">
            <p>${d.name}<small>${formatTimpActiv(d.lastActive, esteAcesta)} · ${d.browser}</small></p>
            <button class="device-remove" type="button" data-remove-device="${d.id}">
              <img src="../img/icon/Menu/x.svg" alt="X">
            </button>
            <i class="${esteAcesta ? "active" : ""}"></i>
          </div>
        `;
      }).join("");
    }
  }

  // 7. Plan si Preturi
  document.querySelectorAll("[data-current-plan]").forEach(el => el.textContent = utilizator.plan || "Gold Plan");
  let pret = PRETURI_PLANURI[utilizator.plan] || 0;
  document.querySelectorAll("[data-plan-price]").forEach(el => el.textContent = `$${pret.toFixed(2)}`);
}

// --- EVENT LISTENERS ---

// Salvare profil
let profilForm = document.getElementById("accountProfileForm");
if (profilForm) {
  profilForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let auth = window.WatchlyAuth;
    let u = auth.getCurrentUser();
    
    let dateNoi = {
      fullName: document.getElementById("profileFullName").value,
      email: document.getElementById("profileEmail").value,
      username: document.getElementById("profileUsername").value,
      password: document.getElementById("profilePassword").value,
      profileImage: document.getElementById("profileImage").value,
      birthDate: document.getElementById("profileBirthDate").value,
      country: document.getElementById("profileCountry").value,
      language: document.getElementById("profileLanguage").value
    };

    auth.updateUser(u.id, dateNoi);
    afiseazaDateleContului();
    alert("Profile updated successfully!");
  });
}

// Logout
document.querySelector(".account-logout")?.addEventListener("click", () => {
  window.WatchlyAuth?.logout();
});

// Schimbare Plan
document.querySelectorAll("[data-plan-choice]").forEach(btn => {
  btn.addEventListener("click", () => {
    let u = window.WatchlyAuth.getCurrentUser();
    window.WatchlyAuth.updateUser(u.id, { plan: btn.dataset.planChoice });
    afiseazaDateleContului();
  });
});

// Anulare Subscriptie
document.querySelector(".cancel-subscription")?.addEventListener("click", () => {
  let u = window.WatchlyAuth.getCurrentUser();
  window.WatchlyAuth.updateUser(u.id, { plan: "Gold Plan" });
  afiseazaDateleContului();
});

document.getElementById("accountSavedMovies")?.addEventListener("click", (e) => {
  let btn = e.target.closest("[data-remove-saved]");
  if (!btn) return;
  
  let u = window.WatchlyAuth.getCurrentUser();
  let idFilm = btn.dataset.removeSaved;
  
  // Luăm lista și căutăm filmul corect
  let salvate = window.WatchlyAuth.loadSavedMovies(u.id);
  let film = salvate.find(m => String(m.id) === String(idFilm));
  
  if (film) {
    window.WatchlyAuth.toggleSavedMovie(film);
    afiseazaDateleContului(); // Re-randăm secțiunea
  }
});

// Stergere Dispozitiv
document.getElementById("accountDevices")?.addEventListener("click", (e) => {
  let btn = e.target.closest("[data-remove-device]");
  if (!btn) return;

  let u = window.WatchlyAuth.getCurrentUser();
  let idDevice = btn.dataset.removeDevice;
  
  let toateD = citesteDinStorage(CHEIE_DISPOZITIVE, {});
  toateD[u.id] = (toateD[u.id] || []).filter(d => d.id !== idDevice);
  
  scrieInStorage(CHEIE_DISPOZITIVE, toateD);
  afiseazaDateleContului();
});

// Sterge toate dispozitivele
document.getElementById("clearDevicesBtn")?.addEventListener("click", () => {
  let u = window.WatchlyAuth.getCurrentUser();
  let toateD = citesteDinStorage(CHEIE_DISPOZITIVE, {});
  toateD[u.id] = [];
  scrieInStorage(CHEIE_DISPOZITIVE, toateD);
  afiseazaDateleContului();
});

// Initializare pagina
document.addEventListener("DOMContentLoaded", () => {
  afiseazaDateleContului();
  
  // Scroll la sectiunea saved daca avem hash-ul #saved in URL
  if (window.location.hash === "#saved") {
    let sectiuneSaved = document.getElementById("accountSavedSection");
    if (sectiuneSaved) {
      sectiuneSaved.scrollIntoView({ behavior: "smooth" });
    }
  }
});
