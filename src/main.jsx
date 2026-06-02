import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { RequireAuth } from "./lib/cloud";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RequireAuth>
      <App />
    </RequireAuth>
  </React.StrictMode>,
)
