export const biomarkerKeys = [
    "AlteredGrammar",
    "Anomia",
    "Pragmatic",
    "Pronunciation",
    "Prosody",
    "Turntaking",
] as const;

export const biomarkerColors = {
    AlteredGrammar:  "#9ca3af",
    Anomia:          "#805ad5",
    Pragmatic:       "#f472b6",
    Pronunciation:   "#34d399",
    Prosody:         "#fcd34d",
    Turntaking:      "#60a5fa",
} satisfies Record<(typeof biomarkerKeys)[number], string>;
