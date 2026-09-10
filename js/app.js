const $ = (selector) => document.querySelector(selector);

const safeText = (value) => String(value ?? "");

function safeUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function render() {
  document.title = `${siteData.businessName} | Portfolio`;

  $("#profilePhoto").src = safeUrl(siteData.profilePhoto);
  $("#profilePhoto").alt = `${siteData.businessName} profile picture`;
  $("#heroTitle").textContent = safeText(siteData.heroTitle);
  $("#heroDescription").textContent = safeText(siteData.heroDescription);
  $("#aboutTitle").textContent = safeText(siteData.aboutTitle);
  $("#aboutText").textContent = safeText(siteData.aboutText);
  $("#contactText").textContent = safeText(siteData.contactText);
  $("#affiliateDisclosure").textContent = safeText(siteData.affiliateDisclosure);
  $("#footerText").textContent = `© ${new Date().getFullYear()} ${siteData.businessName}`;

  
  renderProducts();
  renderSocials();
}

function openProductViewer(product, images) {
  let currentIndex = 0;

  const modal = $("#imageModal");
  const modalImage = $("#modalImage");
  const caption = $("#modalCaption");

  function showImage(index) {
    currentIndex = (index + images.length) % images.length;

    modalImage.src = safeUrl(images[currentIndex]);
    modalImage.alt = safeText(product.name);

    caption.textContent =
      `${product.name} • ${currentIndex + 1} / ${images.length}`;
  }

  showImage(0);

  modal.classList.add("open");

  modal.querySelectorAll(".modal-prev, .modal-next")
    .forEach((button) => button.remove());

  const previous = document.createElement("button");
  previous.className = "modal-prev";
  previous.textContent = "‹";

  const next = document.createElement("button");
  next.className = "modal-next";
  next.textContent = "›";

  previous.onclick = () => {
    showImage(currentIndex - 1);
  };

  next.onclick = () => {
    showImage(currentIndex + 1);
  };

  modal.append(previous, next);
}

function renderProducts() {
  const grid = $("#productGrid");
  const query = ($("#productSearch").value || "").toLowerCase();
  const activeCategory = document.querySelector(".filter.active")?.dataset.category || "";

  grid.innerHTML = "";

  const products = siteData.products.filter((item) => {
    const searchable = `${item.name} ${item.description} ${item.category}`.toLowerCase();
    return searchable.includes(query) &&
      (!activeCategory || item.category === activeCategory);
  });

  if (!products.length) {
    grid.innerHTML = '<p class="empty">No products found.</p>';
    renderFilters();
    return;
  }

  products.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card product-card";

    const img = document.createElement("img");

    const productImages = Array.isArray(item.images)
      ? item.images
      : [item.image];

    img.src = safeUrl(productImages[0]);
    img.alt = safeText(item.name);
    img.loading = "lazy";
    img.className = "product-image";

    img.addEventListener("click", () => {
      openProductViewer(item, productImages);
    });

    card.append(img);

    if (item.badge) {
      const badge = document.createElement("div");
      badge.className = "product-badge";
      badge.textContent = "🏆 " + item.badge;
      card.appendChild(badge);
    }

    if (item.rating) {
      const rating = document.createElement("div");
      rating.className = "product-rating";

      const stars = "★".repeat(Math.floor(item.rating));

      rating.innerHTML = `
        <span class="stars">${stars}</span>
        <strong>${item.rating}</strong>
        <span>(${item.reviews || 0} reviews)</span>
      `;

      card.appendChild(rating);
    }

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h3");
    title.textContent = safeText(item.name);

    const description = document.createElement("p");
    description.textContent = safeText(item.description);

    const priceBox = document.createElement("div");
    priceBox.className = "product-price";

    const currentPrice = document.createElement("strong");
    currentPrice.textContent = item.price;
    priceBox.appendChild(currentPrice);

    if (item.originalPrice) {
      const oldPrice = document.createElement("del");
      oldPrice.textContent = item.originalPrice;
      priceBox.appendChild(oldPrice);
    }

    if (item.discount) {
      const discount = document.createElement("span");
      discount.className = "discount";
      discount.textContent = item.discount;
      priceBox.appendChild(discount);
    }

    const button = document.createElement("a");
    button.className = "btn product-btn";
    button.href = safeUrl(item.link);
    button.target = "_blank";
    button.rel = "noopener noreferrer sponsored";
    button.textContent = "Shop Now";

    body.append(title, description);
    if (item.price) body.append(priceBox);
    body.append(button);
    card.append(body);
    grid.append(card);
  });

  renderFilters();
}

function renderFilters() {
  const container = $("#filters");
  if (container.children.length) return;

  const categories = [...new Set(siteData.products.map((p) => p.category).filter(Boolean))];

  const all = document.createElement("button");
  all.className = "filter active";
  all.dataset.category = "";
  all.textContent = "All";
  container.append(all);

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "filter";
    button.dataset.category = category;
    button.textContent = category;
    container.append(button);
  });

  container.querySelectorAll(".filter").forEach((button) => {
    button.addEventListener("click", () => {
      container.querySelectorAll(".filter").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      renderProducts();
    });
  });
}

function renderSocials() {
  const container = $("#socialLinks");
  container.innerHTML = "";

  siteData.socialLinks.forEach((social) => {
    const link = document.createElement("a");
    link.className = "social";
    link.href = safeUrl(social.url);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = social.name;
    container.append(link);
  });
}

$("#productSearch").addEventListener("input", renderProducts);

$("#menuBtn").addEventListener("click", () => {
  $("#nav").classList.toggle("open");
});

// Automatically close the mobile menu after clicking a navigation link
$("#nav").querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    $("#nav").classList.remove("open");
  });
});
$("#closeModal").addEventListener("click", () => {
  $("#imageModal").classList.remove("open");
});

$("#imageModal").addEventListener("click", (event) => {
  if (event.target.id === "imageModal") {
    $("#imageModal").classList.remove("open");
  }
});

render();