import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import StoreApp from './App.jsx';
import './style.css';
createRoot(document.querySelector('#root')).render(<StrictMode><HashRouter><StoreApp/></HashRouter></StrictMode>);
