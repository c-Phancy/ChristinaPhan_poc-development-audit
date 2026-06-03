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
    const requiredFields = ["movieName", "releaseYear"];

    for (let property of requiredFields) {
      if (req.body[property] === undefined) {
        return res.status(406).json({
          error: `No ${property.replace(/([A-Z])/g, " $1").toLowerCase()} found`,
        });
      }
    }

    let { movieName, releaseYear } = req.body;

    // Error check for if movieName is a valid string
    // Must have more than 3 characters
    if (String(movieName).length <= 3) {
      return res.status(406).json({
        error: "Invalid movie name",
      });
    }

    // Error check for if releaseYear is a valid number
    // Must be between 1990 and the current year (inclusive)
    const currentYear = new Date().getFullYear();
    if (releaseYear < 1990 || releaseYear > currentYear) {
      return res.status(406).json({
        error: "Invalid release year",
      });
    }

    // Check for duplicate movieName|releaseYear
    // Return status code 409 if document already exists
    try {
      const query = await MovieModel.findOne({
        title: movieName,
        releaseYear: releaseYear,
      });

      if (query) {
        return res.status(409).json({
          error: `Movie with title: ${movieName} and release year: ${releaseYear} already exists`,
        });
      } else {
        // Create a new document
        // If error, return status code 500 with error message
        const _id = new Types.ObjectId();

        const savedMovie = await MovieModel({
          _id,
          title: movieName,
          releaseYear: releaseYear,
          characters: [],
        })
          .save()
          .then((movie) => {
            const movieObj = movie.toObject({ versionKey: false });

            const { title, _id, ...rest } = movieObj;

            return res
              .status(200) 
              .json({ _id: { $oid: _id }, name: title, ...rest });
          });
      }
    } catch (err) {
      return res.status(500).json({
        error: "Unexpected server error. Please try again later.",
      });
    }
  },
);
