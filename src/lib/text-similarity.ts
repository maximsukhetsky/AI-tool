// Share of changed tokens at or below which a rewrite counts as "minor".
const MINOR_CHANGE_RATIO = 0.1;

export type ChangeLevel = "none" | "minor" | "major";

// Words and individual punctuation marks, case-insensitive, so reordering "вакансія?" isn't one opaque token.
function tokenize(text: string) {
  return text.toLowerCase().match(/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu) ?? [];
}

// Length of the longest common subsequence of two token lists, in O(min) memory.
function commonSubsequenceLength(a: string[], b: string[]) {
  let previous = new Uint32Array(b.length + 1);
  let current = new Uint32Array(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      current[j] = a[i - 1] === b[j - 1] ? previous[j - 1] + 1 : Math.max(previous[j], current[j - 1]);
    }
    [previous, current] = [current, previous];
  }
  return previous[b.length];
}

// How much a rewrite differs from the original: tokens removed plus tokens added, relative to both texts.
export function getChangeLevel(before: string, after: string): ChangeLevel {
  if (before.trim() === after.trim()) return "none";

  const a = tokenize(before);
  const b = tokenize(after);
  const total = a.length + b.length;
  if (total === 0) return "none";

  const common = commonSubsequenceLength(a, b);
  const changed = a.length - common + (b.length - common);
  return changed / total <= MINOR_CHANGE_RATIO ? "minor" : "major";
}
