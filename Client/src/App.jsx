import './App.css'
import { Route, Routes } from 'react-router-dom'
import LandingPage from './Pages/LandingPage'
import Room from './Pages/Room'
import { TranslationProvider } from './contexts/TranslationContext'
import React from 'react'

function App() {

  return (
    <TranslationProvider>
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/room/:roomId' element={<Room/>}/>
      </Routes>
    </TranslationProvider>
  )
}

export default App
