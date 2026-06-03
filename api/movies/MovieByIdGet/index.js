const makeInjectable = require("../../../helpers/makeInjectable");

const { Types } = require("mongoose");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    // Error check for params and params.id
    if (!req.params || !req.params.id) {
      return res.status(400).json({
        error: "Missing Params from Request",
      });
    }

    // Error check for if id is a valid ObjectId
    let _id = req.params.id;

    if (!Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        error: "Invalid id - Must be an ObjectId",
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

        // Return status code 200 with movie
        return res
          .status(200)
          .json({ ...results._doc, _id: { $oid: results._id.toString() } });
      })
      .catch((_) => {
        return res
          .status(500)
          .json({ error: "Unexpected server error. Please try again later." });
      });
  },
);
