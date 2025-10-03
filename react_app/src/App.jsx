import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import LuckyWheel from './spinning_wheel'

function App() {

  return (
    <div className="max-w-5xl mx-auto p-4 flex justify-center">
      <LuckyWheel />
    </div>
  )
}

export default App
