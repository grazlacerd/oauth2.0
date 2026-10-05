import db from '../config/db.js'
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"
import { OAuth2Client } from 'google-auth-library'

// confere se um token de login foi mesmo gerado pelo Google, e não inventado por alguém.
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// funções auxiliares

export const gerarToken = async (usuario) => {
    const payload = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email, // <--- Incluído o e-mail no token e no payload
        role: usuario.role
    }

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
    )

    return { token, payload }
}

export const validarEndereco = async (endereco) => {
    if (!endereco) return null

    const cep = String(endereco.cep || '').replace(/\D/g, '') // permitir apenas numeros
    const { logradouro, numero, complemento, bairro, cidade, uf } = endereco

    if (cep.length !== 8 || !logradouro || !numero || !bairro || !cidade || !uf) {
        return null
    }

    return {
        cep,
        logradouro,
        numero,
        complemento: complemento || null,
        bairro,
        cidade,
        uf: String(uf).toUpperCase()
    }
}

export const atualizarEndereco = async (req, res) => {
    try {
        const usuarioId = req.usuario.id
        const enderecoValido = await validarEndereco(req.body)

        if (!enderecoValido) {
            return res.status(400).json({ mensagem: "Endereço inválido ou com campos faltando." })
        }

        const [existente] = await db.query(
            "SELECT id FROM enderecos WHERE usuario_id = ?",
            [usuarioId]
        )

        if (existente.length > 0) {
            await db.query(
                `UPDATE enderecos 
                 SET cep = ?, logradouro = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, uf = ?
                 WHERE usuario_id = ?`,
                [
                    enderecoValido.cep,
                    enderecoValido.logradouro,
                    enderecoValido.numero,
                    enderecoValido.complemento,
                    enderecoValido.bairro,
                    enderecoValido.cidade,
                    enderecoValido.uf,
                    usuarioId
                ]
            )
        } else {
            await db.query(
                `INSERT INTO enderecos (usuario_id, cep, logradouro, numero, complemento, bairro, cidade, uf)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    usuarioId,
                    enderecoValido.cep,
                    enderecoValido.logradouro,
                    enderecoValido.numero,
                    enderecoValido.complemento,
                    enderecoValido.bairro,
                    enderecoValido.cidade,
                    enderecoValido.uf
                ]
            )
        }

        return res.status(200).json({ mensagem: "Endereço salvo com sucesso!" })
    } catch (erro) {
        console.log(erro)
        return res.status(500).json({ mensagem: "Erro ao atualizar endereço." })
    }
}

export const cadastroUsuarios = async (req, res) => {
    const { nome, email, senha, endereco } = req.body

    // verificar se todas as informações foram informadas
    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: "Preencha todos os campos" })
    }

    const enderecoValido = await validarEndereco(endereco)
    if (!enderecoValido) {
        return res.status(400).json({ mensagem: "Preencha todos os campos" })
    }

    const conexao = await db.getConnection()

    try {
        const [existente] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email])
        if (existente.length > 0) {
            return res.status(409).json({ mensagem: "O email informado ja foi cadastrado anteriormente" })
        }

        // criptografia de senha
        const senhaCriptografa = await bcrypt.hash(senha, 10)

        await conexao.beginTransaction()

        const [resultado] = await conexao.query(
            'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)',
            [nome, email, senhaCriptografa, 'usuario']
        )

        const usuarioId = resultado.insertId

        await conexao.query(
            `INSERT INTO enderecos (usuario_id, cep, logradouro, numero, complemento, bairro, cidade, uf)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [usuarioId, enderecoValido.cep, enderecoValido.logradouro, enderecoValido.numero,
                enderecoValido.complemento, enderecoValido.bairro, enderecoValido.cidade, enderecoValido.uf]
        )

        await conexao.commit()

        return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" })
    } catch (erro) {
        await conexao.rollback()
        console.log(erro)
        return res.status(500).json({ mensagem: "Erro ao cadastrar usuario." })
    } finally {
        conexao.release()
    }
}

export const login = async (req, res) => {
    try {
        const { email, senha } = req.body

        if (!email || !senha) {
            return res.status(400).json({ mensagem: "Preencha email e senha" })
        }

        const [resultado] = await db.query(
            "SELECT * FROM usuarios WHERE email = ?", [email]
        )

        if (resultado.length === 0) {
            return res.status(401).json({ mensagem: "Email ou senha inválidos" })
        }

        const usuario = resultado[0]

        if (!usuario.senha) {
            return res.status(400).json({ mensagem: "Esta conta foi criada com o Google. Use o botão 'Entrar com Google'" })
        }

        const senhaConfere = await bcrypt.compare(senha, usuario.senha)

        if (!senhaConfere) {
            return res.status(401).json({ mensagem: "Email ou senha inválidos" })
        }

        const { token, payload } = await gerarToken(usuario)

        res.status(200).json({
            mensagem: "Login realizado com sucesso",
            token,
            usuario: payload
        })
    }
    catch (erro) {
        console.log(erro)
        return res.status(500).json({ mensagem: "Erro ao realizar login" })
    }
}

export const loginGoogle = async (req, res) => {
    const { credential } = req.body

    if (!credential) {
        return res.status(400).json({ mensagem: "Token do Google não enviado" })
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        })

        const dadosGoogle = ticket.getPayload()

        if (!dadosGoogle.email_verified) {
            return res.status(401).json({ mensagem: "Email do Google não foi verificado" })
        }

        const [resultado] = await db.query(
            "SELECT * FROM usuarios WHERE google_id = ? OR email = ?",
            [dadosGoogle.sub, dadosGoogle.email]
        )

        let usuario

        if (resultado.length > 0) {
            usuario = resultado[0]

            if (!usuario.google_id) {
                await db.query(
                    "UPDATE usuarios SET google_id = ?, foto = ? WHERE id = ?",
                    [dadosGoogle.sub, dadosGoogle.picture || null, usuario.id]
                )
            }
        } else {
            // criar um novo usuário com o google
            const [novo] = await db.query(
                `INSERT INTO usuarios (nome, email, senha, role, google_id, provedor, foto)
                 VALUES (?, ?, NULL, 'usuario', ?, 'google', ?)`,
                [dadosGoogle.name, dadosGoogle.email, dadosGoogle.sub, dadosGoogle.picture || null]
            )

            usuario = {
                id: novo.insertId,
                nome: dadosGoogle.name,
                email: dadosGoogle.email, // <--- Incluído o e-mail no objeto do novo usuário
                role: 'usuario'
            }
        }

        const { token, payload } = await gerarToken(usuario)

        return res.status(200).json({
            mensagem: "Login com o google realizado com sucesso",
            token,
            usuario: payload
        })

    } catch (erro) {
        console.log(erro)
        return res.status(401).json({ mensagem: "Não foi possivel validar o login com o Google" })
    }
}

export const perfil = async (req, res) => {
    const [enderecos] = await db.query("SELECT * FROM enderecos WHERE usuario_id = ?", [req.usuario.id])

    return res.status(200).json({
        ...req.usuario,
        endereco: enderecos[0]
    })
}