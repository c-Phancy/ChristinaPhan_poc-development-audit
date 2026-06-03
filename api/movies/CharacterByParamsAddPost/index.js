const makeInjectable = require("../../../helpers/makeInjectable");

const { Types } = require("mongoose");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    // Error check for params and params.movie_id and params.mainCharacterName
    if (!req.params || !req.params.movie_id || !req.params.mainCharacterName) {
      return res.status(400).json({
        error: "Missing Params from Request",
      });
    }

    let { movie_id, mainCharacterName } = req.params;

    // Error check for if movie_id is a valid ObjectId
    if (!Types.ObjectId.isValid(movie_id)) {
      return res.status(406).json({
        error: "Invalid movie_id - Must be an ObjectId",
      });
    }

    // Error check for if mainCharacterName is a valid string
    // Must have 3 or more characters
    if (String(mainCharacterName).length < 3) {
      return res.status(406).json({
        error:
          "Main Character Name is not valid. It must be at least three characters.",
      });
    }

    // Create new characters in a movie
    // Duplicates are accepted
    try {
      // Create a new document
      // If error, return status code 500 with error message
      const updatedMovie = await MovieModel.findOneAndUpdate(
        { _id: movie_id },
        {
          $push: {
            characters: { _id: new Types.ObjectId(), name: mainCharacterName },
          },
        },
        { new: true },
      );

      // // Return status code 404 if no movie found with movieId
      if (!updatedMovie) {
        return res.status(404).json({
          error: "No movie found",
        });
      }

      const { _id, title, characters, ...rest } = updatedMovie.toObject({
        versionKey: false,
      });

      return res.status(200).json({
        _id: { $oid: _id },
        name: title,
        ...rest,
        characters: characters.map((character) => ({
          _id: { $oid: character._id },
          name: character.name,
        })),
      });
    } catch (_) {
      return res.status(500).json({
        error: "Unexpected server error. Please try again later.",
      });
    }
  },
);
