
(function () {
  const containerComenzi = document.getElementById("ordersList");
  if (!containerComenzi || !window.WatchlyAuth) return;

  const utilizator = window.WatchlyAuth.getCurrentUser();
  if (!utilizator) {
    window.location.href = "../html/login.html";
    return;
  }

  let listaComenzi = [];
  try {
    let dateSalvate = localStorage.getItem("watchly.orders");
    listaComenzi = dateSalvate ? JSON.parse(dateSalvate) : [];
  } catch (eroare) {
    console.error("Eroare la citirea comenzilor:", eroare);
  }

  let comenziAfisate = listaComenzi.filter((comanda) => {
    return comanda.userId === utilizator.id || utilizator.role === "admin";
  });

  comenziAfisate.reverse();

  if (comenziAfisate.length === 0) {
    const limba = window.WatchlyLang?.ia?.() || "EN";
    const mesaj = window.WatchlyLang?.obtine?.("No orders yet.", limba) || "No orders yet.";
    containerComenzi.innerHTML = `<p class="account-empty">${mesaj}</p>`;
    return;
  }

  const limba = window.WatchlyLang?.ia?.() || "EN";
  containerComenzi.innerHTML = comenziAfisate.map((comanda) => {
    let dataFormatata = new Date(comanda.createdAt).toLocaleString();
    let produseComandate = (comanda.items || []).map(item => item.title).join(", ");
    let pretTotal = Number(comanda.total || 0).toFixed(2);
    
    const textCodComanda = window.WatchlyLang?.obtine?.("Cod comanda:", limba) || "Cod comanda:";
    const textCard = window.WatchlyLang?.obtine?.(comanda.payment || "Card", limba) || comanda.payment || "Card";
    const textProduse = window.WatchlyLang?.obtine?.("Produse:", limba) || "Produse:";

    return `
      <article class="admin-order">
        <div>
          <h3>${textCodComanda} ${comanda.id}</h3>
          <p>${dataFormatata} - ${textCard}</p>
          <p><strong>${textProduse}</strong> ${produseComandate}</p>
        </div>
        <strong>$${pretTotal}</strong>
      </article>
    `;
  }).join("");

})();