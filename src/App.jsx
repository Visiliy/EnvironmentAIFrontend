import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import Main from './pages/Main';
import Workspace from './pages/Workspace';
import Authorization from './pages/Authorization';
import Account from './pages/Account';

function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Main />}/>
          <Route path='/workspace' element={<Workspace />} />
          <Route path='/authorization' element={<Authorization />} />
          <Route path='/account' element={<Account />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
