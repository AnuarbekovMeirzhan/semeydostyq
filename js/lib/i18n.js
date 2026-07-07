export function getNested(obj, path) {
  return path.split('.').reduce(
    (acc, key) => (acc != null && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined),
    obj,
  );
}

export function applyTranslations(root, data) {
  const nodes = root.querySelectorAll('[data-i18n]');
  nodes.forEach((node) => {
    const key = node.getAttribute('data-i18n');
    const value = getNested(data, key);
    if (typeof value === 'string') {
      node.textContent = value;
    }
  });
}
