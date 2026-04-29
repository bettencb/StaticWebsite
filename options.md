---
layout: default
title: Bundle Sales Page 
---

<div class="banner">
  <h1>Aerial Drone Photography</h1>
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
  <div class="featured-media">
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

    <div class="video-panel">
      <h3>Watch The Demo</h3>
      <div class="video-wrapper">
        <iframe
          src="https://www.youtube.com/embed/HFqpvOxGGSE?autoplay=1&mute=1&playsinline=1&rel=0"
          title="Featured Drone Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    </div>
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