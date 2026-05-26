let contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const limba = window.WatchlyLang?.ia?.() || "EN";
    const mesaj = window.WatchlyLang?.obtine?.(
      "Message saved. We will contact you soon.", 
      limba
    ) || "Message saved. We will contact you soon.";
    alert(mesaj);
    contactForm.reset();
  });
}
