/** HN usernames: letters, digits, underscore, hyphen; 2 to 15 chars on HN, accept 1 to 15. */
export const isAuthor = (name: string) => /^[A-Za-z0-9_-]{1,15}$/.test(name);

/** "on HN 2014 to 2024", or "on HN 2019" for a single year. Input months are YYYY-MM. */
export function activeSpan(months: string[]) {
  let lo = "9999", hi = "0000";
  for (const m of months) {
    if (m < lo) lo = m;
    if (m > hi) hi = m;
  }
  const [a, b] = [lo.slice(0, 4), hi.slice(0, 4)];
  return a === b ? `on HN ${a}` : `on HN ${a} to ${b}`;
}
