import { Button, ButtonProps, DropdownSelect, DropdownSelectProps } from '@tableau/tableau-ui';
import * as React from 'react';
import '../../css/style.css';
import {Status} from '../config/Config';

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
export const Selector: React.SFC<SelectorProps> = (props) => {
    const dropdownSelectProps: DropdownSelectProps = {
        className: 'dropdown-select w-100',
        disabled: props.status === Status.notpossible,
        kind: 'line',
        onChange: props.onChange,
        onSelect: props.onChange,
        value: props.selected,
    };
    const labelStyle = {
        font:'Benton Sans Light',
        fontSize: '10px',
        margin: 'auto', 
        opacity: .8,
        padding: '1px 0px 0px 0px',
    }
    const showButton = ():React.ReactFragment => {
        if (typeof props.onClick === 'function'){
            return (<Button {...buttonProps}>Set</Button>);
        }
        else {
            return (<div />)
        }
    }

    const buttonProps: ButtonProps = {
        disabled: props.status === Status.notpossible,
        kind: 'filledGreen',
        onClick: props.onClick,
        style: { marginLeft: '12px' },
    };
    
    if (props.status === Status.hidden){
        return (< div/>)
    }
    else {
    return (
        <div className='labelStyle d-flex flex-column'>
            {props.title}
                <div className='p-2 w-100'>
                    <DropdownSelect 
                        {...dropdownSelectProps} className='dropdownStyle w-100'
                        data-type={props.type}>
                        {props.list.map(option => <option key={option}>{option}</option>)}
                        
                    </DropdownSelect>
                </div>
                <div className='p-2 flex-shrink-1'>
                    {showButton()}
                </div>
            
        </div>
    );
    }
};