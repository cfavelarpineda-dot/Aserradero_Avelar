// Datos centralizados del negocio.
// Edite estos valores en un solo lugar: todas las páginas que usan
// elementos con clase "js-address" se actualizan automáticamente.
const BUSINESS_ADDRESS = "Granja D'Elia, Barrio Paso Hondo, 300m al sur de, 12111 Siguatepeque, Honduras";
// Enlace oficial de Google Maps al local exacto (confirmado por el negocio).
// Se usa tal cual en vez de armar una búsqueda por texto, porque la búsqueda
// por texto de la dirección estaba llevando a un negocio distinto cercano.
const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/MdeAJu8xXQBUpV7r6?g_st=ic';
const WHATSAPP_NUMBER = '50432517745'; // Formato wa.me: código de país + número, sin signos ni espacios.
const GOOGLE_REVIEW_URL = 'https://g.page/r/CVZ5C9IQNCQEEAE/review';

function isConfiguredValue(value) {
  return typeof value === 'string' && value.trim() !== '' && !value.trim().startsWith('[');
}

document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const topbar = document.querySelector('.topbar');
  let lastScrollY = window.scrollY;

  document.querySelectorAll('.js-address').forEach((el) => {
    el.textContent = BUSINESS_ADDRESS;
    if (el.tagName === 'A') {
      el.href = GOOGLE_MAPS_URL;
    }
  });

  if (topbar) {
    topbar.classList.add('is-visible');

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        topbar.classList.remove('is-visible');
        topbar.classList.add('is-hidden');
      } else {
        topbar.classList.remove('is-hidden');
        topbar.classList.add('is-visible');
      }

      lastScrollY = currentScrollY;
    });
  }

  const chipButtons = document.querySelectorAll('.chip-btn');
  chipButtons.forEach((button) => {
    button.addEventListener('click', () => {
      chipButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  const navLinks = document.querySelectorAll('.main-nav a');
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    const fallbackBox = contactForm.querySelector('.whatsapp-fallback');
    const fallbackTextarea = contactForm.querySelector('.whatsapp-fallback-text');
    const copyButton = contactForm.querySelector('.copy-whatsapp-message');
    const copyStatus = contactForm.querySelector('.copy-status');

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!isConfiguredValue(WHATSAPP_NUMBER)) {
        if (copyStatus) {
          copyStatus.textContent = 'Falta configurar el número de WhatsApp del negocio en script.js.';
        }
        return;
      }

      const formData = new FormData(contactForm);
      const message = [
        'Hola, deseo solicitar una cotización.',
        '',
        `Nombre / Empresa: ${formData.get('name')}`,
        `Teléfono: ${formData.get('phone')}`,
        formData.get('email') ? `Correo electrónico: ${formData.get('email')}` : null,
        `Tipo de despacho: ${formData.get('dispatch')}`,
        `Detalle del pedido: ${formData.get('details')}`
      ].filter((line) => line !== null).join('\n');

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      const opened = window.open(whatsappUrl, '_blank', 'noopener');

      if (fallbackBox && fallbackTextarea) {
        fallbackTextarea.value = message;
        fallbackBox.hidden = false;
      }
      if (copyStatus) {
        copyStatus.textContent = opened
          ? 'Se abrió WhatsApp en una pestaña nueva. Revise el mensaje y presione enviar allí; esta cotización no se envía sola.'
          : 'No se pudo abrir WhatsApp automáticamente. Copie el mensaje de abajo y envíelo usted mismo.';
      }
    });

    if (copyButton && fallbackTextarea) {
      copyButton.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(fallbackTextarea.value);
          if (copyStatus) copyStatus.textContent = 'Mensaje copiado. Péguelo en WhatsApp para enviarlo.';
        } catch (error) {
          fallbackTextarea.removeAttribute('readonly');
          fallbackTextarea.focus();
          fallbackTextarea.select();
          fallbackTextarea.setAttribute('readonly', 'true');
          if (copyStatus) copyStatus.textContent = 'No se pudo copiar automáticamente. El texto quedó seleccionado: use Ctrl+C o Cmd+C.';
        }
      });
    }
  }

  const reviewForm = document.querySelector('.review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const textarea = reviewForm.querySelector('textarea');
      const reviewText = textarea.value.trim();
      const status = reviewForm.querySelector('.review-status');

      if (!reviewText) {
        status.textContent = 'Escriba una reseña para continuar.';
        return;
      }

      let copied = false;
      try {
        await navigator.clipboard.writeText(reviewText);
        copied = true;
      } catch (error) {
        copied = false;
      }

      if (isConfiguredValue(GOOGLE_REVIEW_URL)) {
        status.textContent = copied
          ? 'Reseña copiada. Se abrirá la página oficial de reseñas de Google: péguela allí.'
          : 'Se abrirá la página oficial de reseñas de Google. Cópiela manualmente y péguela allí.';
        window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener');
      } else {
        status.textContent = copied
          ? 'Reseña copiada al portapapeles. El enlace directo a reseñas de Google todavía no está configurado; péguela usted mismo en su perfil de Google cuando lo encuentre.'
          : 'El enlace directo a reseñas de Google todavía no está configurado y no se pudo copiar automáticamente. Seleccione y copie su reseña manualmente.';
        if (!copied) {
          textarea.focus();
          textarea.select();
        }
      }
    });
  }
});
