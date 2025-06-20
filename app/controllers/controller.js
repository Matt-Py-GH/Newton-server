import bcryptjs from "bcryptjs"
import jsonwebtoken from "jsonwebtoken"
import dotenv from "dotenv"
import {query} from "../model/model.js"

dotenv.config()

async function Login(req, res){
    console.log("Petición de inicio de sesión recibida");

    const {user, password} = req.body

    if(!user || !password) return res.status(400).send({status:"Error", message:"Campos incompletos"})

    const resultado = await query('SELECT * FROM usuarios WHERE name = $1', [user]);

    if (resultado.rowCount === 0) return res.status(400).send({ status: "Error", message: "Usuario no encontrado" });
      
    const usuarioBD = resultado.rows[0];

    const passwordCorrecta = await bcryptjs.compare(password, usuarioBD.password);
    console.log("HASTA ACÁ LLEGA")
    
    if (!passwordCorrecta) return res.status(400).send({ status: "Error", message: "Contraseña incorrecta" });


    const token = jsonwebtoken.sign(
        {user, id:usuarioBD.id}, //Sospechando el funcionamiento correcto de esta línea
        process.env.JWT_SIGN,
        {expiresIn: Number(process.env.JWT_EXPIRE) * 24 * 60 * 60 * 1000}
    )
    const cookie = {
        expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
        path:"/"
    }


    res.cookie("jwt", token, cookie)

    res.send({status:"OK", message:"Éxito",redirect:"/home"})
}

async function Register(req, res){
    console.log("Petición de registro recibida");
    const { user, password, email } = req.body;

    if (!user || !password || !email) {
        return res.status(400).send({ status: "Error", message: "Campos incompletos" });
    }

    if (user.length < 3) {
        return res.status(400).send({ status: "Short name", message: "Usuario demasiado corto" });
    }

    else if (password.length < 8) {
        return res.status(400).send({ status: "Password short", message: "Password demasiado corto" });
    }

    else if (!/^[a-zA-Z0-9]+$/.test(user)) {
        return res.status(400).send({ status: "Invalid", message: "Solo letras y números permitidos" });
    }

    const exists = await query(
        'SELECT * FROM usuarios WHERE name = $1 OR email = $2',
        [user, email]
    );

    if (exists.rows.length > 0) {

        return res.status(400).send({ status: "Error", message: "Usuario o email ya registrado" });
    }

    const salt = await bcryptjs.genSalt(5);
    const hashPassword = await bcryptjs.hash(password, salt);

    await query(
        'INSERT INTO usuarios (name, email, password) VALUES ($1, $2, $3)',
        [user, email, hashPassword]
    );

    console.log("EXITOSO")
    return res.status(200).send({ status: "OK", message: "Éxito", redirect: "/" });
}

export const methods = { 
    Login,
    Register

}