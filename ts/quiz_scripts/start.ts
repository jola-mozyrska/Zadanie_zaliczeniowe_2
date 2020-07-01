import { answer_stats } from "./types.js";

function go_first_page(): void {
    const params : string [] = window.location.pathname.split("/");
    const quiz_id = params[2];
    location.replace("/question/" + quiz_id);
}

function get_n_best_scores(): number[] {
    const scores: number[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const stats: answer_stats = JSON.parse(localStorage.getItem(localStorage.key(i)));
        scores.push(stats.score);
    }

    return scores.sort((a, b) => {
        return a - b;
    });
}

function insert_cell(column: number, text: string, row: HTMLTableRowElement) {
    let id_cell = row.insertCell(column);
    let text_node: Text = document.createTextNode(text);
    id_cell.appendChild(text_node);
}

function show_n_best_scores(n: number): void {
    const best_scores: number[] = get_n_best_scores();
    if (best_scores.length === 0)
        return;

    const table: HTMLTableElement = document.getElementsByClassName("best_scores")[0] as HTMLTableElement;
    table.removeAttribute('hidden');

    if (best_scores.length < n)
        n = best_scores.length;

    for (let i = 0; i < n; ++i) {
        const new_row: HTMLTableRowElement = table.insertRow(-1);
        insert_cell(0, String(i + 1) + ".", new_row);
        insert_cell(1, String(best_scores[i]), new_row);
    }
}

//========================================================================================
show_n_best_scores(3);
document.getElementsByClassName('start_button')[0].addEventListener('click', go_first_page);