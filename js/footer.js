document.addEventListener("DOMContentLoaded", () => {

  const footerEl = document.getElementById("footer-placeholder");

  let footerPath = "partials/footer.html";
  if (window.location.pathname.includes("/pages/")) {
    footerPath = "../partials/footer.html";
  }

  fetch(footerPath)
    .then(res => res.text())
    .then(html => {
      footerEl.innerHTML = html;
    })
    .catch(err => {
      console.error("Error cargando footer:", err);
    });

});