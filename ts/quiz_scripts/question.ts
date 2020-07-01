import { answer_stats, quiz_t } from "./types.js";
import { Timer } from "./Timer.js";

// const quiz_str: string = `{
//     "quiz_name": "nazwa",
//     "quiz_desc": "desc",
//     "quiz_id": 0,
//     "total_q": 4,
//     "questions_list": [
//         {
//             "question_id": 0,
//             "question_content": "((5 | 3) xor 28) + 16 =",
//             "correct_answer": 43,
//             "penalty": 10
//         },
//         {
//             "question_id": 1,
//             "question_content": "21 xor 63",
//             "correct_answer": 42,
//             "penalty": 2
//         },
//         {
//             "question_id": 2,
//             "question_content": "10 | 32 =",
//             "correct_answer": 42,
//             "penalty": 3
//         },
//         {
//             "question_id": 3,
//             "question_content": "6 + 36 =",
//             "correct_answer": 42,
//             "penalty": 1
//         }
//     ]
// }`;

class QuestionManager {
    quiz_dict: quiz_t;
    answered_cnt: number;
    curr_q_id: number;
    total_q: number;
    stats: answer_stats;
    timers: Timer[];
    global_timer: Timer;
    timer_DOM_elem: HTMLSelectElement;

    constructor () {
        this.answered_cnt = 0;
        this.curr_q_id = -1;
        this.timers = [];
        this.global_timer= new Timer();

        this.timer_DOM_elem = document.getElementsByClassName('stoper')[0] as HTMLSelectElement;
        this.global_timer.start_global_timer(this.timer_DOM_elem);
    }

    async main() {
        this.quiz_dict = await this.fetch_quiz();

        this.total_q = this.quiz_dict.total_q;

        while (this.total_q > this.timers.length) {
            const t = new Timer();
            this.timers.push(t);
        }

        this.stats = this.prepare_empty_stats();

        (document.querySelector('input[type="number"]') as HTMLInputElement).addEventListener('input', () => this.save_current_answer());
        document.getElementsByClassName("right_arrow")[0].addEventListener('click', () => this.go_next_question());
        document.getElementsByClassName("left_arrow")[0].addEventListener('click', () => this.go_previous_question());
        document.getElementsByClassName('end_quiz_button')[0].addEventListener('click', () => this.go_end_page());
        document.getElementsByClassName('cancel_button')[0].addEventListener('click', () => this.cancel_quiz());

        this.go_next_question();
    }

    async fetch_quiz() {
        const params : string [] = window.location.pathname.split("/");
        const quiz_id = params[2];
        const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const q: quiz_t = await fetch("/fetch_quiz/" + quiz_id, {
            method : 'POST',
            headers: {
                'CSRF-Token': token
            }
        }).then((res) => res.json())
        .catch(() => location.replace("/user_stats/" + quiz_id));

        return q;
    }

    adjust_page(): void {
            this.load_old_answer();
            this.load_curr_q();
            this.adjust_arrows_view();
            this.show_penalty();
            this.timers[this.curr_q_id].start();
        }

    show_penalty(): void {
            const penalty: number = this.quiz_dict.questions_list[this.curr_q_id].penalty;
            (document.getElementsByClassName('penalty')[0] as HTMLDivElement).innerText = "Kara: " + String(penalty) + "s";
        }

    go_next_question(): void {
            if (this.curr_q_id >= 0)
                this.timers[this.curr_q_id].pause();
            ++this.curr_q_id;
            this.adjust_page();
        }

    go_previous_question(): void {
            this.timers[this.curr_q_id].pause();
            --this.curr_q_id;
            this.adjust_page();
        }

    update_finish_button(): void {
            if (this.answered_cnt === this.total_q)
                document.getElementsByClassName('end_quiz_button')[0].removeAttribute('disabled');
            else
                document.getElementsByClassName('end_quiz_button')[0].setAttribute('disabled', 'yes');
        }

    save_current_answer(): void {
            const answer_str: string = (document.getElementsByClassName('answer')[0] as HTMLInputElement).value;
            let answer: number = Number(answer_str);
            if (answer_str === "")
                answer = null;

            if (this.stats.user_answer[this.curr_q_id] == null && answer != null)
                ++this.answered_cnt;
            else if (this.stats.user_answer[this.curr_q_id] != null && answer == null)
                --this.answered_cnt;

            this.stats.user_answer[this.curr_q_id] = answer;

            this.update_finish_button();
        }

    load_old_answer(): void {
            const answer: number = this.stats.user_answer[this.curr_q_id];
            (document.getElementsByClassName('answer')[0] as HTMLInputElement).value = String(answer);
        }

    adjust_arrows_view(): void {
            if (this.curr_q_id === 0)
                document.getElementsByClassName("left_arrow")[0].setAttribute('hidden', 'yes');

            if (this.curr_q_id === this.quiz_dict.total_q - 1)
                document.getElementsByClassName("right_arrow")[0].setAttribute('hidden', 'yes');

            if (this.curr_q_id !== 0 && this.curr_q_id !== this.quiz_dict.total_q - 1) {
                document.getElementsByClassName("left_arrow")[0].removeAttribute('hidden');
                document.getElementsByClassName("right_arrow")[0].removeAttribute('hidden');
            }
        }

    load_curr_q(): void {
            (document.getElementsByClassName('q_content')[0] as HTMLDivElement).innerText = this.quiz_dict.questions_list[this.curr_q_id].question_content;
            (document.getElementsByClassName('q_id')[0] as HTMLDivElement).innerText = "Pytanie " + (this.curr_q_id + 1) + " z " + this.total_q;
        }

    save_timers(): void {
            const times: number[] = this.stats.time_per_q;
            for (let i = 0; i < times.length; ++i)
            this.stats.time_per_q[i] = this.timers[i].get_time_number();
        }

    async send_answers() {
        const params: string[] = window.location.pathname.split("/");
        const quiz_id = params[2];
        const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const stats_str: string = JSON.stringify(this.stats);
        console.log("Sending stats:", this.stats);
        const q: quiz_t = await fetch("/send_quiz/" + quiz_id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': token
            },
            body: stats_str
        }).then((res) => res.json())
            .catch(() => location.replace("/error"));
    }

    async go_end_page() {
        this.global_timer.stop_global_timer();
        this.timers[this.curr_q_id].pause();
        // this.check_answers();
        this.save_timers();
        // const stats_str: string = JSON.stringify(this.stats);
        // sessionStorage.setItem("current_stats", stats_str);

        const params : string [] = window.location.pathname.split("/");
        const quiz_id = params[2];
        // location.replace("the_end/" + quiz_id);

        await this.send_answers();
        location.replace("/user_stats/" + quiz_id);
    }

    cancel_quiz(): void {
            const params : string [] = window.location.pathname.split("/");
            const quiz_id = params[2];
            location.replace("/start/" + quiz_id);
        }

    resize<T>(arr: T[], new_size: number, default_value: T): void {
            while (new_size > arr.length)
                arr.push(default_value);
            arr.length = new_size;
        }

    prepare_empty_stats(): answer_stats {
            const stats: answer_stats = {
                score: 0,
                total_q: this.total_q,
                time_per_q: [],
                user_answer: [],
                correct_answer: [],
                penalty_per_q: []
            }

            const new_size = stats.total_q;
            this.resize(stats.time_per_q, new_size, 0);
            this.resize(stats.user_answer, new_size, null);
            this.resize(stats.correct_answer, new_size, false);
            this.resize(stats.penalty_per_q, new_size, 0);
            return stats;
        }
}

const QM = new QuestionManager();
QM.main();