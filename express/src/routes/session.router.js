import { Router } from "express";
import { usuariosModelo } from "../dao/models/usuarios.modelo.js";

import crypto from "crypto"; // traemos a crypto para la contraseña
import { error } from "console";
export const router = Router();

router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.redirect("/login?error=Complete todos los datos");
  }
  password = crypto
    .createHmac("sha256","codercoder123")
    .update(password)
    .digest("hex");

  let usuario = await usuariosModelo.findOne({
    email: email,
    password: password,
  });
  if (!usuario) {
    return res.redirect(`/login?error=credemciales incorrectas`);
  }

  //Una vez que ya sabemos que el se ha validado creamos la session

  req.session.usuario = {
    //JAMAS SE DEBE DE ENVIAR PASSWORD, colocar el rol
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol, //COLCAMOS EL rol
  };

  res.redirect("/perfil");
});

router.post("/registro", async (req, res) => {
  let { nombre, email, password } = req.body;
  console.log(nombre, email, password);

  if (!nombre || !email || !password) {
    return res.redirect("/registro?error=Complete todos los datos");
  }

  let regMail =
    /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
  // console.log(regMail.test(email))
  if (!regMail.test(email)) {
    return res.redirect("/registro?error=Mail con formato incorrecto...!!!");
  }

  let existe = await usuariosModelo.findOne({ email: email });
  if (existe) {
    return res.redirect(
      `/registro?error=Existen usuarios con email ${email} en la BD`
    );
  }

  password = crypto.createHmac("sha256","codercoder123").update(password).digest("hex");

  let usuario;

  //**Comprobamos si es administrador para darle su rol *****/
  

  try {
    const isAdmin =
      req.body.email == "adminCoder@coder.com" && req.body.password == "adminCod3r123";


    //   console.log('isAdmin:', isAdmin);
 
    const rol = isAdmin ? "administrador" : "usuario";




    usuario = await usuariosModelo.create({ nombre, email, password, rol });

    res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`);

  } catch (error) {
    res.redirect("/registro?error=Error inesperado. Reintente en unos minutos");
  }
  //**End***Comprobamos si administrador para darle su rol *****/
});

router.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      res.redirect("/login?error=fallo en el logout");
    }
  });

  res.redirect("/login");
});
