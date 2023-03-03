import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON, writeFile } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");
console.log(dataFolderPath, "data");
const productJSONPath = join(dataFolderPath, "products.json");
const reviewJSONPath = join(dataFolderPath, "reviews.json");

//for image
const productsPublicFolderPath = join(process.cwd(), "./public/img/products");
console.log(process.cwd(), "cwd===");

export const getProducts = () => readJSON(productJSONPath);
export const writeProducts = (productsArray) =>
  writeJSON(productJSONPath, productsArray);
export const getReviews = () => readJSON(reviewJSONPath);
export const writeReviews = (reviewsArray) =>
  writeJSON(reviewJSONPath, reviewsArray);

//for image
export const saveProductCover = (fileName, fileContentsAsBuffer) =>
  writeFile(join(productsPublicFolderPath, fileName), fileContentsAsBuffer);
