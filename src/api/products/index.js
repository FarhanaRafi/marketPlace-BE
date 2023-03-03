import Express from "express";
import {
  getProducts,
  saveProductCover,
  writeProducts,
} from "../../lib/fs-tool.js";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import multer from "multer";
import { extname } from "path";

const productRouter = Express.Router();

productRouter.post("/", async (req, res, next) => {
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
});
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

export default productRouter;
