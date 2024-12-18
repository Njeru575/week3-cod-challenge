document.addEventListener("DOMContentLoaded", () => {
  const filmsList = document.getElementById("films");
  const movieDetail = document.getElementById("movie-detail");
  const movieTitle = document.getElementById("movie-title");
  const moviePoster = document.getElementById("movie-poster");
  const movieRuntime = document.getElementById("movie-runtime");
  const movieShowtime = document.getElementById("movie-showtime");
  const movieDescription = document.getElementById("movie-description");
  const availableTickets = document.getElementById("available-tickets");
  const buyTicketButton = document.getElementById("buy-ticket");

  // Fetch films data
  fetch("http://localhost:3000/films")
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(films => {
      // Populate films list
      films.forEach(film => {
        const li = document.createElement("li");
        li.textContent = film.title;
        li.classList.add("film", "item");
        li.dataset.id = film.id;
        if (film.tickets_sold >= film.capacity) {
          li.classList.add("sold-out");
        }
        filmsList.appendChild(li);
      });

      // Add event listener to each movie in the menu (after list is populated)
      const filmItems = document.querySelectorAll(".film.item");
      filmItems.forEach(item => {
        item.addEventListener("click", () => {
          const filmId = item.dataset.id;
          showMovieDetails(filmId, films);
        });
      });
    })
    .catch(error => {
      console.error("There was a problem with the fetch operation:", error);
    });

  // Show movie details when clicked
  function showMovieDetails(filmId, films) {
    const film = films.find(f => f.id == filmId);
    movieTitle.textContent = film.title;
    moviePoster.src = film.poster;
    movieRuntime.textContent = `Runtime: ${film.runtime} minutes`;
    movieShowtime.textContent = `Showtime: ${film.showtime}`;
    movieDescription.textContent = film.description;
    availableTickets.textContent = film.capacity - film.tickets_sold;

    // Enable/Disable "Buy Ticket" button based on availability
    if (film.tickets_sold < film.capacity) {
      buyTicketButton.disabled = false;
      buyTicketButton.removeEventListener("click", buyTicketHandler); // Remove previous listener
      buyTicketButton.addEventListener("click", buyTicketHandler); // Add new listener
    } else {
      buyTicketButton.disabled = true;
    }

    // Buy ticket handler
    function buyTicketHandler() {
      buyTicket(filmId);
    }
  }

  // Buy ticket function
  function buyTicket(filmId) {
    fetch(`http://localhost:3000/films/${filmId}`)
      .then(response => response.json())
      .then(film => {
        if (film.tickets_sold < film.capacity) {
          film.tickets_sold += 1;
          updateTicketsSold(filmId, film.tickets_sold);
        }
      })
      .catch(error => {
        console.error("Error buying ticket:", error);
      });
  }

  // Update tickets sold on the server
  function updateTicketsSold(filmId, ticketsSold) {
    fetch(`http://localhost:3000/films/${filmId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ tickets_sold: ticketsSold })
    })
      .then(response => response.json())
      .then(updatedFilm => {
        // Update UI with new available tickets
        availableTickets.textContent = updatedFilm.capacity - updatedFilm.tickets_sold;
        // Disable button if sold out
        if (updatedFilm.tickets_sold >= updatedFilm.capacity) {
          buyTicketButton.disabled = true;
          document.querySelector(`[data-id="${updatedFilm.id}"]`).classList.add("sold-out");
        }
      })
      .catch(error => {
        console.error("Error updating tickets sold:", error);
      });
  }
});
