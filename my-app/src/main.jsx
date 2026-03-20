import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const tailwindConfig = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "secondary-dim": "#f08015",
        "on-primary-fixed-variant": "#002279",
        "error": "#ff6e84",
        "secondary-container": "#944b00",
        "on-surface": "#f1f3fc",
        "tertiary": "#e768ff",
        "on-surface-variant": "#a8abb3",
        "on-primary": "#00247e",
        "error-container": "#a70138",
        "inverse-primary": "#3956c1",
        "on-tertiary-fixed": "#2f0039",
        "secondary-fixed": "#ffc69e",
        "surface-container-high": "#1b2028",
        "surface": "#0a0e14",
        "outline": "#72757d",
        "on-tertiary": "#3c0049",
        "primary-fixed-dim": "#718cfa",
        "on-secondary": "#452000",
        "tertiary-container": "#dc4afa",
        "surface-tint": "#95a9ff",
        "error-dim": "#d73357",
        "inverse-on-surface": "#51555c",
        "surface-dim": "#0a0e14",
        "background": "#0a0e14",
        "on-secondary-fixed-variant": "#7f3f00",
        "primary-fixed": "#829bff",
        "primary-dim": "#7e98ff",
        "primary-container": "#829bff",
        "on-error-container": "#ffb2b9",
        "tertiary-dim": "#e768ff",
        "on-tertiary-container": "#18001f",
        "surface-container-lowest": "#000000",
        "primary": "#95a9ff",
        "surface-bright": "#262c36",
        "on-primary-fixed": "#000000",
        "on-background": "#f1f3fc",
        "inverse-surface": "#f8f9ff",
        "outline-variant": "#44484f",
        "surface-container-highest": "#20262f",
        "surface-variant": "#20262f",
        "tertiary-fixed-dim": "#e972ff",
        "secondary": "#fd8a22",
        "surface-container": "#151a21",
        "on-error": "#490013",
        "secondary-fixed-dim": "#ffb37c",
        "tertiary-fixed": "#ef8aff",
        "on-secondary-fixed": "#552800",
        "on-primary-container": "#001a63",
        "on-tertiary-fixed-variant": "#650079",
        "surface-container-low": "#0f141a",
        "on-secondary-container": "#fff6f2"
      },
      fontFamily: {
        "headline": ["Space Grotesk"],
        "body": ["Inter"],
        "label": ["Inter"]
      },
      borderRadius: { "DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem" },
    },
  },
}

if (window.tailwind) {
  window.tailwind.config = tailwindConfig;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
