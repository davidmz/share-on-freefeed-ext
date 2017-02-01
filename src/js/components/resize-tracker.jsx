import React from 'react';
import ReactDOM from 'react-dom';
import CustomEvent from 'custom-event';
import debounce from 'lodash.debounce';

export const ELEMENT_RESIZE_EVENT = 'elementResize';

export function contentResized(el) {
    try {
        if (el instanceof HTMLElement) {
            // pass
        } else if (el instanceof React.Component) {
            el = ReactDOM.findDOMNode(el);
        } else {
            return;
        }
        el.dispatchEvent(new CustomEvent(ELEMENT_RESIZE_EVENT, {bubbles: true}));
    } catch (e) {
        // pass
    }
}

/**
 * Component that tracks resize of it's content and triggers 'elementResize' event.
 *
 * Based on GWT algorithm: /user/src/com/google/gwt/user/client/ui/ResizeLayoutPanel.java
 */
export default class ResizeTracker extends React.Component {
    //noinspection JSUnusedGlobalSymbols
    static propTypes = {
        debounce: React.PropTypes.number.isRequired, // fixed, only applies at creation time
    };

    //noinspection JSUnusedGlobalSymbols
    static defaultProps = {
        debounce: 150,
    };

    root = null;
    expSensor = null;
    colSensor = null;

    setRoot = el => this.root = el;
    setExpSensor = el => this.expSensor = el;
    setColSensor = el => this.colSensor = el;

    scrollHandler = () => {
        if (this.expSensor) { // Expand
            const sensor = this.expSensor;
            const slider = sensor.firstChild;
            const height = sensor.offsetHeight + 100;
            const width = sensor.offsetWidth + 100;
            slider.style.width = width + 'px';
            slider.style.height = height + 'px';
            sensor.scrollLeft = width;
            sensor.scrollTop = height;
        }
        if (this.colSensor) { // Collapse
            const sensor = this.colSensor;
            sensor.scrollLeft = sensor.scrollWidth + 100;
            sensor.scrollTop = sensor.scrollHeight + 100;
        }
        contentResized(this.root);
    };

    constructor(props) {
        super(props);
        this.scrollHandler = debounce(this.scrollHandler, props.debounce);
    }

    componentDidMount() {
        this.scrollHandler();
    }

    render() {
        return (
            <div style={trackerStyle} ref={this.setRoot}>
                {this.props.children}
                <div style={sensorStyle} ref={this.setExpSensor} onScroll={this.scrollHandler}>
                    <div/>
                </div>
                <div style={sensorStyle} ref={this.setColSensor} onScroll={this.scrollHandler}>
                    <div style={colSliderStyle}/>
                </div>
            </div>
        );
    }
}

const trackerStyle = {
    position: 'relative',
    overflow: 'hidden',
};

const sensorStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    overflow: 'scroll',
    pointerEvents: 'none',
    zIndex: -1,
    opacity: 0,
};

const colSliderStyle = {
    width: '200%',
    height: '200%',
};
