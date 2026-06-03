const makeInjectable = require("../../../helpers/makeInjectable");

const { Types } = require("mongoose");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    // Error check for params and params.movieId and params.characterName
    if (!req.params || !req.params.movieId || !req.params.characterName) {
      return res.status(400).json({
        error: "Missing Params from Request",
      });
    }

    // Error check for if movieId is a valid ObjectId
    let _id = req.params.movieId;

    if (!Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        error: "Invalid movieId - Must be an ObjectId",
      });
    }

    // Fetch movie by id
    MovieModel.findById(_id)
      .then((results) => {
        // Return status code 404 if no movie found
        if (!results) {
          return res.status(404).json({
            error: "No movie found",
          });
        }

        let character = results.characters.find(
          (character) =>
            character.name.toLowerCase() ===
            req.params.characterName.toLowerCase(),
        );

        if (!character) {
          return res.status(404).json({
            error: "No character found",
          });
        }

        // Return status code 200 with movie
        return res.status(200).json({
          movie: results.title,
          name: character.name,
          race: character.race,
        });
      })
      .catch((_) => {
        return res
          .status(500)
          .json({ error: "Unexpected server error. Please try again later." });
      });
  },
);
