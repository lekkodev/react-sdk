import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"

// Get a reference to the root element
const rootElement = document.getElementById("root")

if (!rootElement) throw new Error("no root")

// Create a root
const root = createRoot(rootElement)

// Render your component within the root
root.render(<App />)
