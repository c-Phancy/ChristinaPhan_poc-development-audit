const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    // Error check for params and params.race
    if (!req.params || !req.params.race) {
      return res.status(400).json({
        error: "Missing Params from Request",
      });
    }

    // Fetch array of movies based on race (case-insensitive)
    // If error, return status code 500 with error message
    MovieModel.find({
      "characters.race": {
        $regex: new RegExp(`^${req.params.race}$`, "i"),
      },
    })
      .lean()
      .then((results) => {
        if (results.length === 0) {
          return res.status(404).json({
            error: `No movie(s) with characters of the ${req.params.race} race were found`,
          });
        }

        // Filter characters in each movie to only include those of the specified race
        let filteredResults = results.map((movie) => {
          const cleanCharacters = MovieModel.stripCharacterIds(movie);

          let filteredCharacters = cleanCharacters.filter(
            (character) =>
              character.race.toLowerCase() === req.params.race.toLowerCase(),
          );

          return {
            ...movie,
            _id: { $oid: movie._id.toString() },
            characters: filteredCharacters,
          };
        });

        // Return status code 200 with an array of movies
        return res.status(200).json(filteredResults);
      })
      .catch((_) => {
        return res
          .status(500)
          .json({ error: "Unexpected server error. Please try again later." });
      });
  },
);
