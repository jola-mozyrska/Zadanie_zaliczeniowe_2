import express from "express";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import session from "express-session";
import connectSQLite from "connect-sqlite3";

import {createNewDBMiddleware} from "./storage/Database";
import {authorization} from "./storage/User";
import {pageRouter} from "./routers/pageRouter";
import {userRouter} from "./routers/userRouter";
import { apiRouter } from "./routers/start_quiz_utils";

const SECRET = "s3sfdfg4";
const SQLiteStore = connectSQLite(session);
const SESSIONS_DB_NAME = "sessions.sqlite";

const app = express();
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(cookieParser(SECRET));

app.set("view engine", "pug");
app.use("/static", express.static('static'));
app.use(csurf({cookie: true}));
app.use(async (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(session({
    cookie: {
        maxAge: 900 * 1000,
    },
    resave: false,
    saveUninitialized: false,
    secret: SECRET,
    store: new SQLiteStore({ db: SESSIONS_DB_NAME }),
}));

app.use(createNewDBMiddleware);
app.use(authorization);

app.use(apiRouter);
app.use(pageRouter);
app.use(userRouter);

export default app;