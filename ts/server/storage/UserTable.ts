import {Database} from "./Database";
import {USER_TABLE} from "../config_names";
import uuid from "uuid-random";
import {User} from "./User";

export class UserTable {
    private readonly db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    public async verifyUser(login: string, passwd: string) : Promise<User | undefined> {
        const row = await this.db.get(
            `SELECT id, login, password, token
            FROM ${USER_TABLE}
            WHERE login = ?;`, [login]);

        const OK = User.checkPasswd(passwd, row.password);
        if(OK)
            return new User(row);
    }

    public async getUserById(id: number): Promise<User | undefined> {
        return this.db.get(
            `SELECT id, login, password, token
                FROM ${USER_TABLE}
                WHERE id = (?);`, [id])
            .then((row) => {
                if(row) return new User(row);
            });
    }

    public async getLoginFromId(id: number): Promise<string | undefined> {
        console.log(id);
        return this.db.get(
            `SELECT login
                FROM ${USER_TABLE}
                WHERE id = (?);`, [id])
            .then((row) => {
                if(row) return row.login;
            });
    }

    private async userByLogin(login: string): Promise<User | undefined> {
        return this.db.get(
            `SELECT id, login, password, token
                FROM ${USER_TABLE}
                WHERE login = ?;`, [login])
            .then((row) => row ? new User(row) : undefined);
    }

    public async tryChangePasswd(user: User, passwd: string) {
        const hashedPasswd = User.hashPasswd(passwd);
        await this.db.run(
            `UPDATE ${USER_TABLE}
                SET password = ?, token = ?
                WHERE id = ?;`, [hashedPasswd, uuid(), user.id]);
    }
}
