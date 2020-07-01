import express from "express";
import { Database } from "./storage/Database";

export function errorPage(res: express.Response, status: number, message: string) {
    res.status(status);
    res.render('error', {status, message});
}

export function checkIfLogged(req: express.Request, res: express.Response, next: express.NextFunction) {
    if(!res.locals.user) {
        return res.redirect('/login');
    }

    return next();
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function beginExclusiveTrans(req : express.Request, res: express.Response, next: express.NextFunction) {
    const db : Database = res.locals.db;

    for(let i = 0; i < 10; ++i) {
        try {
            await db.run("BEGIN EXCLUSIVE TRANSACTION;");
        }catch(e) {
            if(e.code === 'SQLITE_BUSY') {
                await sleep(5);
                continue;
            }
        }
        res.locals.commit = false;
        res.on('close', async () => {
            if(res.locals.commit) {
                await db.run('COMMIT;');
            } else {
                await db.run('ROLLBACK;');
            }
        });
        return next();
    }
    return res.status(500).json({error: "Database locked"});
}

