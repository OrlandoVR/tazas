const navBase = location.pathname.includes("/html/") ? "../" : "";

fetch(`${navBase}html/navigator.html`)
  .then(res => res.text())
  .then(data => {
    document.getElementById("nav-placeholder").innerHTML = data;
  });