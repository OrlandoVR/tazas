
    // 1) Datos tienda (dirección oficial). Geocodificaremos a coords con Nominatim.
    const TIENDA = {
      nombre: 'Tazaszas',
      direccion: 'Calle Laguardia 4, 28022 Madrid',
      telefono: '+34 914 90 66 00'
    };

    // 2) Crear mapa base
    const map = L.map('map', { scrollWheelZoom:true });
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> colaboradores'
    }).addTo(map);

    // 3) Icono tienda
    const shopIcon = L.divIcon({
      className: 'custom-pin',
      iconSize: [22, 30],
      iconAnchor: [11, 30],
      popupAnchor: [0, -26]
    });

    let shopMarker = null;
    let routingControl = null;

    // 4) Geocodificar la dirección de la tienda con Nominatim
    async function geocodeDireccion(dir) {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dir)}&limit=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' }});
      const data = await res.json();
      if (!data || !data[0]) throw new Error('No se encontraron coordenadas para la dirección.');
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }

    // 5) Geolocalizar usuario
    function getUserPosition() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('Geolocalización no soportada.'));
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          err => reject(err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    }

    // 6) Inicializar todo
    (async () => {
      try {
        const tiendaLL = await geocodeDireccion(TIENDA.direccion);
        // Centrar mapa en la tienda inicialmente
        map.setView([tiendaLL.lat, tiendaLL.lng], 15);

        shopMarker = L.marker([tiendaLL.lat, tiendaLL.lng], { icon: shopIcon })
          .addTo(map)
          .bindPopup(`<b>${TIENDA.nombre}</b><br>${TIENDA.direccion}<br>Tel: <a href="tel:${TIENDA.telefono.replace(/\s+/g,'')}">${TIENDA.telefono}</a>`)
          .openPopup();

        // Botón "Calcular ruta"
        document.getElementById('btn-ruta').addEventListener('click', async () => {
          try {
            const yo = await getUserPosition();

            // Si ya había una ruta, eliminarla
            if (routingControl) {
              map.removeControl(routingControl);
              routingControl = null;
            }

            routingControl = L.Routing.control({
              waypoints: [
                L.latLng(yo.lat, yo.lng),
                L.latLng(tiendaLL.lat, tiendaLL.lng)
              ],
              lineOptions: { addWaypoints: false },
              draggableWaypoints: false,
              router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
              show: false, // ocultar panel por defecto
              collapsible: true,
              language: 'es'
            }).addTo(map);

            // Ajustar vista a la ruta cuando esté lista
            routingControl.on('routesfound', (e) => {
              const route = e.routes[0];
              const bounds = L.latLngBounds(route.coordinates);
              map.fitBounds(bounds, { padding: [30, 30] });
            });

            // Marcar mi ubicación con un círculo
            L.circleMarker([yo.lat, yo.lng], { radius: 6, opacity: 0.9 }).addTo(map).bindPopup('Mi ubicación');
          } catch (err) {
            alert('No se pudo obtener tu ubicación. Activa permisos de geolocalización e inténtalo de nuevo.');
          }
        });

        // Botón reiniciar
        document.getElementById('btn-reset').addEventListener('click', () => {
          if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
          }
          map.setView(shopMarker.getLatLng(), 15);
          shopMarker.openPopup();
        });

        // Ajustar si cambia el tamaño
        window.addEventListener('resize', () => map.invalidateSize());
      } catch (e) {
        console.error(e);
        alert('No se pudo cargar el mapa de la tienda. Inténtalo más tarde.');
      }
    })();