import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import Main from './pages/Main';
import Workspace from './pages/Workspace';

function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Main />}/>
          <Route path='/workspace' element={<Workspace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
