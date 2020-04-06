
import React, { useState, useEffect } from 'react';
import { Selector } from '../shared/Selector';
import { AvailableProps, SelectedProps, HierType, Status } from './Interfaces';

interface Props{
    selectedProps: SelectedProps;
    fieldArr: string[];
    availableProps: AvailableProps;
    debug: boolean;
    worksheetStatus: Status;
    worksheetChange: (arg0:any)=>void;
    setParent: (arg0:any)=>void
    setChild: (arg0:any)=>void
    setChildLabel: (arg0:any)=>void
}
export function Page2Recursive(props: Props) {
    // const { state }: { state: State; }=props;

    const availableWorksheetArr: string[]=[];
    for(const sheet of props.availableProps.worksheets) {
        availableWorksheetArr.push(sheet.name);
    }
    const worksheetTitle=() => {
        switch(props.worksheetStatus) {
            case Status.notpossible:
                return 'No valid sheets on the dashboard';
            case Status.set:
            case Status.notset:
                return 'Select the sheet with the hierarchy data';
            default:
                return '';
        }
    };
    
   
    return (
            <div className='sectionStyle mb-5'>
                <b>Worksheet and Fields</b>
                <p />
                <Selector
                    title={worksheetTitle()}
                    status={props.worksheetStatus}
                    selected={props.selectedProps.worksheet.name}
                    list={availableWorksheetArr}
                    onChange={props.worksheetChange}
                />
                <Selector
                    title='Parent ID'
                    status={props.worksheetStatus!==Status.set? Status.hidden:props.worksheetStatus}
                    list={props.fieldArr}
                    onChange={props.setParent}
                    selected={props.selectedProps.worksheet.parentId.fieldName}
                />
                <Selector
                    title='Child ID'
                    status={props.worksheetStatus!==Status.set? Status.hidden:props.worksheetStatus}
                    list={props.fieldArr}
                    onChange={props.setChild}
                    selected={props.selectedProps.worksheet.childId.fieldName}
                />
                <Selector
                    title='Child label'
                    status={props.worksheetStatus!==Status.set? Status.hidden:props.worksheetStatus}
                    list={props.fieldArr}
                    onChange={props.setChildLabel}
                    selected={props.selectedProps.worksheet.childLabel.fieldName}
                />
            </div>
    );


}