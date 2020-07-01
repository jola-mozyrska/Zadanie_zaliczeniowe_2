import * as express from "express";
import {QuizManager} from "../storage/QuizManager";
import {User, requireLoggingIn} from "../storage/User";
import {errorPage} from "../utils";
import {checkIfLogged} from "../utils";
import { quiz_t, is_quiz } from "../../quiz_scripts/types";

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
    return res.render(`start`);
});

pageRouter.get("/question/:quiz_id(\\d+)", requireLoggingIn, async (req, res) => {
    return res.render(`question`);
});

pageRouter.get("/the_end/:quiz_id(\\d+)", requireLoggingIn, async (req, res) => {
    return res.render(`the_end`);
});

pageRouter.get("/create_quiz", requireLoggingIn, async (req, res) => {
    return res.render(`create_quiz`);
});

pageRouter.post("/create_quiz", requireLoggingIn, async (req, res) => {
    const quiz = JSON.parse(req.body.quiz);
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
