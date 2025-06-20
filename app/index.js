//Imports
import express from 'express';
import cookieParser from 'cookie-parser';

import { methods as auth } from './controllers/controller.js';
import { methods as middleware } from './middleware/middleware.js';


//Creación del servidor
const server = express()
server.set("port", 4000)
const port = server.get("port")
server.listen(port)
console.log("Servidor corriendo en:", port)

//Configuración del servidor
server.use(express.json())
server.use(cookieParser())

server.post("/api/users", auth.Register)
server.post("/api/login", auth.Login)


server.get('/api/logout', (req, res) => {
  res.clearCookie('jwt', { path: '/' })
  res.status(200).json({ message: 'Logged out' })
})

server.get("/api/home", middleware.GetUserFromToken, (req, res) => {
  console.log(res.message);
  res.status(200).json({
    status: "OK",
    message: "Usuario autenticado",
    user: req.user,
  });
  console.log(res.message)
});