const quiz1 = {
    "quiz_name": "Arytmetyka dla odważnych",
    "quiz_desc": "Wielkie pytania o życie, wszechświat i całą resztę",
    "quiz_id": 0,
    "total_q": 4,
    "questions_list": [
        {
            "question_id": 0,
            "question_content": "((5 | 3) xor 28) + 16 =",
            "correct_answer": 43,
            "penalty": 10
        },
        {
            "question_id": 1,
            "question_content": "21 xor 63",
            "correct_answer": 42,
            "penalty": 2
        },
        {
            "question_id": 2,
            "question_content": "10 | 32 =",
            "correct_answer": 42,
            "penalty": 3
        },
        {
            "question_id": 3,
            "question_content": "6 + 36 =",
            "correct_answer": 42,
            "penalty": 1
        }
    ]
}

const quiz2 = {
    "quiz_name": "Proste dodawanie",
    "quiz_desc": "Coś dla znudzonych przedszkolaków",
    "quiz_id": 0,
    "total_q": 4,
    "questions_list": [
        {
            "question_id": 0,
            "question_content": "4 + 4 =",
            "correct_answer": 8,
            "penalty": 10
        },
        {
            "question_id": 1,
            "question_content": "3 * 6",
            "correct_answer": 18,
            "penalty": 2
        },
        {
            "question_id": 2,
            "question_content": "10 + 32 =",
            "correct_answer": 42,
            "penalty": 3
        },
        {
            "question_id": 3,
            "question_content": "6 + 36 =",
            "correct_answer": 42,
            "penalty": 1
        }
    ]
}




export const quizList = [quiz1, quiz2];
