import { Router } from "express"
import verificarToken from "../middleware/auth.js"
import {
    cadastroUsuarios,
    login,
    perfil,
    loginGoogle,
    atualizarEndereco
} from "../controllers/usuariosControllers.js"

const router = Router()

router.post("/cadastro", cadastroUsuarios)
router.post("/login", login)
router.post("/login/google", loginGoogle)

router.get("/perfil", verificarToken, perfil)
router.put("/endereco", verificarToken, atualizarEndereco)

export default router