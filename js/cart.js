const STORAGE_CART_KEY = "watchly.cart";
const STORAGE_ORDERS_KEY = "watchly.orders";

let cartData = [];

function citesteCosul() {
  try {
    cartData = JSON.parse(localStorage.getItem(STORAGE_CART_KEY)) || [];
  } catch (error) {
    cartData = [];
  }
}

function salveazaCosul() {
  localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cartData));
}

function iaElement(id) {
  return document.getElementById(id);
}

function numaraTotalul() {
  let total = 0;
  for (let i = 0; i < cartData.length; i++) {
    total += Number(cartData[i].price || 0);
  }
  return total;
}

function actualizeazaNumarCos() {
  let count = cartData.length;
  let cartCount = iaElement("cartCount");
  let mobileCartCount = iaElement("mobileCartCount");
  let cartItemsCount = iaElement("cartItemsCount");
  let subtotalAmount = iaElement("subtotalAmount");

  if (cartCount) cartCount.textContent = count;
  if (mobileCartCount) mobileCartCount.textContent = count;
  if (cartItemsCount) cartItemsCount.textContent = count + (count === 1 ? " item" : " items");
  if (subtotalAmount) subtotalAmount.textContent = "$" + numaraTotalul().toFixed(2);
}

function afiseazaDropdownCos() {
  let container = iaElement("cartItems");
  if (!container) return;

  if (cartData.length === 0) {
    container.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
    return;
  }

  let html = "";
  for (let i = 0; i < cartData.length; i++) {
    let item = cartData[i];
    html += `
      <div class="product-1">
        <div class="product-1-group">
          <img src="${item.poster}" alt="${item.title}" class="product-1-icon">
          <div class="frame-parent">
            <div class="galactic-warriors-hd-parent">
              <div class="galactic-warriors-hd">${item.title}</div>
              <div class="rent-40">${item.subtitle || ""}${item.rentDate ? " - " + item.rentDate : ""}</div>
            </div>
            <div class="galactic-warriors-hd">$${Number(item.price || 0).toFixed(2)}</div>
          </div>
        </div>
        <img src="../img/icon/Menu/x.svg" alt="Remove" class="close-icon" data-cart-index="${i}">
      </div>
    `;
  }
  container.innerHTML = html;
}

function afiseazaPaginaCheckout() {
  let panel = iaElement("checkoutItems");
  if (!panel) return;

  let count = cartData.length;
  let subtotal = numaraTotalul();
  let fee = count > 0 ? 1 : 0;

  let checkoutItemCount = iaElement("checkoutItemCount");
  let checkoutSubtotal = iaElement("checkoutSubtotal");
  let checkoutFee = iaElement("checkoutFee");
  let checkoutTotal = iaElement("checkoutTotal");

  if (checkoutItemCount) checkoutItemCount.textContent = count + (count === 1 ? " item" : " items");
  if (checkoutSubtotal) checkoutSubtotal.textContent = "$" + subtotal.toFixed(2);
  if (checkoutFee) checkoutFee.textContent = "$" + fee.toFixed(2);
  if (checkoutTotal) checkoutTotal.textContent = "$" + (subtotal + fee).toFixed(2);

  if (count === 0) {
    panel.innerHTML = `
      <div class="checkout-empty">
        <h3>No movies selected</h3>
        <p>Add a movie from the store, then come back to checkout.</p>
        <a href="../html/movie.html">Browse movies</a>
      </div>
    `;
    return;
  }

  let html = "";
  for (let i = 0; i < cartData.length; i++) {
    let item = cartData[i];
    html += `
      <article class="cart-page-item">
        <img src="${item.poster}" alt="${item.title}">
        <div class="cart-page-item-info">
          <h3>${item.title}</h3>
          <p>${item.subtitle || ""}${item.rentDate ? " - starts " + item.rentDate : ""}</p>
        </div>
        <strong>$${Number(item.price || 0).toFixed(2)}</strong>
        <button type="button" data-checkout-remove="${i}">
          <img src="../img/icon/Menu/x.svg" alt="Remove">
        </button>
      </article>
    `;
  }
  panel.innerHTML = html;
}

function actualizeazaTotCosul() {
  salveazaCosul();
  actualizeazaNumarCos();
  afiseazaDropdownCos();
  afiseazaPaginaCheckout();
}

function adaugaInCos(item) {
  let copie = {
    id: item.id || "item-" + Date.now(),
    title: item.title || "Movie",
    subtitle: item.subtitle || "",
    rentDate: item.rentDate || "",
    price: Number(item.price || 0),
    poster: item.poster || "../img/logo.png",
    cartId: item.cartId || Date.now() + "-" + Math.random()
  };

  cartData.push(copie);
  actualizeazaTotCosul();
}

function stergeDinCos(index) {
  cartData.splice(index, 1);
  actualizeazaTotCosul();
}

function golesteCosul() {
  cartData = [];
  actualizeazaTotCosul();
}

function pozitioneazaCosul() {
  let dropdown = iaElement("cartDropdown");
  let icon = iaElement("cartIcon");
  if (!dropdown || !icon) return;

  let iconPozitie = icon.getBoundingClientRect();
  let latimeCos = Math.min(420, window.innerWidth - 32);
  let stanga = iconPozitie.right - latimeCos;

  if (stanga < 16) stanga = 16;
  if (stanga + latimeCos > window.innerWidth - 16) {
    stanga = window.innerWidth - latimeCos - 16;
  }

  dropdown.style.width = latimeCos + "px";
  dropdown.style.top = iconPozitie.bottom + 12 + "px";
  dropdown.style.left = stanga + "px";
  dropdown.style.right = "auto";
  dropdown.style.bottom = "auto";
}

function deschideSauInchideCos(event) {
  if (event) event.stopPropagation();

  let dropdown = iaElement("cartDropdown");
  let icon = iaElement("cartIcon");
  if (!dropdown || !icon) return;

  let esteDeschis = dropdown.classList.toggle("active");
  if (esteDeschis) pozitioneazaCosul();
  icon.setAttribute("aria-expanded", String(esteDeschis));
}

function confirmaComanda() {
  if (cartData.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  let user = window.WatchlyAuth ? window.WatchlyAuth.getCurrentUser() : null;
  if (!user) {
    alert("Please login before checkout.");
    window.location.href = "../html/register.html";
    return;
  }

  let name = iaElement("checkoutName")?.value.trim();
  let email = iaElement("checkoutEmail")?.value.trim();
  let payment = iaElement("checkoutPayment")?.value;
  let msgBox = iaElement("checkoutMessage");

  if (!name || !email || !payment) {
    if (msgBox) {
      msgBox.textContent = "Completeaza toate campurile de livrare/plata.";
      msgBox.classList.add("active");
    }
    return;
  }

  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY)) || [];
  } catch (error) {
    orders = [];
  }

  orders.push({
    id: "order-" + Date.now(),
    userId: user.id,
    userName: name,
    userEmail: email,
    payment: payment,
    createdAt: new Date().toISOString(),
    items: cartData,
    total: numaraTotalul() + 1,
    status: "paid"
  });

  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders, null, 2));
  golesteCosul();

  if (msgBox) {
    msgBox.textContent = "Comanda a fost confirmata!";
    msgBox.classList.add("active", "success");
  }

  setTimeout(function () {
    window.location.href = "../html/orders.html";
  }, 1000);
}

document.addEventListener("DOMContentLoaded", function () {
  citesteCosul();
  actualizeazaTotCosul();

  iaElement("cartIcon")?.addEventListener("click", deschideSauInchideCos);
  iaElement("mobileCartBtn")?.addEventListener("click", deschideSauInchideCos);
  iaElement("closeCart")?.addEventListener("click", function () {
    iaElement("cartDropdown")?.classList.remove("active");
  });

  iaElement("cartItems")?.addEventListener("click", function (event) {
    let btn = event.target.closest("[data-cart-index]");
    if (btn) stergeDinCos(Number(btn.dataset.cartIndex));
  });

  iaElement("checkoutItems")?.addEventListener("click", function (event) {
    let btn = event.target.closest("[data-checkout-remove]");
    if (btn) stergeDinCos(Number(btn.dataset.checkoutRemove));
  });

  iaElement("checkoutBtn")?.addEventListener("click", function () {
    window.location.href = "../html/cart.html";
  });

  iaElement("checkoutAction")?.addEventListener("click", confirmaComanda);

  window.addEventListener("resize", function () {
    if (iaElement("cartDropdown")?.classList.contains("active")) {
      pozitioneazaCosul();
    }
  });

  window.addEventListener("scroll", function () {
    if (iaElement("cartDropdown")?.classList.contains("active")) {
      pozitioneazaCosul();
    }
  });

  document.addEventListener("click", function (event) {
    let dropdown = iaElement("cartDropdown");
    let icon = iaElement("cartIcon");
    let mobileIcon = iaElement("mobileCartBtn");
    if (!dropdown || !dropdown.classList.contains("active")) return;
    if (dropdown.contains(event.target) || icon?.contains(event.target) || mobileIcon?.contains(event.target)) return;
    dropdown.classList.remove("active");
  });
});

window.WatchlyCart = {
  addItem: adaugaInCos,
  getItems: function () {
    return cartData.slice();
  },
  clear: golesteCosul
};
