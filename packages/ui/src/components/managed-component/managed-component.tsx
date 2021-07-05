import {h, Component, ComponentChild, ComponentChildren} from 'preact';
import {getContribLogger} from '@playkit-js-contrib/common';
import {ContribLogger} from '@playkit-js-contrib/common';
import * as styles from './_managed-component.scss';
const {
  redux: {connect},
} = KalturaPlayer.ui;

type ManagedComponentState = {
  toggler: boolean;
};
type ManagedComponentProps = {
  isShown: () => boolean;
  renderChildren: (palyerSize: string) => ComponentChildren;
  label: string;
  fillContainer: boolean;
  playerSize?: string;
  updateOnPlayerSizeChanged?: boolean;
};

const mapStateToProps = (state: Record<string, any>) => ({
  playerSize: state.shell.playerSize,
});
@connect(mapStateToProps, null, null, {forwardRef: true})
export class ManagedComponent extends Component<
  ManagedComponentProps,
  ManagedComponentState
> {
  private _logger: ContribLogger | null = null;

  static defaultProps = {
    fillContainer: false,
  };

  update() {
    this.setState((prev: ManagedComponentState) => {
      return {
        toggler: !prev.toggler,
      };
    });
  }

  shouldComponentUpdate(
    prevProps: Readonly<ManagedComponentProps>,
    prevState: Readonly<ManagedComponentState>
  ): boolean {
    const {toggler} = this.state;
    const {
      isShown,
      renderChildren,
      label,
      fillContainer,
      updateOnPlayerSizeChanged,
      playerSize,
    } = this.props;
    if (
      prevState.toggler !== toggler ||
      prevProps.isShown !== isShown ||
      prevProps.renderChildren !== renderChildren ||
      prevProps.label !== label ||
      prevProps.fillContainer !== fillContainer ||
      prevProps.updateOnPlayerSizeChanged !== updateOnPlayerSizeChanged ||
      (updateOnPlayerSizeChanged && prevProps.playerSize !== playerSize)
    ) {
      return true;
    }
    return false;
  }

  componentDidMount(): void {
    this._logger = getContribLogger({
      module: 'contrib-ui',
      class: 'ManagedComponent',
      context: this.props.label,
    });
    this._logger.info(`mount component`, {
      method: 'componentDidMount',
    });
    this.setState({
      toggler: false,
    });
  }

  render() {
    const {fillContainer, isShown, playerSize} = this.props;
    if (!isShown()) {
      return null;
    }

    if (this._logger) {
      this._logger.trace(`render component`, {
        method: 'render',
      });
    }

    return (
      <div
        data-contrib-item={this.props.label}
        className={fillContainer ? styles.fillContainer : ''}>
        {this.props.renderChildren(playerSize)}
      </div>
    );
  }
}
