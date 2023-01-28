import LogoController from './logo-controller.js';
import LOGO_SETTINGS  from './logo-settings.js';
import Util           from './util.js';

export default class AnimationController
{
    #canvas;

    #ctx;

    #logoControllers = [];

    #shortSidesOfCanvas;

    constructor(canvas)
    {
        this.#canvas = canvas;
        this.#ctx    = canvas.getContext('2d');
    }

    initialize()
    {
        let baseWidth  = this.#canvas.clientWidth
        let baseHeight = window.innerHeight;

        this.#shortSidesOfCanvas = baseWidth < baseHeight ? baseWidth : baseHeight;

        this.#canvas.width  = baseWidth;
        this.#canvas.height = baseHeight;

        if (Util.isSp()) {
            this.#canvas.width  = baseWidth * 2;
            this.#canvas.height = baseHeight * 2;
        }

        this.#canvas.style.width  = baseWidth + 'px';
        this.#canvas.style.height = baseHeight + 'px';

        // 解り易いようY座標を反転させる（開発用）
        // this.#ctx.transform(1, 0, 0, -1, 0, this.#canvas.height);

        this.#createLogoControllers();

        return this;
    }

    animationStart()
    {
        setTimeout(() => {
            this.#clearCanvas();
            for (let logo of this.#logoControllers) {
                logo.render();
            }
            this.animationStart();
        }, 10);
    }

    #createLogoControllers()
    {
        for (let setting of LOGO_SETTINGS) {
            const logo = new LogoController(this.#canvas, setting, this.#logoControllers);
            logo.size = this.#shortSidesOfCanvas * (Util.isSp() ? .4 : .1);
            this.#logoControllers.push(logo);
        }
    }

    #clearCanvas()
    {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }
}