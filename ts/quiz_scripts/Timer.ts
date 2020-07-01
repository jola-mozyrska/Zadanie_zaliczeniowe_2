export class Timer {
    sum_time: number;
    new_start: number;

    constructor() {
        this.new_start = 0;
        this.sum_time = 0;
    }

    start(): void {
        this.new_start = Date.now();
    }

    pause(): void {
        if (this.new_start > 0)
            this.sum_time += Date.now() - this.new_start;
        this.new_start = 0;
    }

    get_time_number(): number {
        let result: number = this.sum_time;
        if (this.new_start > 0)
            result += Date.now() - this.new_start;
        return result;
    }

    get_rounded_time_number(): number {
        const result: number = this.get_time_number();
        return Math.floor(result / 1000);
    }

    get_time_str(): string {
        const result: number = this.get_time_number();
        const seconds: string = String(Math.floor(result / 1000)).padStart(2, '0');
        const frac: string = String(Math.round(result % 1000)).padStart(3, '0');
        return seconds + '.' + frac;
    }

    start_global_timer(page_elem: HTMLSelectElement): void {
        setInterval(() => {
            const val = this.get_time_str();
            page_elem.innerText = "Stoper: " + val + " s";
        }, 40);
        this.start();
    }

    stop_global_timer(): void {
        this.pause();
    }
}