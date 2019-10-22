import { ComponentChild, h, render } from "preact";
import { UpperBarItem } from "./upperBarItem";
import { UpperBarItemData } from "./upperBarItemData";
import { UpperBar } from "./components/upper-bar";
import { PresetManager } from "./presetManager";
import { PresetNames } from "./presetItemData";
import { PlayerContribRegistry } from "@playkit-js-contrib/common";
import { PresetItem } from "./presetItem";

export interface UpperBarManagerOptions {
    corePlayer: KalturaPlayerTypes.Player;
    presetManager: PresetManager;
}

const ResourceToken = "UpperBarManager-v1";

export class UpperBarManager {
    static fromPlayer(
        playerContribRegistry: PlayerContribRegistry,
        creator: () => UpperBarManager
    ) {
        return playerContribRegistry.register(ResourceToken, 1, creator);
    }

    private _items: UpperBarItem[] = [];
    private _options: UpperBarManagerOptions;

    constructor(options: UpperBarManagerOptions) {
        this._options = options;
        this._options.presetManager.add({
            label: "upper-bar-manager",
            presets: [PresetNames.Playback, PresetNames.Live],
            container: { name: "TopBar", position: "Right" },
            renderChild: this._renderChild
        });
    }

    private _renderChild = (): ComponentChild => {
        const items = this._items.map(item => item.renderChild({}));
        return <UpperBar>{items}</UpperBar>;
    };

    /**
     * initialize new upper bar item
     * @param item
     */
    add(data: UpperBarItemData): UpperBarItem {
        const itemOptions = {
            corePlayer: this._options.corePlayer,
            data
        };
        const item = new UpperBarItem(itemOptions);
        this._items.push(item);
        return item;
    }

    /**
     * remove all ui manager items
     */
    reset(): void {}
}
