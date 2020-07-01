import * as express from "express";
import {QuizManager} from "../storage/QuizManager";
import {User, requireLoggingIn} from "../storage/User";
import {errorPage} from "../utils";
import {checkIfLogged} from "../utils";
import { quiz_t, is_quiz } from "../../quiz_scripts/types";
import { beginExclusiveTrans } from "../utils";

const pageRouter = express.Router();

pageRouter.get("/", (req, res) => res.redirect("/choose_quiz"));

pageRouter.get('/choose_quiz', async (req, res) => {
    const qm = res.locals.quizManager as QuizManager;
    return qm.getAllQuizes()
    .then((qs) => res.render('choose_quiz', {quizes : qs}))
    .catch((err) => errorPage(res, 500, `Error: ${err}`));
})

pageRouter.get("/quiz_ranking/:quiz_id(\\d+)", async (req, res) => {
    const qm = res.locals.quizManager as QuizManager;
    const quiz_id : number = Number(req.params.quiz_id);
    const rankingRows = await qm.getRanking(quiz_id);
    return res.render("quiz_ranking", {rankingRows});
});

pageRouter.get("/user_stats/:quiz_id(\\d+)", checkIfLogged, async (req, res) => {
    const qm = res.locals.quizManager as QuizManager;
    const user_id : number = (res.locals.user as User).id;
    const quiz_id : number = Number(req.params.quiz_id);
    const score = await qm.getScore(user_id, quiz_id);
    const questions = await qm.getStats(user_id, quiz_id);
    for(let i = 0; i < questions.length; i++) {
        questions[i].avg_time = await qm.getAvgTime(quiz_id, i);
    }
    return res.render('user_stats', {score, questions});
});

pageRouter.get('/choose_option/:quiz_id', async (req, res) => {
    res.render('choose_option', {quiz_id : req.params.quiz_id});
});

pageRouter.get("/start/:quiz_id(\\d+)", async (req, res) => {
    const qm = res.locals.quizManager as QuizManager;
    const user_id : number = (res.locals.user as User).id;
    const quiz_id : number= Number(req.params.quiz_id);

    if(await qm.checkQuizSolved(user_id, quiz_id)) {
        return res.redirect('/user_stats/' + quiz_id);
    }

    const row = await qm.getQuizDescById(quiz_id);
    return res.render(`start`, {quiz_desc : row.quiz_desc});
});

pageRouter.get("/question/:quiz_id(\\d+)", requireLoggingIn, async (req, res) => {
    return res.render(`question`);
});

pageRouter.get("/the_end/:quiz_id(\\d+)", requireLoggingIn, async (req, res) => {
    return res.render(`the_end`);
});

const example_json : string =
`{
    "quiz_name": "nazwa",
    "quiz_desc": "opis",
    "quiz_id": 0,
    "total_q": 1,
    "questions_list": [
        {
            "question_id": 0,
            "question_content": "2 + 2 =",
            "correct_answer": 4,
            "penalty": 10
        }
    ]
}`;

const message_how_to = `Wpisz quiz w postaci json z atrybutami: quiz_name: string, quiz_desc: string, quiz_id: number, total_q: number, questions_list:
{question_id: number, question_content: string, correct_answer: number, penalty: number}, np.`;

pageRouter.get("/create_quiz", requireLoggingIn, async (req, res) => {
    return res.render(`create_quiz`, {message_how_to, example_json});
});

pageRouter.post("/create_quiz", requireLoggingIn, beginExclusiveTrans, async (req, res) => {
    let quiz : any;
    try {
        quiz = JSON.parse(req.body.quiz);
    } catch(e) {
        return res.render('error', {message : "Obiekt nie jest JSONem"});
    }

    if(!is_quiz(quiz)) {
        console.log(quiz);
        return res.render('error', {message : "Error"});
    }

    const newQuiz : quiz_t = quiz;
    const qm = res.locals.quizManager as QuizManager;
    await qm.addNewQuiz(newQuiz);

    return res.render('create_quiz', {message: "Quiz został dodany"});
});

export {pageRouter};
