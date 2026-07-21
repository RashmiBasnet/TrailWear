"use client";

import { useMemo } from "react";
import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as zxcvbnCommon from "@zxcvbn-ts/language-common";
import * as zxcvbnEn from "@zxcvbn-ts/language-en";

const zxcvbn = new ZxcvbnFactory({
    dictionary: {
        ...zxcvbnCommon.dictionary,
        ...zxcvbnEn.dictionary,
    },
    graphs: zxcvbnCommon.adjacencyGraphs,
    translations: zxcvbnEn.translations,
});

export const MINIMUM_SCORE = 3;

const LEVELS = [
    { label: "Very weak", bar: "bg-danger", text: "text-danger" },
    { label: "Weak", bar: "bg-danger", text: "text-danger" },
    { label: "Fair", bar: "bg-gold-500", text: "text-gold-700" },
    { label: "Good", bar: "bg-gold-400", text: "text-gold-700" },
    { label: "Strong", bar: "bg-success", text: "text-success" },
];

export function scorePassword(password: string, userInputs: string[] = []) {
    if (!password) return null;
    return zxcvbn.check(password, userInputs.filter(Boolean));
}

export default function PasswordStrengthMeter({
    password,
    userInputs = [],
}: {
    password: string;
    userInputs?: string[];
}) {
    const result = useMemo(
        () => scorePassword(password, userInputs),
        [password, userInputs.join("|")]
    );

    if (!result) return null;

    const level = LEVELS[result.score];
    const filled = Math.max(result.score, 1);
    const crackTime = result.crackTimes?.offlineSlowHashingXPerSecond?.display ?? "";

    return (
        <div className="mt-2">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                    <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i < filled ? level.bar : "bg-navy-100"
                        }`}
                    />
                ))}
            </div>

            <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className={`text-xs font-medium ${level.text}`}>{level.label}</span>
                {crackTime && (
                    <span className="text-[11px] text-navy-300">
                        Guessed in ~{crackTime}
                    </span>
                )}
            </div>

            {}
            {result.feedback.warning && (
                <p className="mt-1 text-xs text-gold-700">{result.feedback.warning}</p>
            )}
            {result.score < MINIMUM_SCORE && result.feedback.suggestions.length > 0 && (
                <p className="mt-1 text-xs text-navy-400">{result.feedback.suggestions[0]}</p>
            )}
        </div>
    );
}
