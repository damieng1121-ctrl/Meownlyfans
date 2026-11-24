"use client";

import { useSyncExternalStore } from "react";

const PUNS = [
  "Stay pawsitive 🐾",
  "Made with 🐾 for cats everywhere",
  "You've cat to be kitten me 😹",
  "Purrfection, one photo at a time",
  "Fur real, these cats are the best",
  "Meow you doing? 😺",
  "Hiss-terically good content",
  "Claw-some cats only",
  "Living our nine best lives",
  "Feline good today? 🐈",
];

const noop = () => () => {};
let pick: string | null = null;

export function CatPun() {
  // A new pun on every visit; the server renders the first one.
  const pun = useSyncExternalStore(
    noop,
    () => (pick ??= PUNS[Math.floor(Math.random() * PUNS.length)]),
    () => PUNS[1],
  );
  return <>{pun}</>;
}
