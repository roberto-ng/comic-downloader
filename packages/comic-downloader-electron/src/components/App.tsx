import { hot } from 'react-hot-loader';
import React from 'react';

function App() {
    return (
        <h1>Hello World!</h1>
    );
}

declare const module: any;
export default hot(module)(App);