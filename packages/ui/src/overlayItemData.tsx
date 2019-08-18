import { ComponentChild, Ref } from "preact";
import { PlayerSize, VideoSize } from "./common.types";

export enum OverlayUIModes {
    MediaLoaded = "MediaLoaded",
    OnDemand = "OnDemand",
    Immediate = "Immediate",
    FirstPlay = "FirstPlay"
}

export enum OverlayPositions {
    Video = "video",
    VisibleArea = "visibleArea"
}

export interface OverlayItemData {
    label: string;
    mode: OverlayUIModes;
    renderContent: (overlayItemProps: OverlayItemProps) => ComponentChild;
    className?: string;
    position: OverlayPositions;
}

export interface OverlayItemProps {
    currentTime: number;
    canvas: {
        playerSize: PlayerSize;
        videoSize: VideoSize;
    };
}
