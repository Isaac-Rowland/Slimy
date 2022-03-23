function renderSearchBar() {
  document.querySelector("#page").innerHTML = `
  <section class='search'>
    <h2>Search Movies</h2>
      <div class="search-container">  
      <input id="search" type='text' name='movie-title' placeholder="Search...">
      </input>
      <span class="search-btn" onClick="renderMovieList()">
        <i class="fas fa-search"></i> 
      </span> 
      </div>
  </section>
  <section class='movies-default'>
  </section>
  `;
  renderTopMovies();
}

function renderTopMovies() {
  axios.get("/api/movies").then((res) => {
    const moviesIdStr = res.data.map((movie) => movie.movie_id);
    // const moviesIdInPar = "(" + moviesIdStr + ")";
    console.log(moviesIdStr);
    axios.get(`/api/movies/stored/${moviesIdStr}`).then((movie) => {
      console.log(movie.data);
      const movieList = movie.data
        .map((movie) => {
          return `
          <div>
            <img src="${movie.poster}" alt="img" onClick="renderMovieDetail('${movie.imdbid}')">
            <div class='title'>${movie.title}</div>
            <div class='year'>${movie.year}</div>
          </div>
        `;
        })
        .join("");
      document.querySelector(".movies-default").innerHTML = movieList;
    });
  });
}

function renderMovieList() {
  const movieTitle = document.querySelector("#search").value;
  axios
    .get(`https://omdbapi.com?apikey=2f6435d9&s=${movieTitle}`)
    .then((res) => {
      const movieList = res.data.Search.map((movie) => {
        const title = movie.Title;
        const posterUrl = movie.Poster;
        const imdbId = movie.imdbID;
        axios
          .get(`https://omdbapi.com?apikey=2f6435d9&i=${imdbId}`)
          .then((res) => {
            const movie = res.data;
            axios.post("/api/movies", movie);
          });
        if (!!state.user.userName) {
          return `
            <div>
              <span id="favorite-btn" class="material-icons" onClick="renderFavoriteButton(event, '${imdbId}')">favorite_border</span>
              <h3>${title}</h3>
              <img src='${posterUrl}' onClick="renderMovieDetail('${imdbId}')">
            </div>
          `;
        } else {
          return `
                <div>
                <h3>${title}</h3>
                <img src='${posterUrl}' onClick="renderMovieDetail('${imdbId}')">
                </div>
              `;
        }
      }).join("");
      document.querySelector(".movies-default").innerHTML = movieList;
    });
}

function renderMovieDetail(imdbId) {
  axios.get(`/api/movies/${imdbId}`).then((res) => {
    const movie = res.data;
    let favoriteIconDOM = "";
    if (!!state.user.userName) {
      favoriteIconDOM = "favorite_border";
    }
    const movieDetail = `
        <div>
        <span id="favorite-btn" class="material-icons"onClick="renderFavoriteButton(event, '${imdbId}')">${favoriteIconDOM}</span>
          <h3>${movie.title}</h3>
          <h5>Actors: ${movie.actors}</h5>
          <p>Description: ${movie.description}</p>
          <p>Year: ${movie.year}</p>
        </div>
        <div>
          <img src="${movie.poster}"></img>

        </div>
        <section id=reviews-box><div class="reviews-div"></div></section>
        <div class="rating">
        <i class="rating__star far fa-star"></i>
        <i class="rating__star far fa-star"></i>
        <i class="rating__star far fa-star"></i>
        <i class="rating__star far fa-star"></i>
        <i class="rating__star far fa-star"></i>
       </div>
        <form id="add-comment" onSubmit='createReviewsMovie(event, ${state.user.userId}, ${movie.id})'>
        <div class="rating">
          <i class="rating__star far fa-star"></i>
          <i class="rating__star far fa-star"></i>
          <i class="rating__star far fa-star"></i>
          <i class="rating__star far fa-star"></i>
          <i class="rating__star far fa-star"></i>
        </div>
          <fieldset>
            <label for="">comment:</label>
           
            <section class="error"></section>
            ​<textarea id="txtArea" rows="10" cols="45" name="comment"></textarea>
          </fieldset>
          <button class="button-56" role="button">Submit</button>
        </form>
      `;
    document.querySelector(".movies-default").innerHTML = movieDetail;
    renderMovieReviews(movie.id);
    const ratingStars = [...document.getElementsByClassName("rating__star")];
    rating(ratingStars, movie.id, state.user.userId);
    function rating(stars, movieId, userId) {
      const starClassActive = "rating__star fas fa-star";
      const starClassInactive = "rating__star far fa-star";
      const starsLength = stars.length;
      let i;
      stars.map((star) => {
        star.onclick = () => {
          i = stars.indexOf(star);

          if (star.className === starClassInactive) {
            for (i; i >= 0; --i) stars[i].className = starClassActive;
          } else {
            for (i; i < starsLength; ++i)
              stars[i].className = starClassInactive;
          }
          const rating = document.querySelectorAll(".rating .fas").length;
          const data = { movieId, userId, rating };
          console.log(data);
          axios
            .put(`/api/reviews`, data)
            .then((res) => res.data)
            .catch((error) => {
              let errorDOM = document.querySelector(".movies-default .error");
              errorDOM.textContent = error.response.data.message;
            });
        };
      });
    }
  });
}

function renderMovieReviews(movieId) {
  axios
    .get(`/api/reviews/${movieId}`)
    .then((res) => res.data)
    .then((res) => {
      // if (res.review) {
      console.log(res);
      const reviewsBox = res
        .map((movie) => {
          return `
          <p>"${movie.review}"</p>
          <ul>              
            <li class="material-icons like-icon">thumb_up</li>
            <li class="material-icons dislike-icon">thumb_down</li>
        </ul>
        `;
        })
        .slice(0, 5)
        .join("");
      // }

      document.querySelector("#reviews-box .reviews-div").innerHTML =
        reviewsBox;
    });
}

function createReviewsMovie(event, userId, movieId) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  data.userId = userId;
  data.movieId = movieId;
  // data.rating = rating;
  console.log(data);
  axios
    .post("/api/reviews", data)
    .then((res) => res.data)
    .then(() => renderMovieReviews(movieId))
    .catch((error) => {
      let errorDOM = document.querySelector(".movies-default .error");
      errorDOM.textContent = error.response.data.message;
    });
}
