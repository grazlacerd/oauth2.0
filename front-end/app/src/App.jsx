import { Routes, Route, Navigate } from "react-router-dom"
import Cadastro from "./pages/cadastro.jsx"
import Login from "./pages/login.jsx"
import Dashboard from "./pages/dashboard.jsx"
import RotaProtegida from './components/rotaProtegida.jsx'

function App(){
  return(
    <Routes>
      <Route path='/' element={<Navigate to='/login' replace/>}/>
      <Route path='/cadastro' element={<Cadastro/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/dashboard' 
        element={
          <RotaProtegida>
            <Dashboard/>
          </RotaProtegida>
        } 
      />
    </Routes>
  )
}

export default App