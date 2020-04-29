import { Button, ButtonProps, DropdownSelect, DropdownSelectProps } from '@tableau/tableau-ui';
import * as React from 'react';
import '../../css/style.css';
import {Status} from '../API/Interfaces';
import {withHTMLSpaces} from '../API/Utils';
export interface SelectorProps {
    title?: string;
    status?: Status;
    list: string[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onClick?: () => void;
    selected?: string;  
    type?: string
}

// Shows if setting has not yet been configured
// tslint:disable-next-line variable-name
export const Selector: React.SFC<SelectorProps> = (props) => {
    const dropdownSelectProps: DropdownSelectProps = {
        className: 'dropdown-select w-100',
        disabled: props.status!==Status.set,
        kind: 'line',
        onChange: props.onChange,
        onSelect: props.onChange,
        value: withHTMLSpaces(props.selected),
    };
    const buttonProps: ButtonProps = {
        disabled: props.status !== Status.set,
        kind: 'filledGreen',
        onClick: props.onClick,
        style: { marginLeft: '12px' },
    };
    const showButton = ():React.ReactFragment => {
        if (typeof props.onClick === 'function'){
            return (<Button {...buttonProps}>Set</Button>);
        }
        else {
            return (<div />)
        }
    }

    
    if (props.status === Status.hidden){
        return (< div/>)
    }
    else {
    return (
        <div className='labelStyle d-flex flex-column'>
            {props.title}
                <div className='p-2 w-100'>
                    <DropdownSelect 
                        {...dropdownSelectProps} className='w-100'
                        data-type={props.type}>
                        {props.list.map(option => <option key={option} value={option}>{withHTMLSpaces(option)}</option>)}
                        
                    </DropdownSelect>
                </div>
                <div className='p-2 flex-shrink-1'>
                    {showButton()}
                </div>
            
        </div>
    );
    }
};