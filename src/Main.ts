//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {



    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {

            }
        })

        

        egret.lifecycle.onPause = () => {
            console.log("app 进入后台");
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log("app 进入前台");
            console.log(e);
        })


    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
        const result = await RES.getResAsync("description_json")
        // this.startAnimation(result);
        await platform.login();
        const userInfo = await platform.getUserInfo();
        console.log(userInfo);

    }

    

    private async loadResource() {
        try {
            console.log(this)
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    private textfield: egret.TextField;

    private imgItem: egret.Bitmap[]

    private imgWidth
    private imgHeight
    private baseWidth
    private baseHeight
    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        console.log(this.imgItem)
        let gamePic = this.createBitmapByName("game1_jpg");
        /*
         *添加一个缩略图 
        */
        this.addChild(gamePic);
        let stageW = this.stage.stageWidth;
        let stageH = this.stage.stageHeight;
        this.imgWidth = gamePic.width
        this.imgHeight = gamePic.height

        this.baseWidth = Math.floor(this.imgWidth/3)
        this.baseHeight = Math.floor(this.imgHeight/3)

        gamePic.width = Math.floor(stageW/3);
        gamePic.height = Math.floor(stageW/3);
        gamePic.x = stageW - gamePic.width;
        gamePic.y = stageH - gamePic.height;

        // 添加缩略图end

        let texture: any = gamePic.texture
        
        let list = this.cropImage(texture)

        for(let i = 0; i < list.length; i++){
            list[i].texture.x = this.baseWidth*(i%3)
            list[i].texture.y = this.baseHeight*Math.floor(i/3)
            this.addChild(list[i].texture)
        }

    }

    /**
     * 生成拼图切块
     * 
     */

    private cropImage (texture: egret.RenderTexture) {
         //使用 RenderTexture 进行显示
        console.log(texture);
        let picList: Array<any>= []
        for(let i = 0; i < 8;i++){
            // renderTexture不能在外部声明，否则会导致drawToTexture重复使用结果不符合预期
            var renderTexture:egret.RenderTexture = new egret.RenderTexture();
            renderTexture.drawToTexture(
                new egret.Bitmap(texture), new 	egret.Rectangle(this.baseWidth*(i%3),this.baseHeight*Math.floor(i / 3),this.baseWidth,this.baseHeight)
            );
            //将绘制好的 RenderTexture 进行显示
            var gamePicItem:egret.Bitmap = new egret.Bitmap(renderTexture);
            picList.push({
                imgIndex: i,
                texture: gamePicItem
            })
        }
        // this.addChild(picList[1].texture)
        return picList;
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string) {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    private startAnimation(result: string[]) {
        console.log(result)
        let parser = new egret.HtmlTextParser();

        let textflowArr = result.map(text => parser.parse(text));
        let textfield = this.textfield;
        console.log(textfield,textflowArr)
        let count = -1;
        let change = () => {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            let textFlow = textflowArr[count];

            // 切换描述内容
            // Switch to described content
            textfield.textFlow = textFlow;
            let tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, this);
        };

        change();
    }
}