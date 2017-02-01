import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import classNames from 'classnames';

import css from '../../styles/modules/ajax-indicator.css';

export default inject('ui')(observer(
    ({ui: {isLoading, isBlocking}}) => {
        const className = classNames({
            [css.box]: true,
            [css.visible]: isLoading,
            [css.blocked]: isBlocking
        });
        return (
            <div className={className}>
                <div className={css.indicator}>
                    <div className={css.animation}></div>
                </div>
            </div>
        );
    }
));
