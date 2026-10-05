import { useNavigate } from "react-router-dom"
import { googleLogout } from '@react-oauth/google'
import PainelAdmin from '../components/painelAdmin.jsx'
import PainelUsuario from '../components/painelUsuario.jsx'

function Dashboard(){
    const navigate = useNavigate()

    const usuario = JSON.parse(localStorage.getItem('usuario'))

    function sair(){
        googleLogout()
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        navigate('/login')
    }

    return(
        <div className="container">
            <div className="topo-container">
                <p>Olá, <strong>{usuario?.nome}</strong> ({usuario?.role})</p>
                <button onClick={sair}>Sair</button>

                {usuario?.role === 'admin' ? <PainelAdmin/> : <PainelUsuario/>}
            </div>
        </div>
    )
}

export default Dashboard