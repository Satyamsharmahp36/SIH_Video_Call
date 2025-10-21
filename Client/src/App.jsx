import './App.css'
import { Route, Routes } from 'react-router-dom'
import LandingPage from './Pages/LandingPage'
import Room from './Pages/Room'
import React from 'react'

function App() {

  return (
    <>
     <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/room/:roomId' element={<Room/>}/>
      <Route path='/room/onlyai/:roomId' element={<Room/>}/>
     </Routes>
    </>
  )
}

export default App
