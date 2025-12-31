// src/config/env.js

const mode = import.meta.env.MODE;

const TEST_URL = import.meta.env.VITE_API_TEST_URL;
const PROD_URL = import.meta.env.VITE_AWS_API_BASE_URL;

export const API_BASE_URL = mode === "development" ? TEST_URL : PROD_URL;

if (mode === "development") {
  console.log("🔧 DEV MODE API:", API_BASE_URL);
}
