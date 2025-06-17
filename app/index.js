//Imports
import express from 'express';
import cookieParser from 'cookie-parser';

import { methods as auth } from './controllers/controller.js';
// import { middleware } from './middleware/middleware.js';

import { query } from './model/model.js';


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