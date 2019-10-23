import { UpperBarManager } from "./upperBarManager";
import { FloatingManager } from "./floatingManager";
import { KitchenSinkManager } from "./kitchenSinkManager";
import { PlayerContribRegistry } from "@playkit-js-contrib/common";
import { PresetManager } from "./presetManager";
import { BannerManager } from "./bannerManager";
import { ToastManager } from "./toastManager";

export interface UIManagerOptions {
    upperBarManager: UpperBarManager;
    floatingManager: FloatingManager;
    kitchenSinkManager: KitchenSinkManager;
    presetManager: PresetManager;
    bannerManager: BannerManager;
    toastManager: ToastManager;
}

const ResourceToken = "UIManager-v1";

export class UIManager {
    static fromPlayer(playerContribRegistry: PlayerContribRegistry, creator: () => UIManager) {
        return playerContribRegistry.register(ResourceToken, 1, creator);
    }

    constructor(private _options: UIManagerOptions) {
        this._loadFont();
    }

    get upperBar(): UpperBarManager {
        return this._options.upperBarManager;
    }

    get floating(): FloatingManager {
        return this._options.floatingManager;
    }

    get kitchenSink(): KitchenSinkManager {
        return this._options.kitchenSinkManager;
    }

    get banner(): BannerManager {
        return this._options.bannerManager;
    }

    get toast(): ToastManager {
        return this._options.toastManager;
    }

    get presetComponents(): { add: PresetManager["add"] } {
        return {
            add: this._options.presetManager.add.bind(this._options.presetManager)
        };
    }

    reset(): void {
        this._options.upperBarManager && this._options.upperBarManager.reset();
        this._options.floatingManager && this._options.floatingManager.reset();
        this._options.kitchenSinkManager && this._options.kitchenSinkManager.reset();
        this._options.bannerManager && this._options.bannerManager.reset();
        this._options.toastManager && this._options.toastManager.reset();
    }

    private _loadFont() {
        //todo [sa] load font from config
        //todo [sa] use Lato font family - currently just testing

        // @ts-ignore
        let fontFamily = config.contrib.ui.fonts.fontFamily;

        const fontCss = `.kaltura-player-container {
                font-family: inherit;
            }         
            .playkit-player {
                font-family: ${fontFamily};
            }
            .playkit-player .playkit-player-gui  {
                font-family: ${fontFamily};
            }
            button, textarea {
                font-family: inherit;
            }`;
        const lastHeadChild = (document.head || document.getElementsByTagName("head")[0])
            .lastElementChild;
        const style = document.createElement("style");
        //adding as last child
        lastHeadChild.parentNode.insertBefore(style, lastHeadChild.nextSibling);
        style.appendChild(document.createTextNode(fontCss));
    }
}
