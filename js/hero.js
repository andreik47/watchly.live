let moviesData = [
  {
    id: "hero-comedy-drama",
    title: "Comedy Drama Spotlight",
    category: "COMEDY - DRAMA",
    logo: "../img/hero-calltoview/1/logo.svg",
    imdb: "7.2 (IMDb)",
    year: "2025",
    rating: "TV-14",
    description: "A chance meeting on a train leads two strangers to spend an impulsive day together in New York, sharing secrets and exploring the city without revealing their names.",
    thumbnail: "../img/hero-calltoview/tumbs-1.svg",
    heroBg: "../img/hero-calltoview/1/background.webp",
  },
  {
    id: "hero-sci-fi-thriller",
    title: "Sci-Fi Thriller Spotlight",
    category: "SCI-FI - THRILLER",
    logo: "../img/hero-calltoview/2/logo.svg",
    imdb: "8.1 (IMDb)",
    year: "2024",
    rating: "PG-13",
    description: "Stranded alone on a crumbling space station, an astronaut receives a mysterious signal that forces him to question reality and fight to return to Earth.",
    thumbnail: "../img/hero-calltoview/tumbs-2.svg",
    heroBg: "../img/hero-calltoview/2/background.webp",
  },
  {
    id: "hero-action-adventure",
    title: "Action Adventure Spotlight",
    category: "ACTION - ADVENTURE",
    logo: "../img/hero-calltoview/3/logo.svg",
    imdb: "6.8 (IMDb)",
    year: "2026",
    rating: "TV-R",
    description: "Two small-time thieves, Pumpkin and Honey Bunny, reminisce about past robberies over breakfast. Pumpkin suddenly decides they should rob the diner, convinced everyone inside is an easy target.",
    thumbnail: "../img/hero-calltoview/tumbs-3.svg",
    heroBg: "../img/hero-calltoview/3/background.webp",
  },
  {
    id: "hero-horror-mystery",
    title: "Horror Mystery Spotlight",
    category: "HORROR - MYSTERY",
    logo: "../img/hero-calltoview/4/logo.svg",
    imdb: "5.9 (IMDb)",
    year: "2023",
    rating: "R",
    description: "A family moves into a secluded Victorian mansion, only to discover its dark past awakens and begins to twist their minds and darkest fears.",
    thumbnail: "../img/hero-calltoview/tumbs-4.svg",
    heroBg: "../img/hero-calltoview/4/background.webp",
  },
];

let movieCategory = document.getElementById("movieCategory");
let movieLogo = document.getElementById("movieLogo");
let movieTags = document.getElementById("movieTags");
let movieDescription = document.getElementById("movieDescription");
let thumbnailsContainer = document.getElementById("thumbnailsContainer");
let currentSlideText = document.getElementById("currentSlide");
let totalSlidesText = document.getElementById("totalSlides");
let progressFill = document.getElementById("progressFill");

let prevBtn = document.getElementById("prevBtn");
let nextBtn = document.getElementById("nextBtn");
let playBtn = document.getElementById("playBtn");
let saveBtn = document.getElementById("saveBtn");
let saveText = document.getElementById("saveText");
let muteBtn = document.getElementById("muteBtn");

let searchInputs = document.querySelectorAll(".nav-search-input");
let heroBanner = document.querySelector(".hero-banner");

let currentIndex = 0;
let isMuted = false;
let isSaved = false;
let totalSlides = moviesData.length;

if (totalSlidesText) {
  totalSlidesText.textContent = totalSlides;
}

function renderThumbnails() {
  if (!thumbnailsContainer) return;
  
  thumbnailsContainer.innerHTML = "";
  
  for (let i = 0; i < moviesData.length; i++) {
    let movie = moviesData[i];
    
    if (i === currentIndex) {
      let activeDiv = document.createElement("div");
      activeDiv.className = "active-thumb";
      activeDiv.style.backgroundImage = "url('" + movie.thumbnail + "')";
      activeDiv.innerHTML = '<img src="../img/hero-calltoview/active-arrow.svg" alt="Active">';
      activeDiv.onclick = function() {
        goToSlide(i);
      };
      thumbnailsContainer.appendChild(activeDiv);
    } else {
      let thumbImg = document.createElement("img");
      thumbImg.src = movie.thumbnail;
      thumbImg.onclick = function() {
        goToSlide(i);
      };
      thumbnailsContainer.appendChild(thumbImg);
    }
  }
}

function updateHeroUI() {
  let movie = moviesData[currentIndex];

  movieCategory.textContent = movie.category;
  movieLogo.src = movie.logo;
  movieDescription.textContent = movie.description;
  
  movieTags.innerHTML = 
    '<div class="tag"><img src="../img/icon/Interface/star.svg" alt="IMDb"><span>' + movie.imdb + '</span></div>' +
    '<div class="tag"><span>' + movie.year + '</span></div>' +
    '<div class="tag"><span>' + movie.rating + '</span></div>';

  if (currentSlideText) {
    currentSlideText.textContent = currentIndex + 1;
  }
  
  if (progressFill) {
    let percent = ((currentIndex + 1) / totalSlides) * 100;
    progressFill.style.width = percent + "%";
  }

  if (heroBanner) {
    heroBanner.style.setProperty("--hero-bg", "url('" + movie.heroBg + "')");
  }

  renderThumbnails();
}

function goToSlide(index) {
  currentIndex = index;
  updateHeroUI();
}

function handleNext() {
  currentIndex = currentIndex + 1;
  if (currentIndex >= totalSlides) {
    currentIndex = 0;
  }
  updateHeroUI();
}

function handlePrev() {
  currentIndex = currentIndex - 1;
  if (currentIndex < 0) {
    currentIndex = totalSlides - 1;
  }
  updateHeroUI();
}

function handleToggleSave() {
  isSaved = !isSaved;
  
  if (isSaved) {
    saveText.textContent = "Saved";
    saveBtn.style.color = "#fb1122";
  } else {
    saveText.textContent = "Save for later";
    saveBtn.style.color = "#ffffff";
  }
}

function handleToggleMute() {
  isMuted = !isMuted;
  if (isMuted) {
    muteBtn.title = "Unmute";
  } else {
    muteBtn.title = "Mute";
  }
}

function syncSearch() {
  let value = this.value;
  for (let i = 0; i < searchInputs.length; i++) {
    searchInputs[i].value = value;
  }
}

function handleSearchEnter(event) {
  if (event.key === "Enter") {
    for (let i = 0; i < searchInputs.length; i++) {
      searchInputs[i].value = "";
    }
  }
}

if (heroBanner) {
  prevBtn.onclick = handlePrev;
  nextBtn.onclick = handleNext;
  saveBtn.onclick = handleToggleSave;
  muteBtn.onclick = handleToggleMute;
  
  playBtn.onclick = function() {
    console.log("Playing...");
  };

  for (let i = 0; i < searchInputs.length; i++) {
    searchInputs[i].oninput = syncSearch;
    searchInputs[i].onkeypress = handleSearchEnter;
  }

  updateHeroUI();
}