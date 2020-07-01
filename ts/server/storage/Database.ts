import * as sqlite3 from "sqlite3";
import express from "express";
import {MAIN_DATABASE_NAME} from "../config_names";
import {UserTable} from "./UserTable";
import {QuizManager} from "./QuizManager";

sqlite3.verbose();

export class Database {
    private db : sqlite3.Database;

    constructor(name: string) {
        this.db = new sqlite3.Database(name);
    }

    public async run(sql: string, params?: any[]): Promise<sqlite3.RunResult> {
        return new Promise((resolve, reject) => {
            const cb = function (this: sqlite3.RunResult, err: Error) {
                if(err) {
                    console.log('Query:', sql, "failed with:", err);
                }
                return err ? reject(err) : resolve(this);
            }
            if(params) {
                this.db.run(sql, params, cb);
            } else {
                this.db.run(sql, cb);
            }

        });
    };

    public async get(sql: string, params?: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const cb = (err : Error, row: any) => {
                if(err) {
                    console.log('Query:', sql, "failed with:", err);
                }
                return err ? reject(err) : resolve(row);
            }
            if(params) {
                this.db.get(sql, params, cb);
            } else {
                this.db.get(sql, cb);
            }
        });
    };

    public async all(sql: string, params?: any[]): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const cb = (err : Error, rows: any[]) => {
                if(err) {
                    console.log('Query:', sql, "failed with:", err);
                }
                return err ? reject(err) : resolve(rows);
            }
            if(params) {
                this.db.all(sql, params, cb);
            } else {
                this.db.all(sql, cb);
            }
        });
    };
}

export function createNewDBMiddleware(req : express.Request, res: express.Response, next: express.NextFunction) {
    res.locals.db = new Database(MAIN_DATABASE_NAME);
    res.locals.userTable = new UserTable(res.locals.db);
    res.locals.quizManager = new QuizManager(res.locals.db);

    return next();
}