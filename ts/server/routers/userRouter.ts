import express from "express";
import { errorPage, beginExclusiveTrans } from "../utils";
import { UserTable } from "../storage/UserTable";
import {requireLoggingIn, User} from "../storage/User";

const userRouter = express.Router();

userRouter.get("/error", async (req, res) => {
    return res.render('error', {message : "Error"});
});

userRouter.get("/login", async (req, res) => {
    return res.render("login", {csrfToken : req.csrfToken()});
});

userRouter.get("/logout", async (req, res) => {
    delete req.session?.userId;
    delete req.session?.userToken;
    return res.redirect("/choose_quiz");
});

userRouter.get("/change_passwd", requireLoggingIn, async (req, res) => {
    return res.render("change_passwd", {csrfToken : req.csrfToken()});
});

userRouter.post("/login", async (req, res) => {
    if(!req.session)
        return errorPage(res, 404, "Nie odnaleziono sesji");

    const user = await (res.locals.userTable as UserTable).verifyUser(req.body.login, req.body.passwd);
    if(!user)
        return res.render("login", {csrfToken : req.csrfToken(), msg: "Niepoprawny login lub hasło"});

    req.session.userId = user.id;
    req.session.userToken = user.token;
    res.locals.user = user;
    return res.render("login", {csrfToken : req.csrfToken(), msg: "Logowanie udane!"});
});

userRouter.post("/change_passwd", requireLoggingIn, beginExclusiveTrans, async (req, res) => {
    if(!req.session)
        return errorPage(res, 404, "Nie odnaleziono sesji");

    const login = await (res.locals.userTable).getLoginFromId(req.session.userId);
    if(!login)
        return res.render("change_passwd", {csrfToken : req.csrfToken(), msg: "Wystąpił błąd"});

    const user = await (res.locals.userTable).verifyUser(login, req.body.old_passwd);
    if(!user)
        return res.render("change_passwd", {csrfToken : req.csrfToken(), msg: "Nieprawidłowe stare hasło"});

    await (res.locals.userTable as UserTable).tryChangePasswd(user, req.body.new_passwd);

    const user_id : number = (res.locals.user as User).id;
    const newUser = await (res.locals.userTable as UserTable).getUserById(user_id);

    req.session.userToken = newUser?.token;
    res.locals.commit = true;
    return res.render("change_passwd", {csrfToken : req.csrfToken(), msg: "Zmiana hasła powiodła się"});
});

export {userRouter};
