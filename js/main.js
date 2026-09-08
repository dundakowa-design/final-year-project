document.addEventListener("DOMContentLoaded", () => {
  initSmoothScroll();
  initBookingForm();
  initFooterYear();
  initCustomSelects();
  initMobileMenu();
});

/**
 * Плавная прокрутка по внутренним якорным ссылкам (nav, footer, hero-форма и т.д.)
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const targetEl = document.querySelector(targetId);

      if (!targetEl) {
        return;
      }

      event.preventDefault();

      const header = document.querySelector(".header");
      const headerOffset = header ? header.offsetHeight : 0;
      const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - headerOffset - 16;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      targetEl.setAttribute("tabindex", "-1");
      targetEl.focus({ preventScroll: true });
    });
  });
}

/**
 * Базовая валидация формы обратной связи (имя + телефон)
 */
function initBookingForm() {
  const form = document.getElementById("bookingForm");

  if (!form) {
    return;
  }

  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const nameError = document.getElementById("nameError");
  const phoneError = document.getElementById("phoneError");
  const successMessage = document.getElementById("formSuccess");

  const phonePattern = /^[+0-9()\s-]{10,18}$/;

  const validators = [
    {
      input: nameInput,
      errorEl: nameError,
      validate: (value) => value.trim().length >= 2,
      message: "Введите имя (минимум 2 символа).",
    },
    {
      input: phoneInput,
      errorEl: phoneError,
      validate: (value) => phonePattern.test(value.trim()),
      message: "Введите корректный номер телефона.",
    },
  ];

  validators.forEach(({ input, errorEl, validate, message }) => {
    input.addEventListener("blur", () => {
      input.setAttribute("data-touched", "true");
      validateField(input, errorEl, validate, message);
    });

    input.addEventListener("input", () => {
      if (input.getAttribute("data-touched") === "true") {
        validateField(input, errorEl, validate, message);
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    successMessage.textContent = "";

    let isFormValid = true;

    validators.forEach(({ input, errorEl, validate, message }) => {
      input.setAttribute("data-touched", "true");
      const fieldIsValid = validateField(input, errorEl, validate, message);
      isFormValid = isFormValid && fieldIsValid;
    });

    if (!isFormValid) {
      return;
    }

    successMessage.textContent = "Спасибо! Мы свяжемся с вами в ближайшее время.";
    form.reset();

    validators.forEach(({ input, errorEl }) => {
      input.removeAttribute("data-touched");
      errorEl.textContent = "";
    });
  });

  function validateField(input, errorEl, validate, message) {
    const isValid = validate(input.value);
    errorEl.textContent = isValid ? "" : message;
    return isValid;
  }
}

/**
 * Автоматическое обновление года в подвале
 */
function initFooterYear() {
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/**
 * Кастомные дропдауны формы поиска (замена нативного <select>)
 */
function initCustomSelects() {
  const customSelects = document.querySelectorAll(".custom-select");

  if (!customSelects.length) {
    return;
  }

  function closeSelect(select) {
    select.classList.remove("is-open");
    select.querySelector(".custom-select__trigger").setAttribute("aria-expanded", "false");
  }

  function closeAllSelects() {
    customSelects.forEach(closeSelect);
  }

  customSelects.forEach((select) => {
    const trigger = select.querySelector(".custom-select__trigger");
    const valueEl = select.querySelector(".custom-select__value");
    const hiddenInput = select.querySelector('input[type="hidden"]');
    const options = select.querySelectorAll(".custom-select__option");

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = select.classList.contains("is-open");

      closeAllSelects();

      if (!isOpen) {
        select.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        options.forEach((o) => {
          o.classList.remove("is-selected");
          o.setAttribute("aria-selected", "false");
        });

        option.classList.add("is-selected");
        option.setAttribute("aria-selected", "true");
        valueEl.textContent = option.textContent;
        hiddenInput.value = option.dataset.value;

        closeSelect(select);
      });
    });
  });

  document.addEventListener("click", closeAllSelects);
}

/**
 * Мобильное меню (бургер): открытие/закрытие drawer-навигации с поддержкой a11y
 */
function initMobileMenu() {
  const burger = document.querySelector(".burger");
  const nav = document.getElementById("main-nav");
  const overlay = document.querySelector("[data-nav-overlay]");

  if (!burger || !nav || !overlay) {
    return;
  }

  const navLinks = nav.querySelectorAll("a");
  const firstNavLink = nav.querySelector(".nav__link");
  const MOBILE_BREAKPOINT = 768;

  function openMenu() {
    nav.classList.add("is-active");
    overlay.classList.add("is-active");
    burger.classList.add("is-active");
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";

    if (firstNavLink) {
      firstNavLink.focus();
    }
  }

  function closeMenu({ restoreFocus = true } = {}) {
    nav.classList.remove("is-active");
    overlay.classList.remove("is-active");
    burger.classList.remove("is-active");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";

    if (restoreFocus) {
      burger.focus();
    }
  }

  burger.addEventListener("click", () => {
    if (nav.classList.contains("is-active")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener("click", () => closeMenu());

  navLinks.forEach((link) => {
    link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-active")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > MOBILE_BREAKPOINT && nav.classList.contains("is-active")) {
      closeMenu({ restoreFocus: false });
    }
  });
}
