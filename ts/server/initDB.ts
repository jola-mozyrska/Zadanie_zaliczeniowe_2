import {quizList} from "./quizes";
import {MAIN_DATABASE_NAME,
        USER_TABLE,
        QUIZ_TABLE,
        QA_TABLE,
        USER_RES_TABLE,
        USER_Q_STATS,
        USER_QUIZ_START
} from "./config_names";
import {Database} from "./storage/Database";
import {User} from "./storage/User";
import {QuizManager} from "./storage/QuizManager";
import uuid from "uuid-random";

const db = new Database(MAIN_DATABASE_NAME);

async function initDB() {
    console.log("Initializing DB.");

    await db.run(`DROP TABLE IF EXISTS ${USER_TABLE};`);
    await db.run(`DROP TABLE IF EXISTS ${QUIZ_TABLE};`);
    await db.run(`DROP TABLE IF EXISTS ${QA_TABLE};`);
    await db.run(`DROP TABLE IF EXISTS ${USER_RES_TABLE};`);
    await db.run(`DROP TABLE IF EXISTS ${USER_Q_STATS};`);
    await db.run(`DROP TABLE IF EXISTS ${USER_QUIZ_START};`);

    await db.run(`CREATE TABLE ${USER_TABLE}(
        id                  INTEGER     PRIMARY KEY,
        login               CHAR(20)    NOT NULL UNIQUE,
        password            CHAR(255)   NOT NULL,
        token               CHAR(50)    NOT NULL
    );`);

    await db.run(`CREATE TABLE ${QUIZ_TABLE}(
        quiz_id             INTEGER     PRIMARY KEY,
        quiz_name           CHAR(40)    NOT NULL UNIQUE,
        quiz_desc                TEXT        NOT NULL,
        total_q             INTEGER     NOT NULL
    );`);

    await db.run(`CREATE TABLE ${QA_TABLE}(
        id                  INTEGER     PRIMARY KEY,
        quiz_id             INTEGER     NOT NULL REFERENCES ${QUIZ_TABLE},
        question_id         INTEGER     NOT NULL,
        question_content    CHAR(100)   NOT NULL,
        correct_answer      INTEGER     NOT NULL,
        penalty             INTEGER     NOT NULL,

        UNIQUE(quiz_id, question_id)
    );`);

    await db.run(`CREATE TABLE ${USER_RES_TABLE}(
        id                  INTEGER     PRIMARY KEY,
        user_id             INTEGER     NOT NULL REFERENCES ${USER_TABLE},
        quiz_id             INTEGER     NOT NULL REFERENCES ${QUIZ_TABLE},
        score               INTEGER     NOT NULL,

        UNIQUE(user_id, quiz_id)
    );`);

    await db.run(`CREATE TABLE ${USER_Q_STATS}(
        id                  INTEGER     PRIMARY KEY,
        user_id             INTEGER     NOT NULL REFERENCES ${USER_TABLE},
        quiz_id             INTEGER     NOT NULL REFERENCES ${QUIZ_TABLE},
        question_id         INTEGER     NOT NULL,
        user_answer         INTEGER     NOT NULL,
        time                INTEGER     NOT NULL,
        correct             INTEGER     NOT NULL,

        UNIQUE(user_id, quiz_id, question_id)
    );`);

    await db.run(`CREATE TABLE ${USER_QUIZ_START}(
        id                  INTEGER     PRIMARY KEY,
        user_id             INTEGER     NOT NULL REFERENCES ${USER_TABLE},
        quiz_id             INTEGER     NOT NULL REFERENCES ${QUIZ_TABLE},
        time                INTEGER     NOT NULL,

        UNIQUE(user_id, quiz_id)
    );`);
}

async function putQuizes() {
    const manager = new QuizManager(db);
    for(const q of quizList) {
        await manager.addNewQuiz(q);
    }
}

async function createUser(login: string, passwd: string) {
    const readyPasswd = User.hashPasswd(passwd);
    await db.run(
        `INSERT INTO ${USER_TABLE} (login, password, token)
            VALUES (?, ?, ?);`,
        [login, readyPasswd, uuid()]);
}

initDB().then
    (() => createUser("admin", "admin")).then
    (() => createUser("user1", "user1")).then
    (() => createUser("user2", "user2")).then
    (() => putQuizes())
    .catch((e) => console.log(e));
