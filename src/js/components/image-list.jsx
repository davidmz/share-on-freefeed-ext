import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';

import {observer} from 'mobx-react';
import {observable, action} from 'mobx';

import {DragSource, DropTarget} from 'react-dnd';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import imageLoaded from '../lib/image-loaded';
import ui from '../state/ui';

import SVGIcon from './svg-icon';
import css from '../../styles/modules/share-form.css';

const itemType = 'preview';

const dndSource = {
    beginDrag(props) {
        return {index: props.index};
    }
};

const dndTarget = {
    hover(props, monitor, component) {
        const dragIdx = monitor.getItem().index;
        const hoverIdx = props.index;
        if (dragIdx === hoverIdx) {
            return;
        }
        const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
        const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
        const mouseClientOffset = monitor.getClientOffset();
        const hoverClientX = mouseClientOffset.x - hoverBoundingRect.left;
        if (
            hoverClientX < hoverMiddleX && dragIdx === hoverIdx - 1
            || hoverClientX >= hoverMiddleX && dragIdx === hoverIdx + 1
        ) {
            return;
        }
        ui.reorderImage(dragIdx, hoverIdx);
        monitor.getItem().index = hoverIdx;
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
}

@DropTarget(itemType, dndTarget, connect => ({connectDropTarget: connect.dropTarget()}))
@DragSource(itemType, dndSource, collect)
@observer
class ImagePreview extends Component {
    @observable sizesText = '';

    @action setSizesText = text => this.sizesText = text;

    getInfo = image => {
        if (image) {
            imageLoaded(image).then(() => {
                this.setSizesText(`${image.naturalWidth}\u00d7${image.naturalHeight}`);
            });
        }
    };

    render() {
        const {isDragging, connectDragSource, connectDropTarget, src, remover} = this.props;
        return (
            <div className={css.imgPreview} style={{opacity: isDragging ? 0.5 : 1}}>
                <div className={css.delBtn} onClick={remover(src)}>
                    <SVGIcon id="close"/>
                </div>
                <div className={css.imgInfo}>{this.sizesText}</div>
                {connectDragSource(connectDropTarget(<img src={src} ref={this.getInfo}/>))}
            </div>
        );
    }
}

@DragDropContext(HTML5Backend)
export default class extends Component {
    render() {
        const {srcList, remover} = this.props;
        const children = srcList.map((src, i) => <ImagePreview src={src} key={src} index={i} remover={remover}/>);
        return <div>{children}</div>;
    }
};
