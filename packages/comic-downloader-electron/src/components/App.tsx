import { hot } from 'react-hot-loader';
import React from 'react';

import { mul } from 'comic-downloader-core';

function App() {
    return (
        <h1>Teste {mul(5, 100)}</h1>
        //<h1>Oi</h1>
    );
}

// enables hot reloading on dev mode
declare const module: any;
export default hot(module)(App);

//export default App;