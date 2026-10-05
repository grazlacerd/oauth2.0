import express from "express"
import cors from "cors"
import usuarioRoutes from "./routes/usuariosRoutes.js"

const app = express()

//middleware
app.use(express.json())
app.use(cors())

app.use("/usuarios", usuarioRoutes)

export default app