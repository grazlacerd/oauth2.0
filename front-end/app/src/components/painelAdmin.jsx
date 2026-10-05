function PainelAdmin(){
    return(
        <div className="painel painel-admin">
            <h2>Painel do Administrador</h2>
            <p>Este painel é somente para administradores (role) "admin"</p>
            <ul>
                <li>Gereciar usuários</li>
                <li>Relatorios do Sistemas</li>
                <li>Configurações gerais</li>
            </ul>
        </div>
    )
}

export default PainelAdmin