import * as React from 'react';
import { Selected } from '../shared/Selected';
import { Selector } from '../shared/Selector';
import { Status }  from '../API/Interfaces';

interface SettingProps {
    status: Status;
    title?: string;
    // isSet: boolean;
    // isVisible: boolean;
    list: string[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onClear?: () => void;
    onClick?: () => void;
    selected: string;
}
export const Setting: React.SFC<SettingProps> = (props) => {

    const { list, onChange, onClear, onClick, selected, title, status } = props;

    const renderSelectElement = status === Status.set ? <Selected onClear={onClear} selected={selected} /> : status === Status.notset ?
            <Selector status={status} list={list} onChange={onChange} onClick={onClick} selected={selected} title={title} /> : title;
    return (
        <React.Fragment>

            <div>
                {renderSelectElement}
            </div>
        </React.Fragment>
    );
};

Setting.displayName = 'Setting';