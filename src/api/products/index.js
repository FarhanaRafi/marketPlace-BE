import Express from "express";
import {
  getProducts,
  saveProductCover,
  writeProducts,
  getReviews,
  writeReviews,
} from "../../lib/fs-tool.js";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import multer from "multer";
import { extname } from "path";
import {
  checkProductSchema,
  checkReviewSchema,
  triggerBadRequest,
} from "./validation.js";

const productRouter = Express.Router();

productRouter.post(
  "/",
  checkProductSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newProducts = {
        ...req.body,
        _id: uniqid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const productsArray = await getProducts();
      productsArray.push(newProducts);
      await writeProducts(productsArray);
      res.status(201).send({ _id: newProducts._id });
    } catch (error) {
      next(error);
    }
  }
);

productRouter.get("/", async (req, res, next) => {
  try {
    const products = await getProducts();
    if (req.query && req.query.category) {
      const filteredProducts = products.filter(
        (product) =>
          product.category.toLowerCase() === req.query.category.toLowerCase()
      );
      res.send(filteredProducts);
    } else {
      res.send(products);
    }
  } catch (error) {
    next(error);
  }
});

productRouter.get("/:productId", async (req, res, next) => {
  try {
    const productsArray = await getProducts();
    const foundProduct = productsArray.find(
      (product) => product._id === req.params.productId
    );
    if (foundProduct) {
      res.send(foundProduct);
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productRouter.put("/:productId", async (req, res, next) => {
  try {
    const productsArray = await getProducts();
    const index = productsArray.findIndex(
      (product) => product._id === req.params.productId
    );
    if (index !== -1) {
      const oldProduct = productsArray[index];
      const updatedProduct = {
        ...oldProduct,
        ...req.body,
        updatedAt: new Date(),
      };
      productsArray[index] = updatedProduct;
      await writeProducts(productsArray);
      res.send(updatedProduct);
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productRouter.delete("/:productId", async (req, res, next) => {
  try {
    const productsArray = await getProducts();
    const remainingProducts = productsArray.filter(
      (product) => product._id !== req.params.productId
    );
    if (productsArray.length !== remainingProducts.length) {
      await writeProducts(remainingProducts);
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productRouter.post(
  "/:productId/upload",
  multer().single("product"),
  async (req, res, next) => {
    try {
      console.log(req.file, "Req.File");
      console.log(req.body, "req.body");
      const originalFileExtension = extname(req.file.originalname);
      const fileName = req.params.productId + originalFileExtension;
      await saveProductCover(fileName, req.file.buffer);

      const productsArray = await getProducts();
      const index = productsArray.findIndex(
        (product) => product._id === req.params.productId
      );
      const productToUpdate = productsArray[index];
      const updatedProduct = {
        ...productToUpdate,
        imageUrl: `http://localhost:3001/img/products/${fileName}`,
      };
      productsArray[index] = updatedProduct;
      await writeProducts(productsArray);
      res.send({ message: "Image uploaded" });
    } catch (error) {
      next(error);
    }
  }
);

productRouter.post(
  "/:productId/reviews",
  checkReviewSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newReview = {
        ...req.body,
        _id: uniqid(),
        productId: req.params.productId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const reviewsArray = await getReviews();
      reviewsArray.push(newReview);
      await writeReviews(reviewsArray);
      res.status(201).send({ _id: newReview._id });
    } catch (error) {
      next(error);
    }
  }
);

productRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const reviews = await getReviews();
    res.send(reviews);
  } catch (error) {
    next(error);
  }
});

productRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const reviewsArray = await getReviews();
    const foundReview = reviewsArray.find(
      (review) => review._id === req.params.reviewId
    );
    if (foundReview) {
      res.send(foundReview);
    } else {
      next(
        createHttpError(404, `Review with id ${req.params.reviewId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

productRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const reviewsArray = await getReviews();
    const index = reviewsArray.findIndex(
      (review) => review._id === req.params.reviewId
    );
    if (index !== -1) {
      const oldReview = reviewsArray[index];
      const updatedReview = {
        ...oldReview,
        ...req.body,
        updatedAt: new Date(),
      };
      reviewsArray[index] = updatedReview;
      await writeReviews(reviewsArray);
      res.send(updatedReview);
    } else {
      next(
        createHttpError(404, `Review with id ${req.params.reviewId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

productRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const reviewsArray = await getReviews();
      const remainingReviews = reviewsArray.filter(
        (review) => review._id !== req.params.reviewId
      );
      if (reviewsArray.length !== remainingReviews.length) {
        await writeReviews(remainingReviews);
        res.status(204).send();
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default productRouter;
