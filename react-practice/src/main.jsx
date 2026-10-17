import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import PracticeApp from './App.jsx';
import './style.css';
createRoot(document.querySelector('#root')).render(<StrictMode><HashRouter><PracticeApp/></HashRouter></StrictMode>);
