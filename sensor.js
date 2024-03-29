class Sensor{
    constructor(car){
        this.car=car;
        this.rayCount=5;
        this.rayLength=150;
        this.raySpread=Math.PI/2;

        this.rays=[];
        this.readings=[];
    }

    update(roadBorders,traffic){
        this.#createtRays();
        this.readings=[];
        // ลูปข้อมูลเส้น sensor กับถนน
        for(let i=0;i<this.rays.length;i++){
            this.readings.push(
                this.#getReading(
                    this.rays[i],
                    roadBorders,
                    traffic)
            );
        }
        
    }

    #getReading(ray,roadBorders,traffic){
        let touches=[];
        // เอา sensor มาลูปกับ ขอบถนน 
        for(let i=0;i<roadBorders.length;i++){
            const touch=getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );
            // เช็คว่า sensor เจอขอบถนนไหม
            if(touch){
                touches.push(touch);
            }
        }

        for(let i=0;i<traffic.length;i++){      // ลูปข้อมุลรถคันอื่น
            const poly=traffic[i].polygon;      // ให้ poly = ขนาดของรถคันอื่นๆด้วยฟังชั่น polygon

            for(let j=0;j<poly.length;j++){     // ลูปเช็คแต่ละมุมของรถคันอื่น
                const value=getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1)%poly.length]
                );
                if(value){
                    touches.push(value);
                }
            }
        }
    

        // เช็คว่าเจอไหม
        if(touches.length==0){
            return null;
        }else{  
            const offsets=touches.map(e=>e.offset); // map sensor กับค่าระยะห่าง
            const minOffset=Math.min(...offsets);  // หาค่าระยะห่างที่น้อยที่สุดโดย ใส่ offset ทั้งหมด
            return touches.find(e=>e.offset==minOffset);  // ให้ .find sensorที่มีระยะห่างน้อยสุด
        }
    }
    // สร้างเส้น sensor
    #createtRays(){
        this.rays=[];
        for(let i=0;i<this.rayCount;i++){
            const rayAngle=lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount==1?0.5:i/(this.rayCount-1)
            )+this.car.angle;

            const start={x:this.car.x, y:this.car.y};
            const end={
                x:this.car.x-
                    Math.sin(rayAngle)*this.rayLength,
                y:this.car.y-
                    Math.cos(rayAngle)*this.rayLength
            };
            this.rays.push([start,end]);
        }
    }

    draw(ctx){
        // sensor road detect
        for(let i=0;i<this.rayCount;i++){
            let end=this.rays[i][1];
            if(this.readings[i]){
                end=this.readings[i];
            }

            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="green";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

        // detected  
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="yellow";
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }        
}