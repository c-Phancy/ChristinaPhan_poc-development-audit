const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    // Error check for params and params.characterName
    if (!req.params || !req.params.characterName) {
      return res.status(400).json({
        error: "Missing Params from Request",
      });
    }

    // Fetch array of movies based on character name (case-insensitive)
    // If error, return status code 500 with error message
    MovieModel.find({
      "characters.name": {
        $regex: new RegExp(`^${req.params.characterName}$`, "i"),
      },
    })
      .lean()
      .then((results) => {
        if (results.length === 0) {
          return res.status(404).json({
            error: "No movie(s) with this Character were found",
          });
        }

        // Return status code 200 with an array of movies
        return res.status(200).json(
          results.map((movie) => ({
            _id: { $oid: movie._id.toString() },
            title: movie.title,
            releaseYear: movie.releaseYear,
          })),
        );
      })
      .catch((_) => {
        return res
          .status(500)
          .json({ error: "Unexpected server error. Please try again later." });
      });
  },
);
