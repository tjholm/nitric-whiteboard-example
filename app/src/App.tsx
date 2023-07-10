import React from 'react';
import logo from './logo.svg';
import { Chat } from './components/Chat';
import { Whiteboard } from './components/Whiteboard';

function App() {
  return (
    <div className='flex h-screen'>
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p className="text-3xl font-bold underline">
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <div className="flex grow grid m-2 grid-cols-4 gap-2">
        <div className='flex col-span-3 rounded overflow-hidden shadow-lg'>
          <Whiteboard />
        </div>
        <div className='flex col-span-1 rounded overflow-hidden shadow-lg'>
          <Chat />
        </div>
      </div>
      
    </div>
  );
}

export default App;
