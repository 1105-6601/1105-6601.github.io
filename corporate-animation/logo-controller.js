import TRIANGLE_POSITIONS from './logo-positions.js';

export default class LogoController
{
    id;

    #canvas;

    #ctx;

    #setting;

    #baseTheta = 0;

    #basePosX;

    #basePosY;

    #size;

    #triangleScale = 0.1;

    #speedRatio = Math.random();

    // -1 < x < 1 の範囲でθの増減値をランダムに決定
    #baseThetaIncrement = (Math.random() * 2) - 1;

    // 0 < θ < 360 の範囲でランダムにXYの増加量を決定
    #basePosXIncrement = Math.cos(2 * Math.PI * Math.random()) * this.#speedRatio;
    #basePosYIncrement = Math.sin(2 * Math.PI * Math.random()) * this.#speedRatio;

    #titleImage = new Image();

    #controllers;

    constructor(canvas, setting, controllers)
    {
        this.#canvas  = canvas;
        this.#ctx     = canvas.getContext('2d');
        this.#setting = setting;

        this.id = this.#setting.id;

        const centerX = this.#canvas.width / 2;
        const centerY = this.#canvas.height / 2;

        const randomVectorX = Math.cos((Math.PI / 180) * (Math.random() * 360));
        const randomVectorY = Math.sin((Math.PI / 180) * (Math.random() * 360));

        const vectorScale = 300.0;

        this.#basePosX  = centerX + randomVectorX * vectorScale;
        this.#basePosY  = centerY + randomVectorY * vectorScale;
        this.#baseTheta = this.id * 20;

        this.#titleImage.src = this.#setting.titleImage;

        this.#controllers = controllers;
    }

    render()
    {
        this.#renderTriangles();
        this.#renderTitleImage();
        this.#updateBasePositions();
        this.#wrapBasePositions();
        this.#addSwirlEffect();
        this.#decreaseBasePositionIncrement();
        this.#objectCollisionJudgment();
    }

    set size(size)
    {
        this.#size = size;
    }

    get x()
    {
        return this.#basePosX
    }

    get y()
    {
        return this.#basePosY
    }

    // ロゴ全体の描写関数
    #renderTriangles()
    {
        for (let position of TRIANGLE_POSITIONS) {
            this.#renderTriangle(position);
        }
    }

    // ロゴの各三角形の描写関数
    #renderTriangle(position)
    {
        this.#ctx.beginPath();

        // 三角形の中心点を計算
        const vectorX = this.#basePosX + Math.cos((this.#baseTheta + position.theta) * Math.PI / 180) * this.#size * position.rScale;
        const vectorY = this.#basePosY + Math.sin((this.#baseTheta + position.theta) * Math.PI / 180) * this.#size * position.rScale;

        // 三角形を描写
        if (position.inverted) {
            // θ=270
            this.#ctx.moveTo(
                vectorX + Math.cos((this.#baseTheta + 270) / 180 * Math.PI) * this.#size * this.#triangleScale,
                vectorY + Math.sin((this.#baseTheta + 270) / 180 * Math.PI) * this.#size * this.#triangleScale
            );
            // θ=150
            this.#ctx.lineTo(
                vectorX + Math.cos((this.#baseTheta + 150) / 180 * Math.PI) * this.#size * this.#triangleScale,
                vectorY + Math.sin((this.#baseTheta + 150) / 180 * Math.PI) * this.#size * this.#triangleScale
            );
            // θ=30
            this.#ctx.lineTo(
                vectorX + Math.cos((this.#baseTheta + 30) / 180 * Math.PI) * this.#size * this.#triangleScale,
                vectorY + Math.sin((this.#baseTheta + 30) / 180 * Math.PI) * this.#size * this.#triangleScale
            );
        } else {
            // θ=90
            this.#ctx.moveTo(
                vectorX + Math.cos((this.#baseTheta + 90) / 180 * Math.PI) * this.#size * this.#triangleScale,
                vectorY + Math.sin((this.#baseTheta + 90) / 180 * Math.PI) * this.#size * this.#triangleScale
            );
            // θ=210
            this.#ctx.lineTo(
                vectorX + Math.cos((this.#baseTheta + 210) / 180 * Math.PI) * this.#size * this.#triangleScale,
                vectorY + Math.sin((this.#baseTheta + 210) / 180 * Math.PI) * this.#size * this.#triangleScale
            );
            // θ=-30
            this.#ctx.lineTo(
                vectorX + Math.cos((this.#baseTheta - 30) / 180 * Math.PI) * this.#size * this.#triangleScale,
                vectorY + Math.sin((this.#baseTheta - 30) / 180 * Math.PI) * this.#size * this.#triangleScale
            );
        }

        // ロゴの色を設定
        this.#ctx.fillStyle = this.#setting.color;
        this.#ctx.fill();
    }

    // タイトル画像の描写関数
    #renderTitleImage()
    {
        this.#ctx.drawImage(
            this.#titleImage,
            this.x - this.#size * .65,
            this.y + this.#size * .75,
            this.#size * 1.3,
            this.#size * .15,
        );
    }

    // ロゴの座標を更新
    #updateBasePositions()
    {
        this.#baseTheta += this.#baseThetaIncrement;
        this.#basePosX += this.#basePosXIncrement;
        this.#basePosY += this.#basePosYIncrement;
    }

    // ロゴが画面外に出そうになった場合の折り返し処理
    #wrapBasePositions()
    {
        // X軸方向の限界に達した場合
        if (this.#canvas.width - (this.#size / 2) < this.#basePosX) {
            this.#basePosXIncrement -= this.#size / 1000;
        }
        if (this.#size / 2 > this.#basePosX) {
            this.#basePosXIncrement += this.#size / 1000;
        }
        // Y軸方向の限界に達した場合
        if (this.#canvas.height - (this.#size / 2) < this.#basePosY) {
            this.#basePosYIncrement -= this.#size / 1000;
        }
        if (this.#size / 2 > this.#basePosY) {
            this.#basePosYIncrement += this.#size / 1000;
        }
    }

    // XYの増加量を微量ずつ減少させる
    #decreaseBasePositionIncrement()
    {
        // 徐々に速度を緩める視覚効果
        this.#basePosXIncrement *= .99;
        this.#basePosYIncrement *= .99;
    }

    // 自身を除く他オブジェクトとの衝突状態を判定
    #objectCollisionJudgment()
    {
        // オブジェクトの反発係数、大きいほど反発が強くなる
        const coefficientOfRestitution = .005;

        for (let controller of this.#controllers) {
            // 自身を除く他オブジェクトのみ判定
            if (controller.id !== this.id) {
                // 対象オブジェクトとの2点間の距離を算出
                const objectDistance            = Math.sqrt(Math.pow(controller.x - this.x, 2) + Math.pow(controller.y - this.y, 2));
                // 衝突境界距離をロゴサイズの1.5倍に設定
                const collisionBoundaryDistance = this.#size * 1.5;
                // 2点間の距離が、衝突境界距離よりも短い場合
                if (objectDistance < collisionBoundaryDistance) {
                    // atan2(アークタンジェント2)は座標(0,0)と引数(x,y)を結んだ直線とx軸の角度θ(radian)を求めるもの
                    // 自身の座標(X, Y)から対象物の座標(X, Y)を減算(反発方向)した座標のradianを求める
                    const radian = Math.atan2(this.y - controller.y, this.x - controller.x);

                    // 反発方向のベクトルを算出
                    const reverseVectorX = Math.cos(radian);
                    const reverseVectorY = Math.sin(radian);

                    // 衝突境界距離から2点間の距離を引き、エリアへの侵入距離を算出
                    const invadedDistance = collisionBoundaryDistance - objectDistance;

                    // 求めた侵入距離に反発係数及び反発ベクトルを掛け、進むべき方向及び距離を算出、それを現在座標に加算する
                    // ※反発係数は固定されているため、侵入距離が大きくなるほど逆方向への移動距離が大きくなる≒オブジェクト同士が近づけば近づくほど速度減少が早くなる
                    this.#basePosXIncrement += reverseVectorX * invadedDistance * coefficientOfRestitution;
                    this.#basePosYIncrement += reverseVectorY * invadedDistance * coefficientOfRestitution;
                }
            }
        }
    }

    // キャンバスを中心として起動に渦巻状の動きを加える
    // 中心座標へ吸い込まれるような動きが加わる
    #addSwirlEffect()
    {
        // キャンバス中央を中央座標と捉えた場合における、現在座標のθ(degree)を算出
        const currentTheta = Math.atan2(this.y - this.#canvas.height / 2, this.x - this.#canvas.width / 2) * 180 / Math.PI;
        // 加算するθを定義、0 < θ < 180
        // 角度を増やすと吸い寄せられる力が強まる
        const additionalTheta = 120; // degree
        const weight          = .002;
        // 加算されたθの方向へ座標を更新
        this.#basePosXIncrement += Math.cos((currentTheta + additionalTheta) * Math.PI / 180) * weight;
        this.#basePosYIncrement += Math.sin((currentTheta + additionalTheta) * Math.PI / 180) * weight;
    }
}
