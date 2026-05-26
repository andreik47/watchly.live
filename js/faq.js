// FAQ Accordion logic - handles expandable Q&A sections

document.addEventListener('DOMContentLoaded', () => {
  // FAQ answers to inject into HTML
  const faqAnswers = [
    "Watchly is your premium streaming platform offering access to thousands of movies and TV shows. Enjoy unlimited entertainment with high-quality content, personalized recommendations, and seamless viewing experience across all your devices.",
    "Watchly includes movie browsing, trending categories, favorites, rentals, purchases, subscription plans, account tools and secure checkout in one place.",
    "You can watch Watchly on laptops, desktops, tablets and supported smart devices from your browser.",
    "Yes. Watchly is responsive, so you can browse, save, rent and buy movies from your phone.",
    "You can cancel from your account subscription area. Your plan remains available until the end of the paid period."
  ];

  const allFaqItems = document.querySelectorAll('.faq-items-container > div');
  const ICON_PLUS = '../img/icon/Arrow/Caret_Right_SM.svg';
  const ICON_MINUS = '../img/icon/Arrow/Caret_Down_SM.svg';

  allFaqItems.forEach((item, index) => {
    const header = item.querySelector('.faq-header, .faq-header-collapsed');
    const icon = item.querySelector('.faq-toggle-icon');

    if (!header || !icon) return;

    // Inject answer text if not already present
    if (!item.querySelector('.faq-answer')) {
      const answerDiv = document.createElement('div');
      answerDiv.className = 'faq-answer';
      const textContent = faqAnswers[index] || faqAnswers[0];
      answerDiv.innerHTML = `<div class="faq-answer-text">${textContent}</div>`;
      item.appendChild(answerDiv);
    }

    const currentAnswer = item.querySelector('.faq-answer');

    // Set initial state (first item open, others closed)
    if (index === 0) {
      item.classList.add('expanded', 'active');
      if (currentAnswer) currentAnswer.classList.remove('collapsed');
      icon.src = ICON_MINUS;
    } else {
      item.classList.remove('expanded', 'active');
      if (currentAnswer) currentAnswer.classList.add('collapsed');
      icon.src = ICON_PLUS;
    }

    // Close all others function
    const closeAllOthers = () => {
      allFaqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('expanded', 'active');
          
          const otherIcon = otherItem.querySelector('.faq-toggle-icon');
          if (otherIcon) otherIcon.src = ICON_PLUS;
          
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.classList.add('collapsed');
        }
      });
    };

    // Toggle logic on header click
    header.addEventListener('click', () => {
      const isExpanded = item.classList.contains('expanded');

      closeAllOthers();

      if (!isExpanded) {
        item.classList.add('expanded', 'active');
        icon.src = ICON_MINUS;
        if (currentAnswer) currentAnswer.classList.remove('collapsed');
      } else {
        item.classList.remove('expanded', 'active');
        icon.src = ICON_PLUS;
        if (currentAnswer) currentAnswer.classList.add('collapsed');
      }
    });

    // Allow click on icon too
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      header.click();
    });
  });

  // Also handle .faq-item elements (alternative HTML structure)
  const elementeFaq = document.querySelectorAll('.faq-item');
  elementeFaq.forEach(articol => {
    const intrebare = articol.querySelector('.faq-question');
    
    if (intrebare) {
      intrebare.addEventListener('click', () => {
        elementeFaq.forEach(altArticol => {
          if (altArticol !== articol) {
            altArticol.classList.remove('active');
          }
        });
        articol.classList.toggle('active');
      });
    }
  });
});