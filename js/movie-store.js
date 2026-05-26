(function () {
  const STORAGE_KEY = "watchly_movies";
  const VERSION_KEY = "watchly_movies_version";
  const DEFAULT_VERSION = "default-movies-2026-05-26";
  const JSON_URL = "../data/movies.json";

  function readSavedMovies() {
    try {
      const savedMovies = localStorage.getItem(STORAGE_KEY);
      return savedMovies ? JSON.parse(savedMovies) : null;
    } catch (error) {
      return null;
    }
  }

  function saveMovies(movies) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies, null, 2));
    localStorage.setItem(VERSION_KEY, DEFAULT_VERSION);
  }

  async function readDefaultMovies() {
    if (Array.isArray(window.WATCHLY_DEFAULT_MOVIES)) {
      return window.WATCHLY_DEFAULT_MOVIES.map(normalizeMovie);
    }

    const response = await fetch(JSON_URL);
    const movies = await response.json();
    return movies.map(normalizeMovie);
  }

  async function loadMovies() {
    const savedMovies = readSavedMovies();
    const savedVersion = localStorage.getItem(VERSION_KEY);

    if (savedMovies && savedVersion === DEFAULT_VERSION) {
      const movies = savedMovies.map(normalizeMovie);
      saveMovies(movies);
      return movies;
    }

    try {
      const movies = await readDefaultMovies();
      saveMovies(movies);
      return movies;
    } catch (error) {
      return savedMovies ? savedMovies.map(normalizeMovie) : [];
    }
  }

  function slugify(value) {
    return String(value || "movie")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "movie-" + Date.now();
  }

  function isImagePath(path) {
    if (!path) return false;
    const value = String(path);
    return value.startsWith("../") || value.startsWith("http://") || value.startsWith("https://");
  }

  function fixLegacyImagePath(path) {
    if (!isImagePath(path)) return "";

    return String(path)
      .replace(/\.\.\/img\/movies\/movie \((\d+)\)\.webp/g, "../img/movie/$1/poster.webp")
      .replace(/\.\.\/img\/hero\/pack ([1-4])\//g, "../img/hero-calltoview/$1/")
      .replace(/\.\.\/movie-det\/1\/thumbs\/thumb\.webp/g, "../img/movie/1/poster.webp")
      .replace(/\.\.\/movie-det\/1\/trailer\/trailer \(1\)\.webp/g, "../img/movie/1/background.webp")
      .replace(/\.\.\/movie-det\/1\/trailer\/trailer \(2\)\.webp/g, "../img/movie/2/background.webp");
  }

  function normalizeMovie(movie) {
    const poster = fixLegacyImagePath(movie.poster) || "../img/movie/1/poster.webp";

    return {
      id: movie.id || slugify(movie.title),
      title: movie.title || "Untitled Movie",
      category: movie.category || movie.genre || "Movie",
      genre: movie.genre || "Drama",
      year: movie.year || "2026",
      duration: movie.duration || "120 min",
      ageRating: movie.ageRating || "PG-13",
      imdb: movie.imdb || "4.5",
      buyPrice: Number(movie.buyPrice || 0),
      rentPrice: Number(movie.rentPrice || 0),
      poster: poster,
      heroBg: fixLegacyImagePath(movie.heroBg) || poster,
      logo: fixLegacyImagePath(movie.logo),
      thumbnail: fixLegacyImagePath(movie.thumbnail) || poster,
      trailerImages: Array.isArray(movie.trailerImages)
        ? movie.trailerImages.map(fixLegacyImagePath).filter(Boolean)
        : [],
      description: movie.description || "",
      status: movie.status || "published",
      featured: Boolean(movie.featured),
    };
  }

  window.WatchlyStore = {
    loadMovies,
    saveMovies,
    normalizeMovie,
    slugify,
    storageKey: STORAGE_KEY,
  };
})();
