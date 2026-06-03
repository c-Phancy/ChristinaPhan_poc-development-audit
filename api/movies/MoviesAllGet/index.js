const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: /* istanbul ignore next */ () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      let movies = await MovieModel.find();
      const sortedMovies = (movies || []).sort(
        (a, b) => a.releaseYear - b.releaseYear,
      );
      const formattedMovies = sortedMovies.map((movie) => {
        return {
          ...movie.stripCharacterIdsFromDoc(),
        };
      });
      return res.status(200).json(formattedMovies);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
