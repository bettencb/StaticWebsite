---
layout: default
title: Bundle Sales Page 
---
<div class="banner">
  <h1>Bundle Sales Examples</h1>
</div>

<div class="cards-container">
  <div class="card">
    <img src="{{ '/assets/images/random-1_thumbnail.webp' | relative_url }}" alt="Basic Kit">
    <h3>Basic</h3>
    <p>A great starting point with the essentials you need to get up and running.</p>
  </div>
  <div class="card">
    <img src="{{ '/assets/images/random-2_thumbnail.webp' | relative_url }}" alt="Medium Kit">
    <h3>Medium</h3>
    <p>Step up your game with additional tools and expanded resources.</p>
  </div>
  <div class="card">
    <img src="{{ '/assets/images/random-3_thumbnail.webp' | relative_url }}" alt="Pro Kit">
    <h3>Pro</h3>
    <p>The complete package with everything included for the serious enthusiast.</p>
  </div>
</div>

<div class="carousel-section">
  <h2>Featured Picks</h2>
  <div class="carousel">
    <button class="carousel-btn prev" aria-label="Previous">&#8249;</button>
    <div class="carousel-track">
      <div class="carousel-card">
        <img src="{{ '/assets/images/random-1_thumbnail.webp' | relative_url }}" alt="Starter Pick">
        <h3>Starter Pick</h3>
        <p>Handpicked essentials for those just beginning their journey.</p>
      </div>
      <div class="carousel-card">
        <img src="{{ '/assets/images/random-2_thumbnail.webp' | relative_url }}" alt="Explorer Pick">
        <h3>Explorer Pick</h3>
        <p>Curated selections for adventurers ready to level up.</p>
      </div>
      <div class="carousel-card">
        <img src="{{ '/assets/images/random-3_thumbnail.webp' | relative_url }}" alt="Expert Pick">
        <h3>Expert Pick</h3>
        <p>Premium choices for seasoned enthusiasts who want the best.</p>
      </div>
    </div>
    <button class="carousel-btn next" aria-label="Next">&#8250;</button>
  </div>
</div>

<script>
  const track = document.querySelector('.carousel-track');
  const cards = document.querySelectorAll('.carousel-card');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  let current = 0;

  function showCard(index) {
    cards.forEach((card, i) => {
      card.classList.toggle('active', i === index);
    });
  }

  prevBtn.addEventListener('click', () => {
    current = (current - 1 + cards.length) % cards.length;
    showCard(current);
  });

  nextBtn.addEventListener('click', () => {
    current = (current + 1) % cards.length;
    showCard(current);
  });

  showCard(current);
</script>


### Interested?

<form class="lead-form" action="https://formspree.io/f/xeevrpdy" method="POST">
  <div class="lead-form-grid">
    <div class="form-field">
      <label for="first-name">First Name</label>
      <input id="first-name" name="first_name" type="text" required>
    </div>

    <div class="form-field">
      <label for="last-name">Last Name</label>
      <input id="last-name" name="last_name" type="text" required>
    </div>

    <div class="form-field">
      <label for="phone">Phone Number</label>
      <input id="phone" name="phone" type="tel" required>
    </div>

    <div class="form-field">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required>
    </div>

    <div class="form-field form-field-full">
      <label for="best-contact">Best Way To Contact</label>
      <select id="best-contact" name="best_contact" required>
        <option value="" selected disabled>Select one</option>
        <option value="phone">Phone</option>
        <option value="email">Email</option>
        <option value="text">Text</option>
      </select>
    </div>

    <div class="form-field form-field-full">
      <label for="message">Tell Me Your Website Idea</label>
      <input id="message" name="message" type="message" required>
    </div>
  </div>

  <button class="form-submit" type="submit">Submit</button>
</form>

