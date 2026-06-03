const makeInjectable = require("../../../helpers/makeInjectable");

const { Types } = require("mongoose");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    // Error check for body
    if (!req.body) {
      return res.status(400).json({
        error: "Missing Body of Request",
      });
    }

    // Error check for required fields included in body
    const requiredFields = ["movieId", "characterName"];

    for (let property of requiredFields) {
      if (req.body[property] === undefined) {
        const { propertyName, error } =
          property == "movieId"
            ? { propertyName: "movie id", error: "found" }
            : { propertyName: "Main Character Name", error: "Provided" };

        return res.status(404).json({
          error: `No ${propertyName} ${error}`,
        });
      }
    }

    let { movieId, characterName } = req.body;

    // Error check for if movieId is a valid ObjectId
    if (!Types.ObjectId.isValid(movieId)) {
      return res.status(406).json({
        error: "Invalid movieId - Must be an ObjectId",
      });
    }

    // Error check for if characterName is a valid string
    // Must have 3 or more characters
    if (String(characterName).length < 3) {
      return res.status(406).json({
        error:
          "Character Name is not valid. It must be at least three characters.",
      });
    }

    // Create new characters in a movie
    // Duplicates are accepted
    try {
      // Create a new document
      // If error, return status code 500 with error message
      const updatedMovie = await MovieModel.findOneAndUpdate(
        { _id: movieId },
        {
          $push: {
            characters: { _id: new Types.ObjectId(), name: characterName },
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
