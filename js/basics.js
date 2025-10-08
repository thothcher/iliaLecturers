
let menuToggle = document.querySelector('.toggle');
let nav = document.querySelector('nav');
console.log(menuToggle);
menuToggle.addEventListener('click',()=>{
    nav.classList.toggle('active-menu');
}) 