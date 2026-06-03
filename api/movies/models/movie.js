/* istanbul ignore file */
const mongoose = require("mongoose");
const MovieSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: String,
  releaseYear: Number,
  characters: [
    {
      name: String,
      race: String,
    },
  ],
});

MovieSchema.statics.getAllMovies = function () {
  return this.find({});
};

MovieSchema.statics.stripCharacterIds = function (movie) {
  // 1. Map through characters and strip their _id fields
  const cleanCharacters = (movie.characters || []).map(
    ({ _id, ...charWithoutId }) => {
      return charWithoutId;
    },
  );

  return cleanCharacters;
};

MovieSchema.methods.stripCharacterIdsFromDoc = function () {
  const movieObj = { ...this._doc };

  delete movieObj.__v;

  if (movieObj.characters && Array.isArray(movieObj.characters)) {
    movieObj.characters = movieObj.characters.map((character) => {
      const rawChar = character._doc ? { ...character._doc } : { ...character };
      const { _id, ...characterWithoutId } = rawChar;
      return characterWithoutId;
    });
  }

  return movieObj;
};

module.exports = mongoose.model("movies", MovieSchema, "ChristinaPhan");
