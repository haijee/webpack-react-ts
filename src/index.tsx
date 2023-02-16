import React from "react";
import ReactDOM from 'react-dom/client';
import App from "./App";

const rootDom:HTMLElement = document.getElementById("root") as HTMLElement
const root = ReactDOM.createRoot(rootDom);
root.render(<App />);
