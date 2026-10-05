import { useState } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { GoogleLogin } from '@react-oauth/google'
import api from "../api.js"

function Login() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState('')
    const navigate = useNavigate()

    async function handleSubmit(ev) {
        ev.preventDefault()
        setErro('')
        setSucesso('')

        try {
            const resposta = await api.post('/login', { email, senha })
            localStorage.setItem('token', resposta.data.token)
            localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario))
            setSucesso("login realizado")
            setTimeout(() => navigate('/dashboard'), 1500)
        } catch (erroRequisicao) {
            const mensagem = erroRequisicao.response?.data?.mensagem || 'erro ao realizar login'
            setErro(mensagem)
        }
    }

    async function handleGoogleSuccess(credentialResponse) {
        setErro('')
        setSucesso('')

        try {
            const resposta = await api.post('/login/google', {
                credential: credentialResponse.credential
            })
            localStorage.setItem('token', resposta.data.token)
            localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario))
            setSucesso("Login com Google realizado")
            setTimeout(() => navigate('/dashboard'), 1500)
        } catch (erroRequisicao) {
            const mensagem = erroRequisicao.response?.data?.mensagem || 'Erro ao realizar login com o Google'
            setErro(mensagem)
        }
    }

    return (
        <div className="container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label>Email
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>Senha
                    <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                </label>
                {erro && <p className="erro">{erro}</p>}
                {sucesso && <p className="sucesso">{sucesso}</p>}
                <button type="submit">Entrar</button>
            </form>

            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setErro('Falha ao conectar com o Google')}
                />
            </div>

            <p style={{ marginTop: '15px' }}>Não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
        </div>
    )
}

export default Login