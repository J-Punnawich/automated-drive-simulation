const canvas=document.getElementById("myCanvas");
canvas.width=150;

const ctx = canvas.getContext("2d");
const car=new Car(75,225,30,50);

animate();

function animate(){
    car.update();
    
    canvas.height=window.innerHeight;
    car.draw(ctx);
    requestAnimationFrame(animate);
}

