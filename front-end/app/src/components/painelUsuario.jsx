import { useState, useEffect } from 'react'
import api from '../api.js'

function PainelUsuario() {
    const [perfil, setPerfil] = useState(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')

    useEffect(() => {
        async function buscarPerfil() {
            try {
                const resposta = await api.get('/perfil')
                setPerfil(resposta.data)
            } catch (err) {
                setErro('Erro ao carregar os dados do perfil.')
            } finally {
                setCarregando(false)
            }
        }

        buscarPerfil()
    }, [])

    return (
        <div className="painel painel-usuario">
            <h2>Painel do Usuário</h2>
            <p>Este painel é somente para usuários (role) "usuario"</p>

            {carregando && <p>Carregando perfil...</p>}
            {erro && <p className="erro">{erro}</p>}

            {perfil && (
                <div className="informacoes-usuario" style={{ marginTop: '20px' }}>
                    <h3>Meu Perfil</h3>
                    <p><strong>Nome:</strong> {perfil.nome}</p>
                    <p><strong>Email:</strong> {perfil.email}</p>

                    <h3 style={{ marginTop: '15px' }}>Meu Endereço</h3>
                    {perfil.endereco ? (
                        <ul>
                            <li><strong>CEP:</strong> {perfil.endereco.cep}</li>
                            <li><strong>Rua:</strong> {perfil.endereco.logradouro}, Nº {perfil.endereco.numero}</li>
                            {perfil.endereco.complemento && (
                                <li><strong>Complemento:</strong> {perfil.endereco.complemento}</li>
                            )}
                            <li><strong>Bairro:</strong> {perfil.endereco.bairro}</li>
                            <li><strong>Cidade/UF:</strong> {perfil.endereco.cidade} / {perfil.endereco.uf}</li>
                        </ul>
                    ) : (
                        <p>Nenhum endereço cadastrado para esta conta.</p>
                    )}
                </div>
            )}
        </div>
    )
}

export default PainelUsuario