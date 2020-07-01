import { answer_stats, quiz_t } from "./types.js";

class EndingManager {
    stats: answer_stats;

    constructor () {
        this.stats = JSON.parse(sessionStorage.getItem("current_stats"));
    }

    delete_stats(): void {
        this.stats.time_per_q = null;
        this.stats.correct_answer = null;
        this.stats.penalty_per_q = null;
        this.stats.user_answer = null;
        this.stats.total_q = null;
    }

    get_random_id(length: number = 10): string {
        return Math.random().toString(20).substr(2, length);
    }

    save_score_and_replay(agree_save_stats: boolean): void {
        if (!agree_save_stats)
            this.delete_stats();

        const stats_str: string = JSON.stringify(this.stats);

        const id: string = this.get_random_id();
        localStorage.setItem(id, stats_str);

        sessionStorage.clear();

        const params: string[] = window.location.pathname.split("/");
        const quiz_id = params[2];
        location.replace("start/" + quiz_id);
    }

    create_table(): void {
        const table: HTMLTableElement = document.getElementsByClassName("stats_table")[0] as HTMLTableElement;
        const total_q: number = this.stats.total_q;
        const MAX_COLUMN_NR: number = 3;

        for (let i = 0; i < total_q; ++i) {
            let new_row = table.insertRow(-1);
            let text_list: string[] = [];

            text_list.push(String(i + 1));
            if (this.stats.correct_answer[i])
                text_list.push("TAK");
            else
                text_list.push("NIE");

            text_list.push(String(this.stats.penalty_per_q[i]));

            for (let column = 0; column < MAX_COLUMN_NR; ++column) {
                const new_cell = new_row.insertCell(column);
                const text_node: Text = document.createTextNode(text_list[column]);
                new_cell.appendChild(text_node);
            }
        }
    }

    show_score(): void {
        const score = document.getElementsByClassName("score_text")[0] as HTMLParagraphElement;
        score.innerText = "Wynik: " + this.stats.score;
    }



    main() {
        // this.send_answers();

        const params: string[] = window.location.pathname.split("/");
        const quiz_id = params[2];
        location.replace("/user_stats" + quiz_id);

        // this.show_score();
        // this.create_table();

        document.getElementsByClassName('button_save_score')[0].addEventListener('click', () => this.save_score_and_replay(false));
        document.getElementsByClassName('button_save_score_stats')[0].addEventListener('click', () => this.save_score_and_replay(true));
    }
}

const EM = new EndingManager();
EM.main();
