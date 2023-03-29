import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./scss/index.scss";
import LoadingContainer from "./LoadingContainer.js";

const root = createRoot(document.getElementById("root"));
root.render(<LoadingContainer />)
