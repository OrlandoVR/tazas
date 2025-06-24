
fetch("html/navigator.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById("nav-placeholder").innerHTML = data;
    })
