const residentNumber = /(?<!\d)(?:\d{6}[^\S\r\n]*-[^\S\r\n]*\d{7}|\d{13})(?!\d)/g;

// Keep the name on its own line or before the next labeled field.
const nameField = /(성명:[^\S\r\n]*)([\p{L}\p{M}]+(?:[^\S\r\n]+(?!(?:\p{L}+[^\S\r\n]+)?성명:|\p{L}+[^\S\r\n]*:)[\p{L}\p{M}]+)*)/gu;

export function maskText(text: string): string {
  return text
    .replace(residentNumber, "******-*******")
    .replace(nameField, (_match: string, label: string, name: string) => {
      let keepFirst = true;
      const maskedName = name.replace(/\p{L}\p{M}*/gu, (letter) => {
        if (!keepFirst) return "*";
        keepFirst = false;
        return letter;
      });

      return label + maskedName;
    });
}
