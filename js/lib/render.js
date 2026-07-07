export function renderItems(container, items, toHTML) {
  container.innerHTML = items.map(toHTML).join('');
}

export function courseCardHTML(item) {
  return `
    <article class="course-card">
      <h3 class="course-card__name">${item.name}</h3>
      <p class="course-card__grades">${item.grades}</p>
      <p class="course-card__description">${item.description}</p>
    </article>
  `;
}

export function statCardHTML(item) {
  return `
    <div class="stat-card">
      <span class="stat-card__value">${item.value}</span>
      <span class="stat-card__label">${item.label}</span>
    </div>
  `;
}

export function advantageCardHTML(item) {
  return `
    <article class="advantage-card">
      <h3 class="advantage-card__title">${item.title}</h3>
      <p class="advantage-card__description">${item.description}</p>
    </article>
  `;
}

export function teamCardHTML(item) {
  return `
    <article class="team-card">
      <img class="team-card__photo" src="${item.photo}" alt="${item.name}">
      <h3 class="team-card__name">${item.name}</h3>
      <p class="team-card__subject">${item.subject}</p>
      <p class="team-card__experience">${item.experience}</p>
    </article>
  `;
}

export function galleryImageHTML(src) {
  return `<img class="gallery__image" src="${src}" alt="">`;
}

export function testimonialCardHTML(item) {
  return `
    <blockquote class="testimonial-card">
      <p class="testimonial-card__text">${item.text}</p>
      <cite class="testimonial-card__author">${item.author}</cite>
    </blockquote>
  `;
}

export function priceCardHTML(item) {
  return `
    <div class="price-card">
      <h3 class="price-card__direction">${item.direction}</h3>
      <p class="price-card__value">${item.price}</p>
    </div>
  `;
}

export function faqItemHTML(item, index) {
  return `
    <div class="faq-item" data-faq-index="${index}">
      <button class="faq-item__question" type="button" aria-expanded="false">${item.question}</button>
      <div class="faq-item__answer" hidden>${item.answer}</div>
    </div>
  `;
}

export function directionOptionHTML(label, index) {
  return `<option value="${index}">${label}</option>`;
}
