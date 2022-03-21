const express = require("express");
const res = require("express/lib/response");
const { updateRating } = require("../models/reviews");
const Reviews = require("../models/reviews");

const router = express.Router();

router.get("/:movieId", (req, res) => {
  const movieId = req.params.movieId;
  console.log(movieId);
  Reviews.findMovieReviews(movieId).then((comments) => res.json(comments));
});

router.post("/", (req, res) => {
  const { comment, movieId, userId } = req.body;

  if (!!userId) {
    Reviews.doesExist(userId, movieId).then((data) => {
      if (data > 0) {
        res
          .status(401)
          .json({ message: "You already left a review on this movie" });
      } else {
        Reviews.create(userId, movieId, 3, comment).then(() =>
          res.json({ message: "success" })
        );
        //   const review =
        //   Reviews.create(user_id, movieId, Rating, Review);
      }
    });
  } else {
    res.status(401).json({ message: "Please sign in to leave a review" });
  }
});

router.put("/", (req, res) => {
  const { movieId, userId, rating } = req.body;
  if (!!userId) {
    Reviews.doesExist(userId, movieId).then((data) => {
      if (data > 0) {
        Reviews.updateRating(userId, movieId, rating).then(() => {});
      } else {
        Reviews.create(userId, movieId, rating, "").then(() => {});
      }
    });
  } else {
    res.status(401).json({ message: "Please sign in to leave a review" });
  }
});

module.exports = router;
