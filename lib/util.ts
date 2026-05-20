export function fmt(n: number): string {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return Math.floor(n).toString();
  const units = ['k', 'M', 'B', 'T', 'aa', 'bb', 'cc', 'dd', 'ee'];
  let u = -1;
  let val = n;
  while (val >= 1000 && u < units.length - 1) {
    val /= 1000;
    u++;
  }
  return val.toFixed(val < 10 ? 2 : val < 100 ? 1 : 0) + units[u];
}

export function clsx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}
