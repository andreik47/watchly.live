
document.addEventListener('DOMContentLoaded', function() {
  
  const containerToggle = document.querySelector('.billing-toggle');
  
  if (containerToggle) {
    const optiuni = containerToggle.querySelectorAll('button, input[type="radio"]');
    
    optiuni.forEach(optiune => {
      const tipEveniment = optiune.tagName === 'INPUT' ? 'change' : 'click';
      
      optiune.addEventListener(tipEveniment, function() {
        if (this.tagName === 'BUTTON') {
          optiuni.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
        }
        
        let perioada = "";
        if (this.tagName === 'INPUT') {
          perioada = this.value;
        } else {
          perioada = this.textContent.toLowerCase().includes('yearly') ? 'yearly' : 'monthly';
        }
        
        actualizeazaPreturile(perioada);
      });
    });
  }

  const butoaneAbonare = document.querySelectorAll('.plan-button, .btn-subscribe-plan');
  butoaneAbonare.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '../html/cart.html';
    });
  });
});

function actualizeazaPreturile(perioada) {
  const carduri = document.querySelectorAll('.plan-card, .pricing-card');
  
  const seturiPret = {
    monthly: { starter: '$9.99', pro: '$19.99', premium: '$29.99' },
    yearly: { starter: '$69.99', pro: '$139.99', premium: '$209.99' }
  };

  carduri.forEach(card => {
    const elementSuma = card.querySelector('.amount, .plan-price span');
    const elementPerioada = card.querySelector('.period');
    
    if (!elementSuma) return;

    if (card.classList.contains('starter-card') || card.innerText.includes('Gold')) {
      elementSuma.textContent = seturiPret[perioada].starter;
    } else if (card.classList.contains('pro-card') || card.innerText.includes('Diamond')) {
      elementSuma.textContent = seturiPret[perioada].pro;
    } else if (card.classList.contains('premium-card') || card.innerText.includes('Platinum')) {
      elementSuma.textContent = seturiPret[perioada].premium;
    }
    
    if (elementPerioada) {
      elementPerioada.textContent = (perioada === 'monthly') ? '/month' : '/year';
    }
  });
}