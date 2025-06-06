document.addEventListener('DOMContentLoaded',function startMap(){
    var map = L.map('map', {
        center: [-15.793889, -47.882778],
        zoom: 11
    });


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);   
});

startMap()