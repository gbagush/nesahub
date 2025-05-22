import { badWords, symbolToChar } from "./dictionary";

const normalizeText = (text: string): string => {
  text = text.toLowerCase();

  let normalized = "";
  for (const char of text) {
    normalized += (symbolToChar[char] as string) || char;
  }

  return normalized;
};

export const containsBadWord = (text: string): boolean => {
  const cleanedText = normalizeText(text);

  const words = cleanedText.split(/\W+/);

  for (const word of badWords) {
    if (word.includes("*")) {
      const sanitizedWord = word.replace(/\*/g, "");
      if (words.includes(sanitizedWord)) {
        return true;
      }
    } else if (words.includes(word)) {
      return true;
    }
  }

  return false;
};
