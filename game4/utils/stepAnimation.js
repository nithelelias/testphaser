
export default function stepAnimationFn(target) {
    var ang = 30,lastdir=1,busy=false,promise=Promise.resolve(); 
    const animate=(angle)=>{
        return new Promise((onComplete) => {
            if(!target.scene){
                onComplete();
                return
            }
            target.scene.tweens.add({
                targets: target,
                ease: "power1",
                angle  ,
                duration: 100,
                onComplete 
            });
        })
    }
    const play = (dir) => {
       
        if(busy){
            return promise;
        }
        busy=true;
        if(dir===lastdir){  
           // dir=-dir;
        }
        if(dir===0){
            dir=lastdir/2;
            lastdir=-lastdir;
        } 
        promise= animate(ang*dir).then(()=>animate(0)).then(()=>{
            busy=false;
        });

        return promise;
        
    };

    return play;
}
