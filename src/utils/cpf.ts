const CPF_LENGTH: number = 11;

function calculateCheckDigit(base: number[], initialWeight: number): number {
  const sum: number = base.reduce(
    (accumulator: number, digit: number, index: number): number =>
      accumulator + digit * (initialWeight - index),
    0,
  );
  const remainder: number = (sum * 10) % 11;

  return remainder === 10 ? 0 : remainder;
}

export function isValidCpf(cpf: string): boolean {
  if (!new RegExp(`^\\d{${CPF_LENGTH}}$`).test(cpf)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits: number[] = cpf.split("").map(Number);
  const firstDigit: number = calculateCheckDigit(digits.slice(0, 9), 10);
  const secondDigit: number = calculateCheckDigit(digits.slice(0, 10), 11);

  return digits[9] === firstDigit && digits[10] === secondDigit;
}
