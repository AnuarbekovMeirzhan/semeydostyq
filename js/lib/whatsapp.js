export function formatPhoneInput(rawValue) {
  let digits = rawValue.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith('7')) digits = `7${digits}`;
  digits = digits.slice(0, 11);

  const area = digits.slice(1, 4);
  const part1 = digits.slice(4, 7);
  const part2 = digits.slice(7, 9);
  const part3 = digits.slice(9, 11);

  let result = '+7';
  if (area) {
    result += ` (${area}`;
    if (part1) result += ')';
  }
  if (part1) result += ` ${part1}`;
  if (part2) result += `-${part2}`;
  if (part3) result += `-${part3}`;
  return result;
}

export function isValidPhone(formatted) {
  const digits = formatted.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('7');
}

export function buildLeadMessage({ name, phone, direction }) {
  return `Здравствуйте! Меня зовут ${name}, интересует направление: ${direction}. Телефон: ${phone}`;
}

export function buildWhatsAppLink(centerPhone, message) {
  const digits = centerPhone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
