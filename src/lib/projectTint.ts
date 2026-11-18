/**
 * Reads a project's `color` (#rgb, #rgba, #rrggbb or #rrggbbaa) and returns it as #rrggbb for the page's
 * `--project` custom property. Colours too dark or too light to tint a surface (relative luminance under 0.03
 * or over 0.9, which includes the #000 several projects use) return null, and the page keeps its neutral surface.
 */
export function projectTint(hex: string): string | null {
  const digits = hex.trim().replace(/^#/, "");
  if (![3, 4, 6, 8].includes(digits.length) || /[^0-9a-f]/i.test(digits)) return null;

  const full = digits.length <= 4 ? [...digits].map((c) => c + c).join("") : digits;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const linear = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);

  if (luminance < 0.03 || luminance > 0.9) return null;
  return `#${full.slice(0, 6).toLowerCase()}`;
}
