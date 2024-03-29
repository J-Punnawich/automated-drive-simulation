class Car{
    constructor(x,y,width,height,controlType,maxSpeed=3){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;

        this.speed=0;
        this.acceleration=0.2;
        this.maxSpeed=maxSpeed;
        this.friction=0.05;
        this.angle=0;   // มุม
        this.damaged=false;

        this.useBrain = controlType=="AI";

        if(controlType!="CAR"){
            this.sensor=new Sensor(this);
            this.brain=new NeuralNetwork(           // ใส่ข้อมูล sensor กับจำนวน Neural
                [this.sensor.rayCount,6,4]
            );
        }
        this.controls=new Controls(controlType);   
    }

    update(roadBorders,traffic){
        if(!this.damaged){
            this.#move();
            this.polygon=this.#createPolygon();
            this.damaged=this.#assessDamage(roadBorders,traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders,traffic);
            const offsets=this.sensor.readings.map(             // ถ้า sensor ไม่เจออะไรให้เป็น 0 ถ้าเจอให้เอาค่า ลบด้วย 1
                s=>s==null?0:1-s.offset                         // ยิ่งวัตถุอยู่ใกล้ ค่ายิ่งเข้าใกล้ 1
            );
            const outputs=NeuralNetwork.feedForward(offsets,this.brain);    // ส่งข้อมูลไปให้ NeuralNetwork ทำงาน

            if(this.useBrain){
                this.controls.forward=outputs[0];         // ให้ควบคุมรถด้วย output
                this.controls.left=outputs[1];            
                this.controls.right=outputs[2];
                this.controls.reverse=outputs[3];
            }
        }
        
        
    }

    // เอารถ (polygon) มาลูปเช็คกับขอบถนน 
    #assessDamage(roadBorders,traffic){
        for(let i=0;i<roadBorders.length;i++){
            if(polysIntersect(this.polygon,roadBorders[i])){
                return true;
            }
        }

        for(let i=0;i<traffic.length;i++){
            if(polysIntersect(this.polygon,traffic[i].polygon)){
                return true;
            }
        }
        return false;
    }

    #move(){
        if(this.controls.forward){
            this.speed+=this.acceleration;
        }
        if(this.controls.reverse){
            this.speed-=this.acceleration;
        }

        if(this.speed>this.maxSpeed){
            this.speed=this.maxSpeed;
        }
        if(this.speed<-this.maxSpeed/2){
            this.speed=-this.maxSpeed/2;
        }

        if(this.speed>0){
            this.speed-=this.friction;
        }
        if(this.speed<0){
            this.speed+=this.friction;
        }
        if(Math.abs(this.speed)<this.friction){
            this.speed=0;
        }

        if(this.speed!=0){
            const flip=this.speed>0?1:-1;
            if(this.controls.left){
                this.angle+=0.03*flip;
            }
            if(this.controls.right){
                this.angle-=0.03*flip;
            }
        }

        // รถเคลื่อนที่ตามมุมที่เลี้ยวไป
        this.x-=Math.sin(this.angle)*this.speed;  
        this.y-=Math.cos(this.angle)*this.speed;
    }

    // สร้างตัวแปรที่จะกำหนดขอบของรถ
    #createPolygon(){
        const points=[];
        const rad=Math.hypot(this.width,this.height)/2;
        const alpha=Math.atan2(this.width,this.height);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });
        return points;
    }

    // drawing method
    draw(ctx){
        // ถ้ารถชนจะเปลี่ยนสี
        if(this.damaged){
            ctx.fillStyle="red";
        }else{
            ctx.fillStyle="black";
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x,this.polygon[0].y);    // ทำให้รถขยับได้
        for(let i=1;i<this.polygon.length;i++){             // ขนาดรถ
            ctx.lineTo(this.polygon[i].x,this.polygon[i].y);
        }
        ctx.fill();

        if(this.sensor){
            this.sensor.draw(ctx);
        }
        
    }
}