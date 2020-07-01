import {Database} from "./Database"
import {quiz_t, answer_stats, is_answer_stats} from "../../quiz_scripts/types"
import {QUIZ_TABLE, QA_TABLE, USER_RES_TABLE, USER_Q_STATS, USER_QUIZ_START} from "../config_names";

export class QuizManager {
    private db : Database;

    constructor(db: Database) {
        this.db = db;
    }

    public async addNewQuiz(quiz: quiz_t) {
        const result = await this.db.run(
            `INSERT INTO ${QUIZ_TABLE} (quiz_name, quiz_desc, total_q) VALUES (?, ?, ?);`, [quiz.quiz_name, quiz.quiz_desc, quiz.total_q]);
        quiz.quiz_id = result.lastID;
        for(const [, q] of quiz.questions_list.entries()) {
            await this.db.run(
                `INSERT INTO ${QA_TABLE} (quiz_id, question_id, question_content, correct_answer, penalty)
                VALUES (?, ?, ?, ?, ?);`, [quiz.quiz_id, q.question_id, q.question_content, q.correct_answer, q.penalty]);
        }
    }

    public async getQuizById(quizId : number) {
        return this.db.get(
            `SELECT quiz_id, quiz_name, total_q
                 FROM ${QUIZ_TABLE}
                 WHERE quiz_id = ?;`, [quizId]);
    }

    public async getQuestionsByQuizId(quizId : number) {
        return this.db.all(
            `SELECT question_id, question_content, correct_answer, penalty
            FROM ${QA_TABLE}
            WHERE quiz_id = ?
            ORDER BY question_id ASC;`, [quizId]);
    }

    public async getAllQuizes() {
        return this.db.all(
            `SELECT quiz_id, quiz_name, total_q
                 FROM ${QUIZ_TABLE};`);
    }

    public async addStats(user_id : number, stats : answer_stats, quiz_id : number) {
        await this.db.run(
            `INSERT INTO ${USER_RES_TABLE} (user_id, quiz_id, score) VALUES (?, ?, ?);`, [user_id, quiz_id, stats.score]);
        for (let i = 0; i < stats.user_answer.length; ++i) {
            await this.db.run(
                `INSERT INTO ${USER_Q_STATS} (user_id, quiz_id, question_id, user_answer, time, correct)
                VALUES (?, ?, ?, ?, ?, ?);`, [user_id, quiz_id, i, stats.user_answer[i], stats.time_per_q[i], stats.correct_answer[i]]);
        }
    }

    public async getScore(user_id : number, quiz_id : number) {
        return this.db.get(
            `SELECT score
            FROM ${USER_RES_TABLE}
            WHERE quiz_id = ? AND user_id = ?;`, [quiz_id, user_id]);
    }

    public async getStats(user_id : number, quiz_id : number) {
        return this.db.all(
            `SELECT STAT.question_id AS question_id,
                        STAT.user_answer AS user_answer,
                        STAT.time AS time,
                        STAT.correct AS correct,
                        QA_1.correct_answer AS right_answer
            FROM ${USER_Q_STATS} AS STAT
            LEFT JOIN ${QA_TABLE} AS QA_1 ON STAT.quiz_id = QA_1.quiz_id AND STAT.question_id = QA_1.question_id
            WHERE STAT.quiz_id = ? AND STAT.user_id = ?
            ORDER BY STAT.question_id ASC;`, [quiz_id, user_id]);
    }

    public async getAvgTime(quiz_id: number, question_id: number): Promise<number> {
        return this.db.get(
            `SELECT AVG(time) AS avg
            FROM ${USER_Q_STATS}
            WHERE correct = 1 AND quiz_id = ? AND question_id = ?;`,
            [quiz_id, question_id]
        ).then((row) => (row && row.avg) ? row.avg : 0);
    }

    public async check_answers(stats : any, user_id : number, quiz_id : number) {
        const endTime = Date.now();

        const startTime = await this.db.get(
            `SELECT time FROM ${USER_QUIZ_START} WHERE quiz_id = ? AND user_id = ?;`, [quiz_id, user_id]);

        const serverTime = endTime - startTime.time;
        let globalScore = serverTime;

        const question_rows = await this.getQuestionsByQuizId(quiz_id);

        if(!is_answer_stats(stats, question_rows.length)) {
            console.log(stats);
            throw new Error("Invalid data provided");
        }

        let clientSumTime = 0;
        for (let i = 0; i < question_rows.length; ++i) {
            clientSumTime += stats.time_per_q[i];
        }

        for (let i = 0; i < question_rows.length; ++i) {
            const countedTime = (stats.time_per_q[i] / clientSumTime ) * serverTime ;
            stats.time_per_q[i] = Math.round(countedTime);

            if (question_rows[i].correct_answer === stats.user_answer[i]) {
                stats.correct_answer[i] = true;
            }
            else {
                globalScore += stats.penalty_per_q[i] * 1000;
                stats.correct_answer[i] = false;
            }
        }

        stats.score = globalScore;
    }

    public async checkQuizSolved(user_id : number, quiz_id : number) {
        const rows = await this.getScore(user_id, quiz_id);
        return rows !== undefined;
    }

    public async startTimer(user_id : number, quiz_id : number) {
        await this.db.run(
            `INSERT INTO ${USER_QUIZ_START} (user_id, quiz_id, time) VALUES (?, ?, ?);`, [user_id, quiz_id, Date.now()]);
    }

    public async getRanking(quiz_id : number) {
        return this.db.all(
            `SELECT score
            FROM ${USER_RES_TABLE}
            WHERE quiz_id = ?
            ORDER BY score DESC
            LIMIT 3;`, [quiz_id]);
    }

    public async checkIfQuizStarted(user_id : number, quiz_id : number) {
        const rows = await this.db.all(
            `SELECT * FROM ${USER_QUIZ_START} WHERE quiz_id = ? AND user_id = ?;`, [quiz_id, user_id]);

        return rows.length;
    }

    public async deleteQuizStarted(user_id : number, quiz_id : number) {
        await this.db.run(
            `DELETE FROM ${USER_QUIZ_START} WHERE quiz_id = ? AND user_id = ?;`, [quiz_id, user_id]);
    }
}
