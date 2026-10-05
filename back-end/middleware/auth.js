import jwt from "jsonwebtoken"

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
        return res.status(401).json({ mensagem: "Token não fornecido" })
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.JWT_SECRET, (err, usuarioDecodificado) => {
        if (err) {
            return res.status(403).json({ mensagem: "Token invalido ou expirado" })
        }

        req.usuario = usuarioDecodificado
        next()
    })
}

export default verificarToken