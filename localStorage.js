export class HighScores {
    static get() {
        let str = localStorage.getItem('scores');

        try {
            let scores = JSON.parse(str);
            if (Array.isArray(scores))
                return scores;
        } catch {
            return [];
        }
        return [];
    }

    static top(n) {
        const s = HighScores.get();
        s.sort((a, b) => b.score - a.score);
        return s.slice(0, n);
    }

    static add(size, time, score) {
        const hs = { size, time, score };
        console.log({ novScore: hs })
        const scores = HighScores.get();
        scores.push(hs);
        localStorage.setItem('scores', JSON.stringify(scores));
    }

    static reset() {
        localStorage.setItem('scores', JSON.stringify([]));
    }
}

const DEFAULTS = {
    volume: .75,
}

export class Settings {
    static read() {
        let str = localStorage.getItem('settings');
        try {
            let settings = JSON.parse(str);
            if (typeof settings == 'object')
                window._one_settings = settings;
            else
                window._one_settings = DEFAULTS;
        } catch {
            window._one_settings = DEFAULTS;
        }

        return window._one_settings;
    }

    static save(settings) {
        localStorage.setItem('settings', JSON.stringify(window._one_settings));
    }

    static get settings() {
        return window._one_settings;
    }

    static reset() {
        localStorage.setItem('settings', JSON.stringify(DEFAULTS));
    }
}