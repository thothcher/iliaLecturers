
let menuToggle = document.querySelector('.toggle');
let nav = document.querySelector('nav');

menuToggle.onclick = ()=>{
    nav.classList.toggle('active-menu');
}