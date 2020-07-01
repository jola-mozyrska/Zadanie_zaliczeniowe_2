import bcrypt from "bcrypt";
import express from "express";

export class User {
    passwd: string;
    token: string
    id: number;
    login: string;

    constructor(row: any) {
        this.login = row.login;
        this.passwd = row.passwd;
        this.id = row.id;
        this.token = row.token;
    }

    public checkToken(token: string): boolean {
        return this.token === token;
    }

    public static hashPasswd(passwd: string): string {
        return bcrypt.hashSync(passwd, 10);
    }

    public static checkPasswd(pass: string, hashedPasswd: any): boolean {
        return bcrypt.compareSync(pass, hashedPasswd);
    }
}

export function requireLoggingIn(req: express.Request, res: express.Response, next: express.NextFunction) {
    if(!res.locals.user)
        return res.redirect('/login');

    return next();
}

export function requireLoggingInAPI(req: express.Request, res: express.Response, next: express.NextFunction) {
    if(!res.locals.user){
        res.status(403);
        res.json({error: "Not authorized"});
        return;
    }

    return next();
}

export async function authorization(req: express.Request, res: express.Response, next: express.NextFunction) {
    if(!req.session) {
        return;
    }

    if(!req.session.userId || !req.session.userToken)
        return next();

    res.locals.user = await res.locals.userTable.getUserById(req.session.userId);
    if(!res.locals.user || !res.locals.user.checkToken(req.session.userToken)) {
        delete req.session.userId;
        delete req.session.userToken;
        delete res.locals.user;
    }

    return next();
}