---
layout: default
title: Contact
background_image: /assets/images/background-bio_scaled.webp
---

# About Me

<div class="bio-container">
  <img src="{{ site.baseurl }}/assets/images/bio-pic_scaled.png" alt="Ashton" class="bio-photo">
  <p>
    This is where the biography text goes. Since this is a static site,
    it loads instantly!
  </p>
</div>

### Gallery
Here is an example of a high quality photo scaled down for faster load times:
![Zoo Monkey]({{ site.baseurl }}/assets/images/random-3.webp)

### Interested?

<form class="lead-form" action="https://formspree.io/f/xeevrpdy" method="POST">
  <div class="lead-form-grid">
    <div class="form-field">
      <label for="first-name">First Name</label>
      <input id="first-name" name="first_name" type="text" placeholder="Enter your first name." required>
    </div>

    <div class="form-field">
      <label for="last-name">Last Name</label>
      <input id="last-name" name="last_name" type="text" placeholder="Enter your last name." required>
    </div>

    <div class="form-field">
      <label for="phone">Phone Number</label>
      <input id="phone" name="phone" type="tel" placeholder="Enter your phone number." required>
    </div>

    <div class="form-field">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" placeholder="example@email.com" required>
    </div>

    <div class="form-field">
      <label for="best-contact">Best Way To Contact</label>
      <select id="best-contact" name="best_contact" required>
        <option value="" selected disabled>Select one</option>
        <option value="phone">Phone</option>
        <option value="email">Email</option>
        <option value="text">Text</option>
      </select>
    </div>

    <div class="form-field">
      <label class="fs-label" for="interest-reason">
        What's Your Website Idea?
      </label>
      <textarea
        class="fs-textarea"
        id="interest-reason"
        name="interest-reason"
        placeholder="Tell us you website idea you want made. (optional)"
      ></textarea>
    </div>
  </div>

  <button class="form-submit" type="submit">Submit</button>
</form>

