import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const productsSchema = {
  name: {
    in: ["body"],
    isString: {
      errorMessage: "Name is a mandatory and needs to be in string",
    },
  },
  description: {
    in: ["body"],
    isString: {
      errorMessage: "Description is a mandatory and needs to be in string",
    },
  },
  brand: {
    in: ["body"],
    isString: {
      errorMessage: "Brand is a mandatory and needs to be in string",
    },
  },
  price: {
    in: ["body"],
    isNumeric: {
      errorMessage: "Price is a mandatory and needs to be in Number",
    },
  },
  category: {
    in: ["body"],
    isString: {
      errorMessage: "Category is a mandatory and needs to be in string",
    },
  },
};

const reviewsSchema = {
  comment: {
    in: ["body"],
    isString: {
      errorMessage: "Comment is a mandatory and needs to be in string",
    },
  },
  rate: {
    in: ["body"],
    isNumeric: {
      errorMessage: "Rate is a mandatory and needs to be in Number",
    },
  },
};

export const checkProductSchema = checkSchema(productsSchema);
export const checkReviewSchema = checkSchema(reviewsSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);

  console.log(errors.array());
  if (errors.isEmpty()) {
    next();
  } else {
    next(
      createHttpError(400, "Errors during product validation", {
        errorsList: errors.array(),
      })
    );
  }
};
