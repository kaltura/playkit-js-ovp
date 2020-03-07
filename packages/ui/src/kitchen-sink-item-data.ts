// import {ComponentChild} from 'preact';
import {KitchenSinkAdapter} from './components/kitchen-sink-adapter';

export interface KitchenSinkContentRendererProps {
  onClose: () => void;
}

export enum KitchenSinkExpandModes {
  AlongSideTheVideo = 'AlongSideTheVideo',
  Hidden = 'Hidden',
  OverTheVideo = 'OverTheVideo',
}

export enum KitchenSinkPositions {
  Top = 'top',
  Left = 'left',
  Right = 'right',
  Bottom = 'bottom',
}

export interface KitchenSinkItemData {
  label: string;
  // @ts-ignore:
  renderIcon: () => ComponentChild;
  expandMode: KitchenSinkExpandModes;
  position: KitchenSinkPositions;
  fillContainer?: boolean;
  // @ts-ignore:
  renderContent: (props: KitchenSinkContentRendererProps) => ComponentChild;
}
