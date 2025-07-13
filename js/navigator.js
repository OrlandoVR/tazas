
  document.addEventListener("DOMContentLoaded", ()=>{
    
    const navigatorEl = document.getElementById("nav-placeholder");

    let navigatorPath = "partials/navigator.html";
    if (window.location.pathname.includes("/pages/")) {
      navigatorPath = "../partials/navigator.html";
    }

    fetch(navigatorPath)
    .then(res => res.text())
    .then(html => {
      navigatorEl.innerHTML = html;
    })
    .catch(err => {
      console.error("Error cargando navigator:", err);
    });

  });