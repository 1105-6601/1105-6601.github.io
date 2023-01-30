import LogoController from './logo-controller.js';
import LOGO_SETTINGS  from './logo-settings.js';
import Util           from './util.js';

export default class AnimationController
{
    hoveringObjectId;

    targetedAny = false;

    #refreshRate = 100;

    #canvas;

    #ctx;

    #logoControllers = [];

    #shortSidesOfCanvas;

    #cursorState = {
        x: 0,
        y: 0,
    }

    constructor(canvas)
    {
        this.#canvas = canvas;
        this.#ctx    = canvas.getContext('2d');
    }

    get cursorX()
    {
        return Util.isSp() ? this.#cursorState.x * 2 : this.#cursorState.x;
    }

    get cursorY()
    {
        return Util.isSp() ? this.#cursorState.y * 2 : this.#cursorState.y;
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
        this.#bindEvents();

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
        }, 1000 / this.#refreshRate);
    }

    #createLogoControllers()
    {
        for (let setting of LOGO_SETTINGS) {
            const logo = new LogoController(this.#canvas, setting, this.#logoControllers, this);
            logo.size  = this.#shortSidesOfCanvas * (Util.isSp() ? .4 : .1);
            this.#logoControllers.push(logo);
        }
    }

    #clearCanvas()
    {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    #bindEvents()
    {
        if (Util.isSp()) {
            this.#canvas.addEventListener('touchstart', (touchEvent) => {
                this.#cursorState.x = touchEvent.touches[0].clientX;
                this.#cursorState.y = touchEvent.touches[0].clientY + window.scrollY;
            });
            this.#canvas.addEventListener('touchmove', (touchEvent) => {
                this.#cursorState.x = touchEvent.touches[0].clientX;
                this.#cursorState.y = touchEvent.touches[0].clientY + window.scrollY;
            });
            this.#canvas.addEventListener('touchend', () => {
                setTimeout(() => {
                    this.#objectSelected(this.hoveringObjectId);
                    this.#resetCursorState();
                }, 1000 / this.#refreshRate + 10);
            });
        } else {
            this.#canvas.addEventListener('mousemove', (mouseEvent) => {
                this.#cursorState.x = mouseEvent.clientX;
                this.#cursorState.y = mouseEvent.clientY + window.scrollY;
            });
            this.#canvas.addEventListener('click', () => {
                this.#objectSelected(this.hoveringObjectId);
                this.#resetCursorState();
            });
        }
    }

    #resetCursorState()
    {
        this.#cursorState = {
            x: 0,
            y: 0,
        };
    }

    #objectSelected(objectId)
    {
        const logoController = this.#logoControllers.find(logo => logo.id === objectId);
        if (logoController) {
            logoController.targeted = true;
        }

        this.targetedAny = true;
    }
}