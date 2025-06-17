import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import { query } from "../model/model.js";

dotenv.config();

async function HomeIfVerified(req, res, next) {
  try {
    const cookies = req.headers.cookie;
    if (!cookies) return res.redirect("/");  

    const cookieJWT = cookies.split("; ").find(c => c.startsWith("jwt="));
    if (!cookieJWT) return res.redirect("/"); 

    const token = cookieJWT.slice(4); 
    const tokenVerified = jsonwebtoken.verify(token, process.env.JWT_SIGN);

    
    const exists = await query('SELECT * FROM usuarios WHERE username = $1', [tokenVerified.user]);
    if (exists.rows.length === 0) return res.redirect("/"); 

    
    next();

  } catch (error) {
    
    return res.redirect("/");
  }
}

async function LoginIfNotAuth(req, res, next) {
  try {
    const cookies = req.headers.cookie;
    if (!cookies) return next();

    const cookieJWT = cookies.split("; ").find(c => c.startsWith("jwt="));
    if (!cookieJWT) return next(); 

    const token = cookieJWT.slice(4);
    const tokenVerified = jsonwebtoken.verify(token, process.env.JWT_SIGN);

    
    const exists = await query('SELECT * FROM usuarios WHERE username = $1', [tokenVerified.user]);
    if (exists.rows.length > 0) {
      
      return res.redirect("/home");
    } else {
      
      next();
    }

  } catch (error) {
    
    console.log("SE METIÓ AL CATCH:", error)
    next();
  }
}

export function GetUserFromToken(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    console.log('No token encontrado');
    return res.status(401).json({ status: "Error", message: "No autorizado: sin token" });
  }

  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SIGN);
    req.user = decoded.user;
    req.userID = decoded.id  
    next();
  } catch (error) {
    console.log('Error verificando token:', error.message);
    return res.status(401).json({ status: "Error", message: "Token inválido" });
  }
}

export const methods = {
  HomeIfVerified,
  LoginIfNotAuth,
  GetUserFromToken
}
