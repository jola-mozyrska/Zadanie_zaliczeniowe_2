export type answer_stats = {
    score: number;
    total_q: number;
    time_per_q: number[];
    user_answer: number[];
    correct_answer: boolean[];
    penalty_per_q: number[];
}

export type quiz_t = {
    quiz_name: string,
    quiz_desc: string,
    quiz_id: number,
    total_q: number,
    questions_list: question_t[]
}

export type question_t = {
    question_id: number,
    question_content: string,
    correct_answer: number,
    penalty: number
}

function verifyArray(obj: any[], type: string) {
    for(const elem of obj) {
        if(typeof(elem) !== type) {
            return false;
        }
    }
    return true;
}

export function is_question_t(obj: any): obj is question_t {
    if(typeof(obj) !== "object") {
        return false;
    }
    if(!("question_id" in obj) || typeof(obj.question_id) !== "number") {
        return false;
    }

    if(!("question_content" in obj) || typeof(obj.question_content) !== "string") {
        return false;
    }

    if(!("correct_answer" in obj) || typeof(obj.correct_answer) !== "number") {
        return false;
    }

    if(!("penalty" in obj) || typeof(obj.penalty) !== "number") {
        return false;
    }

    return true;
}

export function is_quiz(obj: any): obj is quiz_t {
    if(typeof(obj) !== "object") {
        return false;
    }

    if(!("quiz_name" in obj) || typeof(obj.quiz_name) !== "string") {
        return false;
    }

    if(!("quiz_desc" in obj) || typeof(obj.quiz_desc) !== "string") {
        return false;
    }

    if(!("quiz_id" in obj) || typeof(obj.quiz_id) !== "number") {
        return false;
    }

    if(!("total_q" in obj) || typeof(obj.total_q) !== "number") {
        return false;
    }

    if(!("questions_list" in obj) || !Array.isArray(obj.questions_list)) {
        return false;
    }

    if(obj.questions_list.length !== obj.total_q) {
        return false;
    }

    for(let i = 0; i < obj.questions_list.length; i++) {
        if(!is_question_t(obj.questions_list[i])) {
            return false;
        }
        if(obj.questions_list[i].question_id !== i) {
            return false;
        }
    }
    return true;
}

export function is_answer_stats(obj: any, amount: number): obj is answer_stats {
    if(typeof(obj) !== "object") {
        return false;
    }

    if(!("score" in obj) || typeof(obj.score) !== "number") {
        return false;
    }

    if(!("total_q" in obj) || typeof(obj.total_q) !== "number") {
        return false;
    }

    if(!("time_per_q" in obj) || !Array.isArray(obj.time_per_q) || !verifyArray(obj.time_per_q, "number") || obj.time_per_q.length != amount) {
        return false;
    }

    if(!("user_answer" in obj) || !Array.isArray(obj.user_answer) || !verifyArray(obj.user_answer, "number") || obj.user_answer.length != amount) {
        return false;
    }

    if(!("correct_answer" in obj) || !Array.isArray(obj.correct_answer) || !verifyArray(obj.correct_answer, "boolean") || obj.correct_answer.length != amount) {
        return false;
    }

    if(!("penalty_per_q" in obj) || !Array.isArray(obj.penalty_per_q) || !verifyArray(obj.penalty_per_q, "number") || obj.penalty_per_q.length != amount) {
        return false;
    }

    return true;
}
