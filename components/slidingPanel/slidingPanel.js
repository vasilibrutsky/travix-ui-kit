import React, { Component, PropTypes } from 'react';
import { getClassNamesWithMods, getDataAttributes } from '../_helpers';

function isCssTransitionsSupported() {
  const body = document.body || document.documentElement;
  const transitions = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'otransitionend',
    'transition': 'transitionend',
  };

  if (body) {
    for (let prop in transitions) { // eslint-disable-line
      if (typeof body.style[prop] !== 'undefined') {
        return transitions[prop];
      }
    }
  }

  return false;
}

export default class SlidingPanel extends Component {
  constructor(props) {
    super(props);

    this.state = { isOverlayHidden: true, isActive: false };

    this.handleClickOverlay = this.handleClickOverlay.bind(this);
    this.handleActive = this.handleActive.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
    this.toggleOverlay = this.toggleOverlay.bind(this);

    this.overlayTimer = null;
  }

  static cssTransitionEndEvent = isCssTransitionsSupported()

  static propTypes = {
    /**
     * Defines if the panel is open.
     */
    active: PropTypes.bool,

    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,

    /**
     * When true, if the user clicks on the overaly, closes the panel.
     */
    closeOnOverlayClick: PropTypes.bool,

    /**
     * Data attributes. You can use it to set up any custom data-* attribute
     */
    dataAttrs: PropTypes.object,

    /**
     * You can provide set of custom modifications.
     */
    mods: PropTypes.arrayOf(PropTypes.string),

    /**
     * When defined, this function is triggered when the panel is closing.
     */
    onClose: PropTypes.func,

    /**
     * When defined, this function is triggered when the panel is opening.
     */
    onOpen: PropTypes.func,

    /** Sets the timeout, in miliseconds, for the `transitionend` event to happen  */
    transitionTimeoutInMs: PropTypes.number,
  }

  static defaultProps = {
    closeOnOverlayClick: true,
    transitionTimeoutInMs: 500,
  }

  componentWillReceiveProps(newProps) {
    if (newProps.active !== this.state.isActive) {
      if (newProps.active) {
        this.handleActive();
      } else {
        this.handleClose();
      }
    }
  }

  componentDidMount() {
    const { active } = this.props;
    if (active) {
      this.handleActive();
    }

    if (SlidingPanel.cssTransitionEndEvent) {
      this.panel.addEventListener(SlidingPanel.cssTransitionEndEvent, this.handleTransitionEnd);
    }

    this.closeButton = this.panel.querySelector('[rel="close"]');
    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.handleClose);
    }
  }

  componentWillUnmount() {
    if (SlidingPanel.cssTransitionEndEvent) {
      this.panel.removeEventListener(SlidingPanel.cssTransitionEndEvent, this.handleTransitionEnd);
    }

    if (this.closeButton) {
      this.closeButton.removeEventListener('click', this.handleClose);
    }
  }

  /**
   * Handles the click in the overlay.
   *
   * @method handleClickOverlay
   * @param {SyntheticEvent} e Click event trapped in the overlay element
   */
  handleClickOverlay(e) {
    if ((e.target === e.currentTarget) && this.props.closeOnOverlayClick) {
      this.handleClose();
    }
  }

  /**
   * Closes the panel.
   * If CSS Transitions are not supported, immediately triggers the hiding
   * of the overlay.
   *
   * @method handleClose
   */
  handleClose() {
    this.setState({ isActive: false }, () => {
      this.overlayTimer = setTimeout(() => this.toggleOverlay(), this.props.transitionTimeoutInMs);

      if (!SlidingPanel.cssTransitionEndEvent) {
        this.toggleOverlay();
      }
    });
  }

  /**
   * Opens the panel
   *
   * @method handleActive
   */
  handleActive() {
    const { onOpen } = this.props;

    /**
     * Triggers the removal of the modifier '_hidden' from the overlay element.
     * Then with the setTimeout(() => {}, 0) delegates the sliding effect - caused
     * by the isActive state change - to the next frame.
     */
    this.setState({ isOverlayHidden: false }, () => {
      setTimeout(() => {
        this.setState({ isActive: true }, () => {
          if (onOpen) {
            onOpen();
          }
        });
      }, 0);
    });
  }

  /**
   * Handles the event 'transitionend' triggered by the panel when stops sliding.
   *
   * @method handleTransitionEnd
   * @param {Event} e Event data triggered
   */
  handleTransitionEnd(e) {
    if (this.overlayTimer) {
      clearTimeout(this.overlayTimer);
      this.overlayTimer = null;
    }

    if (e.propertyName === 'transform') {
      this.toggleOverlay();
    }
  }

  /**
   * Hides the overlay.
   *
   * @method toggleOverlay
   */
  toggleOverlay() {
    const { onClose } = this.props;
    this.setState({ isOverlayHidden: !this.state.isActive }, () => {
      if (this.state.isOverlayHidden && onClose) {
        onClose();
      }
    });
  }

  render() {
    const {
      dataAttrs,
      children,
    } = this.props;

    const overlayMods = [];
    const panelMods = this.props.mods ? this.props.mods.slice() : [];

    if (this.state.isOverlayHidden) {
      overlayMods.push('hidden');
    }

    if (this.state.isActive) {
      panelMods.push('active');
    }

    const panelClass = 'ui-sliding-panel';
    const panelClassName = getClassNamesWithMods(panelClass, panelMods);

    const overlayClass = 'ui-sliding-panel-overlay';
    const overlayClassName = getClassNamesWithMods(overlayClass, overlayMods);

    return (
      <div className={overlayClassName} onClick={this.handleClickOverlay}>
        <div
          className={panelClassName}
          ref={e => (this.panel = e)}
          {...getDataAttributes(dataAttrs)}
        >
          {children}
        </div>
      </div>
    );
  }
}
