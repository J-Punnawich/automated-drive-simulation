class NeuralNetwork{            // network
    constructor(neuronCounts){
        this.levels=[];
        for(let i=0;i<neuronCounts.length-1;i++){       
            this.levels.push(new Level(
                neuronCounts[i],neuronCounts[i+1]
            ));
        }
    }

    static feedForward(givenInputs,network){        // feed ข้อมูลให้ network
        let outputs=Level.feedForward(
            givenInputs,network.levels[0]);     
        for(let i=1;i<network.levels.length;i++){
            outputs=Level.feedForward(              // update output เอา output ไปคำนวณใหม่อีกรอบ
                outputs,network.levels[i]);
        }
        return outputs;
    }


    static mutate(network,amount=1){
        network.levels.forEach(level => {
            for(let i=0;i<level.biases.length;i++){
                level.biases[i]=lerp(
                    level.biases[i],
                    Math.random()*2-1,
                    amount
                )
            }
            for(let i=0;i<level.weights.length;i++){
                for(let j=0;j<level.weights[i].length;j++){
                    level.weights[i][j]=lerp(
                        level.weights[i][j],
                        Math.random()*2-1,
                        amount
                    )
                }
            }
        });
}

}

class Level{
    constructor(inputCount,outputCount){
        this.inputs=new Array(inputCount);      // จาก sensor
        this.outputs=new Array(outputCount);
        this.biases=new Array(outputCount);

        this.weights=[];
        for(let i=0;i<inputCount;i++){         // ทุกๆ output จะมี input node อยู่
            this.weights[i]=new Array(outputCount);
        }

        Level.#randomize(this);               // random brain
    }

    static #randomize(level){
        for(let i=0;i<level.inputs.length;i++){         // ใน input
            for(let j=0;j<level.outputs.length;j++){    // ในแต่ละ output 
                level.weights[i][j]=Math.random()*2-1;  // random ให้ weight เป็นค่าระหว่าง [-1,1] : negative weight 
            }                                           // egative weight = หมายถึงไม่ควรเลือกทางนี้  
        }

        for(let i=0;i<level.biases.length;i++){         // ทำแบบเดียวกันกับ bias
            level.biases[i]=Math.random()*2-1;
        }
    }

    static feedForward(givenInputs,level){
        for(let i=0;i<level.inputs.length;i++){
            level.inputs[i]=givenInputs[i];             // input รับค่าจาก sensor 
        }

        for(let i=0;i<level.outputs.length;i++){
            let sum=0                                   // คำนวณ sum จาก input, weight (random)
            for(let j=0;j<level.inputs.length;j++){         
                sum+=level.inputs[j]*level.weights[j][i];   // input จะเป็น 0 ถ้า sensor ไม่เจออะไรเลย
            }                               
            
                                            // Line equation:  w(weight)*s(sensor) + b(bias) = 0  => neurons จะส่งคำสั่งเมื่อ คำนวณแล้วค่ามากว่า 0 
                                            // จึงต้องใช้ weight,bias ในช่วง [-1,1]

            if(sum>level.biases[i]){        
                level.outputs[i]=1;         // ถ้าค่ามากกว่า bias ให้ส่งคำสั่ง
            }else{
                level.outputs[i]=0;
            } 
        }

        return level.outputs;
    }
}