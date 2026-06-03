const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    // Error check for params and params.startReleaseYear and params.endReleaseYear
    if (
      !req.params ||
      !req.params.startReleaseYear ||
      !req.params.endReleaseYear
    ) {
      return res.status(400).json({
        error: "Missing Params from Request",
      });
    }

    const startReleaseYear = Number(req.params.startReleaseYear);
    const endReleaseYear = Number(req.params.endReleaseYear);

    const years = { startReleaseYear, endReleaseYear };

    // Error check for if startReleaseYear and endReleaseYear are integers
    // If error, return status code 406 and error message

    for (let param in years) {
      const num = years[param];

      if (isNaN(num)) {
        return res.status(406).json({
          error: `${
            param === "startReleaseYear"
              ? "Starting release year"
              : "Ending release year"
          } must be a number`,
        });
      }
    }

    // Error check for if startReleaseYear and endReleaseYear are within a valid range (2000 - 2020)
    // If error, return status code 406 and error message
    for (let param in years) {
      const num = years[param];

      if (num < 2000 || num > 2020) {
        return res.status(406).json({
          error: `${
            param === "startReleaseYear"
              ? "Starting release year"
              : "Ending release year"
          } must be between 2000 and 2020`,
        });
      }
    }

    // Error check for if startReleaseYear is less than or equal to endReleaseYear
    // If error, return status code 406 and error message
    if (startReleaseYear > endReleaseYear) {
      return res.status(406).json({
        error:
          "Starting release year must be less than or equal to ending release year",
      });
    }

    // Fetch array of movies based on release years
    // If error, return status code 500 with error message
    MovieModel.find({
      releaseYear: { $gte: startReleaseYear, $lte: endReleaseYear },
    })
      .lean()
      .then((results) => {
        if (results.length === 0) {
          return res.status(404).json({
            error: "No movies found",
          });
        }

        // Return status code 200 with an array of movies
        return res.status(200).json(
          results.map((movie) => ({
            ...movie,
            _id: { $oid: movie._id.toString() },
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
