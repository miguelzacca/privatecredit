import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

// axios doesn't send CSRF for GET requests by default, we must force it:
axios.interceptors.request.use((config) => {
  const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
  if (match) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(match[2]);
    config.headers['X-CSRF-Token'] = decodeURIComponent(match[2]);
  }
  return config;
});

// Fetch CSRF token before mounting the app so first API requests don't fail
axios.get('/api/auth/csrf').catch(err => console.error('Error fetching CSRF:', err)).finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'COLOQUE_SEU_CLIENT_ID_AQUI'}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </StrictMode>,
  )
});
