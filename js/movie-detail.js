async function startMovieDetails() {
  let root = document.querySelector(".movie-detail");
  if (!root || !window.WatchlyStore) return;

  let params = new URLSearchParams(window.location.search);
  let id = params.get("id");
  
  let movies = await window.WatchlyStore.loadMovies();
  
  let movie = null;
  for (let i = 0; i < movies.length; i++) {
    if (movies[i].id === id) {
      movie = movies[i];
      break;
    }
  }
  
  if (!movie) {
    movie = movies[0];
  }

  let related = [];
  for (let i = 0; i < movies.length; i++) {
    if (movies[i].id !== movie.id && movies[i].status !== "draft") {
      related.push(movies[i]);
      if (related.length === 5) break;
    }
  }

  document.title = "Watchly - " + movie.title;

  let hero = document.querySelector(".movie-detail__hero");
  let logo = document.querySelector(".movie-detail__logo");
  let logoRow = document.querySelector(".movie-detail__logo-row");
  let meta = document.querySelector(".movie-detail__meta");
  let description = document.querySelector(".movie-detail__description");
  let buyButtonSpan = document.querySelector(".movie-detail__btn--gradient span");
  let rentButtonSpan = document.querySelector(".movie-detail__btn--outline span");
  let mainVideo = document.querySelector(".movie-detail__video-main");
  let thumbnails = document.querySelector(".movie-detail__thumbnails");
  let trailers = document.querySelector(".movie-detail-trailers__cards");
  let overview = document.querySelector(".movie-detail__movies");

  if (hero) {
    let bg = movie.heroBg;
    if (!bg) bg = movie.poster;
    hero.style.backgroundImage = "url('" + bg + "')";
  }

  if (logo && movie.logo) {
    logo.src = movie.logo;
    logo.alt = movie.title;
  } else if (logoRow) {
    logoRow.insertAdjacentHTML("afterbegin", '<h1 class="movie-detail__title">' + movie.title + '</h1>');
    if (logo) logo.remove();
  }

  if (meta) {
    meta.innerHTML = 
      '<div class="movie-detail__badge">' +
        '<img class="movie-detail__star-icon" src="../img/icon/Interface/star.svg" alt="Star">' +
        '<span>' + movie.imdb + ' (IMDb)</span>' +
      '</div>' +
      '<div class="movie-detail__badge"><span>' + movie.year + '</span></div>' +
      '<div class="movie-detail__badge"><span>' + movie.duration + '</span></div>' +
      '<div class="movie-detail__badge"><span>' + movie.ageRating + '</span></div>' +
      '<div class="movie-detail__badge"><span>' + movie.genre + '</span></div>';
  }

  if (description) description.textContent = movie.description;
  
  if (buyButtonSpan) {
    let bPrice = Number(movie.buyPrice || 0).toFixed(2);
    buyButtonSpan.innerHTML = 'Buy <strong>$' + bPrice + '</strong>';
  }
  
  if (rentButtonSpan) {
    let rPrice = Number(movie.rentPrice || 0).toFixed(2);
    rentButtonSpan.innerHTML = 'Rent <strong>$' + rPrice + '</strong>';
  }

  if (mainVideo) {
    let vThumb = movie.thumbnail;
    if (!vThumb) vThumb = movie.poster;
    mainVideo.style.backgroundImage = "url('" + vThumb + "')";
  }

  if (thumbnails) {
    let gallery = [];
    if (movie.thumbnail) gallery.push(movie.thumbnail);
    else if (movie.poster) gallery.push(movie.poster);

    if (movie.trailerImages) {
      for (let i = 0; i < movie.trailerImages.length; i++) {
        gallery.push(movie.trailerImages[i]);
      }
    }

    let thumbHtml = "";
    for (let i = 0; i < gallery.length; i++) {
      if (i >= 3) break;
      thumbHtml += '<img src="' + gallery[i] + '" alt="preview">';
    }
    thumbnails.innerHTML = thumbHtml;
  }

  if (trailers) {
    let trailerImgs = movie.trailerImages;
    if (!trailerImgs || trailerImgs.length === 0) {
      trailerImgs = [movie.thumbnail || movie.poster];
    }

    let trailerHtml = "";
    for (let i = 0; i < trailerImgs.length; i++) {
      if (i >= 4) break;
      let timeValue = "02:" + (i + 4).toString().padStart(2, "0");
      trailerHtml += 
        '<div class="movie-detail-trailers__card">' +
          '<img class="movie-detail-trailers__image" src="' + trailerImgs[i] + '">' +
          '<img class="movie-detail-trailers__play" src="../img/icon/Media/play.svg">' +
          '<div class="movie-detail-trailers__content">' +
            '<span class="movie-detail-trailers__title">' + movie.title + ' - Trailer ' + (i + 1) + '</span>' +
            '<span class="movie-detail-trailers__time">' + timeValue + '</span>' +
          '</div>' +
        '</div>';
    }
    trailers.innerHTML = trailerHtml;
  }

  if (overview) {
    let relatedHtml = "";
    for (let i = 0; i < related.length; i++) {
      let item = related[i];
      let crown = "";
      if (i === 0) {
        crown = '<img class="movie-detail__premium-icon" src="../img/icon/Interface/star.svg">';
      }
      relatedHtml += 
        '<a class="movie-detail__movie-card" href="../html/movie-detail.html?id=' + encodeURIComponent(item.id) + '">' +
          '<img class="movie-detail__movie-image" src="' + item.poster + '">' +
          crown +
        '</a>';
    }
    overview.innerHTML = relatedHtml;
  }

  let buyBtn = document.querySelector(".movie-detail__btn--gradient");
  if (buyBtn) {
    buyBtn.onclick = function() {
      addMovieToCart(movie, "Buy", movie.buyPrice);
    };
  }

  let rentBtn = document.querySelector(".movie-detail__btn--outline");
  if (rentBtn) {
    rentBtn.onclick = function() {
      openRentCalendar(movie);
    };
  }

  let saveButton = document.querySelector(".movie-detail__trailer-btn");
  if (saveButton) {
    function updateSaveUI() {
      let isSaved = false;
      if (window.WatchlyAuth && window.WatchlyAuth.isMovieSaved) {
        isSaved = window.WatchlyAuth.isMovieSaved(movie.id);
      }
      
      if (isSaved) {
        saveButton.classList.add("is-saved");
        saveButton.setAttribute("aria-label", "Remove from save for later");
      } else {
        saveButton.classList.remove("is-saved");
        saveButton.setAttribute("aria-label", "Save for later");
      }
    }

    saveButton.onclick = function() {
      if (window.WatchlyAuth && window.WatchlyAuth.toggleSavedMovie) {
        window.WatchlyAuth.toggleSavedMovie({
          id: movie.id,
          title: movie.title,
          poster: movie.poster,
          genre: movie.genre,
          category: movie.category,
        });
      }
      updateSaveUI();
    };
    updateSaveUI();
  }

  function addMovieToCart(selectedMovie, subtitle, price, rentDate) {
    if (!rentDate) rentDate = "";
    if (window.WatchlyCart) {
      window.WatchlyCart.addItem({
        id: selectedMovie.id + "-" + subtitle.toLowerCase().replace(" ", "-"),
        movieId: selectedMovie.id,
        title: selectedMovie.title + " (HD)",
        subtitle: subtitle,
        rentDate: rentDate,
        price: Number(price || 0),
        poster: selectedMovie.poster,
        genre: selectedMovie.genre,
        category: selectedMovie.category,
      });
    }
  }

  function openRentCalendar(selectedMovie) {
    let modal = document.getElementById("rentCalendarModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "rentCalendarModal";
      modal.className = "rent-modal";
      document.body.appendChild(modal);
    }

    let today = new Date();
    let daysHtml = "";
    for (let i = 0; i < 14; i++) {
      let date = new Date();
      date.setDate(today.getDate() + i);
      let dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      let monthName = date.toLocaleDateString("en-US", { month: "short" });
      let dayNum = date.getDate();
      let isoDate = date.toISOString().slice(0, 10);
      let activeClass = (i === 0) ? " active" : "";
      
      daysHtml += 
        '<button class="rent-day' + activeClass + '" type="button" data-date="' + isoDate + '">' +
          '<strong>' + dayName + '</strong>' +
          '<span>' + dayNum + '</span>' +
          '<small>' + monthName + '</small>' +
        '</button>';
    }

    modal.innerHTML = 
      '<div class="rent-dialog">' +
        '<button class="rent-close" type="button">&times;</button>' +
        '<div class="rent-dialog-head">' +
          '<span>Rent movie</span>' +
          '<h2>' + selectedMovie.title + '</h2>' +
          '<p>Select the date and how many hours you want access.</p>' +
        '</div>' +
        '<div class="rent-calendar">' + daysHtml + '</div>' +
        '<div class="rent-hours">' +
          '<button type="button" data-hours="12">12h</button>' +
          '<button type="button" class="active" data-hours="24">24h</button>' +
          '<button type="button" data-hours="40">40h</button>' +
          '<button type="button" data-hours="72">72h</button>' +
        '</div>' +
        '<div class="rent-total">' +
          '<span>Total</span>' +
          '<strong id="rentTotal">$' + Number(selectedMovie.rentPrice || 0).toFixed(2) + '</strong>' +
        '</div>' +
        '<button class="rent-confirm" type="button">Add rent to cart</button>' +
      '</div>';

    let selectedDate = today.toISOString().slice(0, 10);
    let selectedHours = 24;
    modal.classList.add("active");

    modal.querySelector(".rent-close").onclick = function() {
      modal.classList.remove("active");
    };

    modal.onclick = function(event) {
      if (event.target === modal) modal.classList.remove("active");
    };

    let dayBtns = modal.querySelectorAll(".rent-day");
    for (let i = 0; i < dayBtns.length; i++) {
      dayBtns[i].onclick = function() {
        selectedDate = this.getAttribute("data-date");
        for (let j = 0; j < dayBtns.length; j++) {
          dayBtns[j].classList.remove("active");
        }
        this.classList.add("active");
      };
    }

    let hourBtns = modal.querySelectorAll(".rent-hours button");
    for (let i = 0; i < hourBtns.length; i++) {
      hourBtns[i].onclick = function() {
        selectedHours = Number(this.getAttribute("data-hours"));
        for (let j = 0; j < hourBtns.length; j++) {
          hourBtns[j].classList.remove("active");
        }
        this.classList.add("active");
        
        let multiplier = selectedHours / 24;
        let finalPrice = Number(selectedMovie.rentPrice || 0) * multiplier;
        modal.querySelector("#rentTotal").textContent = "$" + finalPrice.toFixed(2);
      };
    }

    modal.querySelector(".rent-confirm").onclick = function() {
      let multiplier = selectedHours / 24;
      let finalPrice = Number(selectedMovie.rentPrice || 0) * multiplier;
      addMovieToCart(selectedMovie, "Rent - " + selectedHours + " Hours", finalPrice, selectedDate);
      modal.classList.remove("active");
    };
  }
}

startMovieDetails();