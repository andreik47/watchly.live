const STORAGE_USERS = "watchly.users";
const STORAGE_SESSION = "watchly.session";
const STORAGE_SAVED = "watchly.savedMovies";
const DEFAULT_AVATAR = "https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg";

function citesteDate(cheie, valoareDefault) {
  const date = localStorage.getItem(cheie);
  if (date) {
    return JSON.parse(date);
  }
  return valoareDefault;
}

function scrieDate(cheie, valoare) {
  localStorage.setItem(cheie, JSON.stringify(valoare));
}

function afiseazaMesaj(formular, text, tip) {
  let box = formular.querySelector(".auth-message");
  if (!box) {
    box = document.createElement("p");
    box.className = "auth-message";
    formular.prepend(box);
  }
  box.textContent = text;
  if (tip === "success") {
    box.classList.add("success");
  } else {
    box.classList.remove("success");
  }
}

function esteEmailValid(email) {
  return email.includes("@") && email.includes(".");
}

function initializareUtilizatori() {
  let lista = citesteDate(STORAGE_USERS, []);
  
  lista = lista.filter(function(u) {
    return u.id !== "user-andrei";
  });

  let adminExista = false;
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].username === "admin") {
      adminExista = true;
      lista[i].role = "admin";
      lista[i].password = "admin";
      break;
    }
  }

  if (!adminExista) {
    const adminNou = {
      id: "user-admin",
      username: "admin",
      fullName: "admin",
      email: "admin@watchly.local",
      password: "admin",
      plan: "Platinum Plan",
      role: "admin",
      country: "Moldova",
      language: "English",
      birthDate: "",
      profileImage: DEFAULT_AVATAR,
      createdAt: "2026-05-19",
      status: "active"
    };
    lista.unshift(adminNou);
  }

  scrieDate(STORAGE_USERS, lista);
  return lista;
}

function obtineUtilizatorCurent() {
  const sesiune = citesteDate(STORAGE_SESSION, null);
  if (!sesiune) return null;
  
  const utilizatori = initializareUtilizatori();
  for (let i = 0; i < utilizatori.length; i++) {
    if (utilizatori[i].id === sesiune.userId) {
      return utilizatori[i];
    }
  }
  return null;
}

function logareUtilizator(utilizator) {
  const dateSesiune = {
    userId: utilizator.id,
    loggedAt: new Date().toISOString()
  };
  scrieDate(STORAGE_SESSION, dateSesiune);
  actualizeazaInterfata(utilizator);
}

function delogareUtilizator() {
  localStorage.removeItem(STORAGE_SESSION);
  actualizeazaInterfata(null);
  window.location.href = "../html/home.html";
}

function actualizeazaUtilizator(id, dateNoi) {
  const utilizatori = initializareUtilizatori();
  const index = utilizatori.findIndex(function(utilizator) {
    return utilizator.id === id;
  });

  if (index === -1) return null;

  utilizatori[index] = {
    ...utilizatori[index],
    ...dateNoi
  };

  scrieDate(STORAGE_USERS, utilizatori);
  actualizeazaInterfata(utilizatori[index]);
  return utilizatori[index];
}

function inregistrare(nume, email, parola) {
  const utilizatori = initializareUtilizatori();
  
  for (let i = 0; i < utilizatori.length; i++) {
    if (utilizatori[i].email === email || utilizatori[i].username === nume) {
      alert("Acest email sau username exista deja.");
      return;
    }
  }

  const utilizatorNou = {
    id: "user-" + Date.now(),
    username: nume,
    fullName: nume,
    email: email.toLowerCase(),
    password: parola,
    plan: "Gold Plan",
    role: "user",
    country: "Moldova",
    language: "English",
    birthDate: "",
    profileImage: DEFAULT_AVATAR,
    createdAt: new Date().toISOString().slice(0, 10),
    status: "active"
  };

  utilizatori.push(utilizatorNou);
  scrieDate(STORAGE_USERS, utilizatori);
  logareUtilizator(utilizatorNou);
  return utilizatorNou;
}

function autentificare(identificator, parola) {
  const utilizatori = initializareUtilizatori();
  let gasit = null;

  for (let i = 0; i < utilizatori.length; i++) {
    if ((utilizatori[i].email === identificator || utilizatori[i].username === identificator) && utilizatori[i].password === parola) {
      gasit = utilizatori[i];
      break;
    }
  }

  if (!gasit) {
    throw new Error("Date incorecte.");
  }
  
  if (gasit.status === "blocked") {
    throw new Error("Contul este blocat.");
  }

  logareUtilizator(gasit);
  return gasit;
}

function adaugaLaFavorite(film) {
  const user = obtineUtilizatorCurent();
  if (!user) {
    window.location.href = "../html/register.html";
    return;
  }

  const toateFavoritele = citesteDate(STORAGE_SAVED, {});
  let listaMea = toateFavoritele[user.id] || [];
  
  let index = listaMea.findIndex(item => String(item.id) === String(film.id));

  if (index !== -1) {
    listaMea.splice(index, 1); 
  } else {
    listaMea.unshift({
      id: film.id,
      title: film.title,
      poster: film.poster || film.thumbnail,
      genre: film.genre
    });
  }

  toateFavoritele[user.id] = listaMea;
  scrieDate(STORAGE_SAVED, toateFavoritele);
}

function actualizeazaInterfata(user) {
  const adminBtns = document.querySelectorAll(".admin-navbar-btn");
  for (let i = 0; i < adminBtns.length; i++) {
    adminBtns[i].remove();
  }

  const accountSections = document.querySelectorAll(".account");
  for (let i = 0; i < accountSections.length; i++) {
    const link = accountSections[i].querySelector("a");
    const avatar = accountSections[i].querySelector(".avatar");

    if (user) {
      link.textContent = user.username;
      link.href = "../html/account.html";
      if (avatar) {
        avatar.style.backgroundImage = "url('" + (user.profileImage || DEFAULT_AVATAR) + "')";
      }
    } else {
      link.textContent = "Login";
      link.href = "../html/login.html";
      if (avatar) {
        avatar.style.backgroundImage = "url('" + DEFAULT_AVATAR + "')";
      }
    }
  }

  if (user && user.role === "admin") {
    const navActions = document.querySelectorAll(".nav-action");
    for (let i = 0; i < navActions.length; i++) {
      const subBtn = navActions[i].querySelector(".btn-subscribe");
      if (subBtn) {
        const adminLink = document.createElement("a");
        adminLink.className = "admin-navbar-btn";
        adminLink.href = "../html/admin.html";
        adminLink.innerHTML = '<img src="../img/icon/Interface/settings.svg" alt="Admin">';
        subBtn.after(adminLink);
      }
    }
  }
}

function protejeazaAdmin() {
  if (!document.body.classList.contains("admin-body")) return;
  const user = obtineUtilizatorCurent();
  
  if (!user || user.role !== "admin") {
    document.body.innerHTML = '<h1 style="color:white; text-align:center; margin-top:100px;">Acces Interzis!</h1>';
    setTimeout(function() {
      window.location.href = "../html/home.html";
    }, 2000);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  initializareUtilizatori();
  const userCurent = obtineUtilizatorCurent();
  actualizeazaInterfata(userCurent);
  protejeazaAdmin();

  const loginForm = document.querySelector(".login-form");
  if (loginForm && !document.querySelector(".register-body")) {
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const inputs = loginForm.querySelectorAll("input");
      try {
        autentificare(inputs[0].value, inputs[1].value);
        window.location.href = "../html/home.html";
      } catch (err) {
        afiseazaMesaj(loginForm, err.message, "error");
      }
    });
  }

  const regForm = document.querySelector(".register-body .login-form");
  if (regForm) {
    regForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const inputs = regForm.querySelectorAll("input");
      if (inputs[2].value.length < 5) {
        afiseazaMesaj(regForm, "Parola prea scurta!", "error");
        return;
      }
      inregistrare(inputs[0].value, inputs[1].value, inputs[2].value);
      window.location.href = "../html/account.html";
    });
  }

  // Google Auth Handler
  const buttons = document.querySelectorAll(".login-provider");
  if (buttons.length >= 2) {
    buttons[0].addEventListener("click", function(e) {
      e.preventDefault();
      creazaContSocialAuth("google");
    });
    
    buttons[1].addEventListener("click", function(e) {
      e.preventDefault();
      creazaContSocialAuth("apple");
    });
  }
});

function creazaContSocialAuth(provider) {
  const listaUtilizatori = citesteDate(KEY_USERS, []);
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  const username = provider + "_user_" + randomNum;
  const email = username + "@watchly.local";
  const parola = "SocialAuth123!@#";

  const noulUser = {
    id: Date.now().toString(),
    username: username,
    email: email,
    parola: parola,
    plan: "Free Plan",
    role: "user",
    avatar: DEFAULT_AVATAR,
    status: "active",
    createdAt: new Date().toISOString()
  };

  listaUtilizatori.push(noulUser);
  scrieDate(KEY_USERS, listaUtilizatori);
  logareUtilizator(noulUser.id, noulUser.username);
  
  window.location.href = "../html/home.html";
}

window.WatchlyAuth = {
  getCurrentUser: obtineUtilizatorCurent,
  logout: delogareUtilizator,
  updateUser: actualizeazaUtilizator,
  
  toggleSavedMovie: adaugaLaFavorite,

  loadSavedMovies: function(userId) {
    const toate = citesteDate(STORAGE_SAVED, {});
    return toate[userId] || [];
  },
  isMovieSaved: function(movieId) {
    const user = obtineUtilizatorCurent();
    if (!user) return false;
    const lista = this.loadSavedMovies(user.id);
    return lista.some(m => String(m.id) === String(movieId));
  },

  updateNavAccount: function() {
    actualizeazaInterfata(obtineUtilizatorCurent());
  }
};
