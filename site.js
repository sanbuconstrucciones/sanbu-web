const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const header = document.querySelector(".site-header");
const whatsappNumber = "573182651714";
const whatsappMessage = "Hola, vi la página de SANBU y quisiera cotizar un proyecto de remodelación.";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

document.querySelectorAll(".js-whatsapp-link").forEach((link) => {
  link.href = whatsappUrl;
  link.target = "_blank";
  link.rel = "noreferrer";
});

const setMenuOpen = (open) => {
  if (!toggle || !nav) return;
  nav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Cerrar navegación" : "Abrir navegación");
};

if (toggle && nav) {
  toggle.addEventListener("click", () => setMenuOpen(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) setMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });
}

const updateChrome = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
  document.body.classList.toggle("show-whatsapp-float", window.innerWidth > 680 || window.scrollY > 520);
};

updateChrome();
window.addEventListener("scroll", updateChrome, { passive: true });
window.addEventListener("resize", updateChrome);

document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  const hero = gallery.querySelector("[data-gallery-main]");
  const buttons = gallery.querySelectorAll("[data-gallery-thumb]");
  buttons.forEach((button, index) => {
    button.setAttribute("aria-pressed", String(hero?.getAttribute("src") === button.dataset.galleryThumb || (!hero && index === 0)));
    button.addEventListener("click", () => {
      if (!hero) return;
      const nextImage = button.dataset.galleryThumb;
      if (!nextImage) return;
      buttons.forEach((item) => item.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      hero.src = nextImage;
      hero.alt = button.dataset.galleryAlt || hero.alt;
    });
  });
});

const serviceGalleries = window.SANBU_MEDIA?.serviceGalleries || {};
const sanbuVideos = window.SANBU_MEDIA?.videos || [];
const videoById = new Map(sanbuVideos.map((video) => [video.id, video]));

const createLightbox = () => {
  const lightbox = document.createElement("section");
  lightbox.className = "gallery-modal";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <div class="gallery-modal__backdrop" data-gallery-close></div>
    <div class="gallery-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="gallery-modal-title">
      <button class="gallery-modal__close" type="button" data-gallery-close aria-label="Cerrar galería">×</button>
      <div class="gallery-modal__meta">
        <p class="eyebrow">Trabajo real SANBU</p>
        <h2 id="gallery-modal-title"></h2>
        <p class="gallery-modal__count" aria-live="polite"></p>
      </div>
      <div class="gallery-modal__stage">
        <button class="gallery-modal__nav gallery-modal__prev" type="button" aria-label="Imagen anterior">‹</button>
        <img class="gallery-modal__image" alt="" />
        <button class="gallery-modal__nav gallery-modal__next" type="button" aria-label="Imagen siguiente">›</button>
      </div>
      <p class="gallery-modal__caption"></p>
      <div class="gallery-modal__thumbs" aria-label="Miniaturas de la galería"></div>
    </div>
  `;
  document.body.appendChild(lightbox);
  return lightbox;
};

const lightbox = document.querySelector(".gallery-modal") || createLightbox();
const lightboxTitle = lightbox.querySelector("#gallery-modal-title");
const lightboxCount = lightbox.querySelector(".gallery-modal__count");
const lightboxImage = lightbox.querySelector(".gallery-modal__image");
const lightboxCaption = lightbox.querySelector(".gallery-modal__caption");
const lightboxThumbs = lightbox.querySelector(".gallery-modal__thumbs");
const lightboxPrev = lightbox.querySelector(".gallery-modal__prev");
const lightboxNext = lightbox.querySelector(".gallery-modal__next");
let activeGallery = null;
let activeIndex = 0;
let lastGalleryTrigger = null;

const renderLightbox = () => {
  if (!activeGallery) return;
  const item = activeGallery.items[activeIndex];
  lightboxTitle.textContent = activeGallery.title;
  lightboxCount.textContent = `${activeIndex + 1} / ${activeGallery.items.length}`;
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxCaption.textContent = item.caption;
  lightboxThumbs.innerHTML = "";
  activeGallery.items.forEach((galleryItem, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Ver imagen ${index + 1}: ${galleryItem.caption}`);
    button.setAttribute("aria-current", String(index === activeIndex));
    button.innerHTML = `<img src="${galleryItem.src}" alt="" loading="lazy" decoding="async" />`;
    button.addEventListener("click", () => {
      activeIndex = index;
      renderLightbox();
    });
    lightboxThumbs.appendChild(button);
  });
};

const openLightbox = (galleryKey, trigger, startIndex = 0) => {
  const gallery = serviceGalleries[galleryKey];
  if (!gallery) return;
  activeGallery = gallery;
  activeIndex = Math.max(0, Math.min(startIndex, gallery.items.length - 1));
  lastGalleryTrigger = trigger;
  renderLightbox();
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  lightbox.querySelector(".gallery-modal__close")?.focus();
};

const closeLightbox = () => {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  activeGallery = null;
  lightboxImage.removeAttribute("src");
  lastGalleryTrigger?.focus();
};

const stepLightbox = (direction) => {
  if (!activeGallery) return;
  activeIndex = (activeIndex + direction + activeGallery.items.length) % activeGallery.items.length;
  renderLightbox();
};

document.querySelectorAll("[data-gallery-open]").forEach((button) => {
  button.addEventListener("click", () => openLightbox(button.dataset.galleryOpen, button));
});

const buildMediaStrip = (strip) => {
  const galleryKey = strip.dataset.mediaStrip;
  const gallery = serviceGalleries[galleryKey];
  if (!gallery) return;
  const limit = Number(strip.dataset.mediaLimit || gallery.items.length);
  const items = gallery.items.slice(0, limit);
  strip.innerHTML = `
    <div class="media-strip__top">
      <div>
        <p class="eyebrow">${strip.dataset.mediaEyebrow || "Más fotografías"}</p>
        <h3>${strip.dataset.mediaTitle || gallery.title}</h3>
      </div>
      <div class="media-strip__controls" aria-label="Controles de fotografías">
        <button type="button" data-strip-prev aria-label="Ver fotografías anteriores">‹</button>
        <button type="button" data-strip-next aria-label="Ver fotografías siguientes">›</button>
      </div>
    </div>
    <div class="media-strip__track" tabindex="0" aria-label="${gallery.title}"></div>
  `;
  const track = strip.querySelector(".media-strip__track");
  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "media-card";
    button.setAttribute("aria-label", `Abrir fotografía: ${item.caption}`);
    button.innerHTML = `
      <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" />
      <span>${item.caption}</span>
    `;
    button.addEventListener("click", () => openLightbox(galleryKey, button, index));
    track.appendChild(button);
  });
  strip.querySelector("[data-strip-prev]")?.addEventListener("click", () => {
    track.scrollBy({ left: -Math.max(260, track.clientWidth * 0.72), behavior: "smooth" });
  });
  strip.querySelector("[data-strip-next]")?.addEventListener("click", () => {
    track.scrollBy({ left: Math.max(260, track.clientWidth * 0.72), behavior: "smooth" });
  });
};

document.querySelectorAll("[data-media-strip]").forEach(buildMediaStrip);

const buildVideoCard = (card) => {
  const video = videoById.get(card.dataset.videoCard);
  if (!video) return;
  const label = card.dataset.videoLabel || video.eyebrow || "Video";
  const extraClass = video.orientation ? ` is-${video.orientation}` : "";
  card.classList.add("av-card", ...extraClass.trim().split(" ").filter(Boolean));
  card.innerHTML = `
    <div class="av-card__copy">
      <p class="eyebrow">${label}</p>
      <h3>${video.title}</h3>
      <p>${video.description}</p>
    </div>
    <div class="av-card__media">
      <video controls playsinline preload="none" poster="${video.poster}" aria-label="${video.title}">
        <source src="${video.src}" type="video/mp4" />
        Tu navegador no puede reproducir este video.
      </video>
    </div>
  `;
};

document.querySelectorAll("[data-video-card]").forEach(buildVideoCard);

lightbox.querySelectorAll("[data-gallery-close]").forEach((button) => {
  button.addEventListener("click", closeLightbox);
});
lightboxPrev?.addEventListener("click", () => stepLightbox(-1));
lightboxNext?.addEventListener("click", () => stepLightbox(1));
document.addEventListener("keydown", (event) => {
  if (!activeGallery) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") stepLightbox(-1);
  if (event.key === "ArrowRight") stepLightbox(1);
});

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
