const apiKey = "83d6ce566937e124e0fe7a064447c5da";
const popularMoviesContainer = document.getElementById("popular-movies");
const searchbtn = document.getElementById("searchbtn");
const searchedMovie = document.getElementById("searchInput");
const favouriteMovies = document.getElementById("Favourite-movies");
let allMovies = [];
let favMovies = [];

const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
};

async function fetchMoviesData() {
  try {
    showLoading(popularMoviesContainer);
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=1`
    );
    const data = await response.json();
    allMovies = data.results.slice(0, 10); 
    showPopularMovies(allMovies);
  } catch (error) {
    showNotification(
      "Failed to connect to the movie database!",
      NOTIFICATION_TYPES.ERROR
    );
    console.log("We got an error: ", error);
  }
}

function showLoading(container) {
  container.innerHTML = `
        <div class="col-span-full flex justify-center items-center py-12">
            <div class="loading-spinner"></div>
        </div>
    `;
}

function showNotification(message, type = NOTIFICATION_TYPES.SUCCESS) {
  // Remove any existing notifications
  const existingNotification = document.querySelector(".notification-toast");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.classList.add(
    "notification-toast",
    "fixed",
    "top-4",
    "left-1/2",
    "transform",
    "-translate-x-1/2",
    "z-50",
    "py-3",
    "px-6",
    "rounded-lg",
    "shadow-lg",
    "transition-opacity",
    "duration-300"
  );

  // Add type-specific styles
  if (type === NOTIFICATION_TYPES.ERROR) {
    notification.classList.add("bg-red-500", "text-white");
  } else {
    notification.classList.add("bg-green-500", "text-white");
  }

  notification.textContent = message;
  document.body.appendChild(notification);

  // Remove the notification after 3 seconds
  setTimeout(() => {
    notification.classList.add("opacity-0");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function createMovieCard(movie, isFavorite = false) {
  const card = document.createElement("div");
  card.classList.add(
    "movie-card",
    "bg-gray-800",
    "rounded-lg",
    "overflow-hidden",
    "flex",
    "flex-col"
  );

  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "placeholder-image.jpg";

  card.innerHTML = `
        <img 
            src="${imageUrl}" 
            alt="${movie.title}" 
            class="movie-poster w-full rounded-t-lg"
            onerror="this.src='placeholder-image.jpg'"
        />
        <div class="p-4 flex flex-col flex-grow">
            <h3 class="text-lg font-bold text-white mb-2 line-clamp-2">${
              movie.title
            }</h3>
            <div class="flex-grow">
                <p class="text-sm text-gray-300 mb-1">${movie.release_date}</p>
                <p class="text-sm text-yellow-400">Rating: ${movie.vote_average.toFixed(
                  1
                )}</p>
            </div>
            <button class="${isFavorite ? "remove-fav-btn" : "fav-btn"} 
                mt-4 px-4 py-2 text-sm rounded
                ${
                  isFavorite
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-yellow-400 hover:bg-yellow-500"
                } 
                text-black transition-colors">
                ${isFavorite ? "Remove Favorite" : "Add to Favorite"}
            </button>
        </div>
    `;

  return card;
}

function showPopularMovies(movies) {
  popularMoviesContainer.innerHTML = "";

  if (movies.length === 0) {
    popularMoviesContainer.innerHTML = `
            <div class="col-span-full text-center text-white text-lg py-8">
                No movies found. Try a different search.
            </div>
        `;
    return;
  }

  movies.forEach((movie) => {
    const movieCard = createMovieCard(movie);
    popularMoviesContainer.appendChild(movieCard);

    const favBtn = movieCard.querySelector(".fav-btn");
    favBtn?.addEventListener("click", () => {
      if (favMovies.some((favMovie) => favMovie.id === movie.id)) {
        showNotification(
          `${movie.title} is already in favorites!`,
          NOTIFICATION_TYPES.ERROR
        );
      } else {
        favMovies.push(movie);
        addFavMovies();
        showNotification(`${movie.title} added to favorites!`);
      }
    });
  });
}

function showSearchedMovies(e) {
  e.preventDefault();
  const searchedMovieValue = searchedMovie.value.toLowerCase().trim();

  if (!searchedMovieValue) {
    showPopularMovies(allMovies);
    return;
  }

  const filteredMovies = allMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchedMovieValue)
  );

  showPopularMovies(filteredMovies);
  searchedMovie.value = "";
}

function addFavMovies() {
  favouriteMovies.innerHTML = "";

  if (favMovies.length === 0) {
    favouriteMovies.innerHTML = `
            <div class="col-span-full text-center text-white text-lg py-8">
                No favorite movies yet. Add some from the popular movies section!
            </div>
        `;
    return;
  }

  favMovies.forEach((movie) => {
    const movieCard = createMovieCard(movie, true);
    favouriteMovies.appendChild(movieCard);

    const removeFavBtn = movieCard.querySelector(".remove-fav-btn");
    removeFavBtn?.addEventListener("click", () => {
      favMovies = favMovies.filter((favMovie) => favMovie.id !== movie.id);
      localStorage.setItem("Movies", JSON.stringify(favMovies));
      addFavMovies();
      showNotification(`${movie.title} removed from favorites!`);
    });
  });

  localStorage.setItem("Movies", JSON.stringify(favMovies));
}

function loadFavMoviesFromStorage() {
  const savedMovies = JSON.parse(localStorage.getItem("Movies")) || [];
  favMovies = savedMovies;
  addFavMovies();
}

// Event Listeners
searchbtn.addEventListener("click", showSearchedMovies);
searchedMovie.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    showSearchedMovies(e);
  }
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchMoviesData();
  loadFavMoviesFromStorage();
});
