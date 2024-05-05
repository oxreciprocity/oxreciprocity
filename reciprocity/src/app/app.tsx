import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Faq from './faq'; // import the FAQ component
import Page from './page'; // import the Page component

export default function App(){
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Page />} />
                <Route path="/faq" element={<Faq />} />
            </Routes>
        </Router>
    );
} 