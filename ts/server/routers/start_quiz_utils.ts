import * as express from "express";

import {QuizManager} from "../storage/QuizManager";
import {User, requireLoggingInAPI} from "../storage/User";
import { beginExclusiveTrans } from "../utils";

const apiRouter = express.Router();

apiRouter.post("/fetch_quiz/:quiz_id(\\d+)", requireLoggingInAPI, beginExclusiveTrans, async (req, res) => {
    const qm = res.locals.quizManager as QuizManager;
    const quizInfoRow = await qm.getQuizById(Number(req.params.quiz_id));
    const questionsRows = await qm.getQuestionsByQuizId(Number(req.params.quiz_id));

    const quiz = {
        quiz_id : quizInfoRow.quiz_id,
        total_q : quizInfoRow.total_q,
        questions_list : questionsRows
    };

    const user_id : number = (res.locals.user as User).id;
    const quiz_id : number= Number(req.params.quiz_id);

    if(await qm.checkQuizSolved(user_id, quiz_id)) {
        res.status(403);
        res.json({error: "Quiz already solved"});
        return;
    }

    await qm.startTimer(user_id, quiz_id);
    res.locals.commit = true;
    return res.json(quiz);
});

apiRouter.post("/send_quiz/:quiz_id(\\d+)", requireLoggingInAPI, beginExclusiveTrans, async (req, res) => {
    const qm = res.locals.quizManager as QuizManager;
    const stats = req.body;

    const user_id : number = (res.locals.user as User).id;
    const quiz_id : number= +req.params.quiz_id;

    const started = await qm.checkIfQuizStarted(user_id, quiz_id);
    if(!started) {
        res.status(403);
        res.json({error: "Quiz already solved"});
        return;
    }

    try {
        await qm.check_answers(stats, user_id, quiz_id);
    } catch(err) {
        return res.status(400).json(err);
    }


    await qm.deleteQuizStarted(user_id, quiz_id);

    await qm.addStats((res.locals.user as User).id, stats, quiz_id);
    res.locals.commit = true;
    res.json("success");
});

export {apiRouter};
