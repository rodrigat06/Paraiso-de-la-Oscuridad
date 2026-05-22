



function advertenciaEstetica() {
    
    document.getElementById('modalPlaga').style.display = 'flex';
}


function cerrarModal() {
    
    document.getElementById('modalPlaga').style.display = 'none';
}

document.addEventListener("DOMContentLoaded", () => {
    
    const numeroCucarachas = 40; 
    
    const cuerpo = document.body;

    for (let i = 0; i < numeroCucarachas; i++) {
        
        const cucaracha = document.createElement("img");
        cucaracha.src = "recursos/global/img-index/cucaracha.png"; 
        cucaracha.alt = "cucaracha";
        cucaracha.className = "cucaracha-plaga";

        
        cucaracha.style.left = Math.random() * 100 + "vw";
        cucaracha.style.top = Math.random() * 100 + "vh";

        
        cucaracha.style.animationDelay = Math.random() * -20 + "s";
        cucaracha.style.animationDuration = (Math.random() * 1.5 + 1.8) + "s"; 

        
        
        const tamano = Math.random() * 21 + 24;
        cucaracha.style.width = tamano + "px";

        
        
        cucaracha.style.setProperty('--x1', (Math.random() * 300 - 150) + "px");
        cucaracha.style.setProperty('--y1', (Math.random() * 300 - 150) + "px");
        cucaracha.style.setProperty('--r1', (Math.random() * 360 - 180) + "deg");

        
        cucaracha.style.setProperty('--x2', (Math.random() * 400 - 200) + "px");
        cucaracha.style.setProperty('--y2', (Math.random() * 400 - 200) + "px");
        cucaracha.style.setProperty('--r2', (Math.random() * 360 - 180) + "deg");

        
        cucaracha.style.setProperty('--x3', (Math.random() * 300 - 150) + "px");
        cucaracha.style.setProperty('--y3', (Math.random() * 400 - 200) + "px");
        cucaracha.style.setProperty('--r3', (Math.random() * 360 - 180) + "deg");

        cuerpo.appendChild(cucaracha);
    }
});



