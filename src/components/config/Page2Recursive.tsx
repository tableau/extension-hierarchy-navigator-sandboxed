import React from 'react';
import { Selector } from '../shared/Selector';
import { HierarchyProps, Status } from '../API/Interfaces';

interface Props {
    data: HierarchyProps;
    setUpdates: (obj: { type: string, data: any; }) => void;
    setCurrentWorksheetName: (s: string) => void;
}
export function Page2Recursive(props: Props) {

    const worksheetTitle=() => {
        switch(props.data.worksheet.status) {
            case Status.notpossible:
                return 'No valid sheets on the dashboard';
            case Status.set:
            case Status.notset:
                return 'Select the sheet with the hierarchy data';
            default:
                return '';
        }
    };

    // Handles selection of the parentid field
    const setParent=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        props.setUpdates({ type: 'SET_PARENT_ID_FIELD', data: e.target.value });
    };

    // Handles selection in worksheet selection dropdown
    const worksheetChange=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        props.setCurrentWorksheetName(e.target.value);
    };

    const setChild=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        props.setUpdates({ type: 'SET_CHILD_ID_FIELD', data: e.target.value });
    };

    // Handles selection of the label field
    const setChildLabel=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        props.setUpdates({ type: 'SET_CHILD_LABEL_FIELD', data: e.target.value });
    };

    return (
        <div className='sectionStyle mb-5'>
            <b>Worksheet and Fields</b>
            <p />
            <Selector
                title={worksheetTitle()}
                status={props.data.worksheet.status}
                selected={props.data.worksheet.name}
                list={props.data.dashboardItems.worksheets}
                onChange={worksheetChange}
            />
            <Selector
                title='Parent ID'
                status={props.data.worksheet.status!==Status.set? Status.hidden:props.data.worksheet.status}
                list={props.data.dashboardItems.allCurrentWorksheetItems.fields}
                onChange={setParent}
                selected={props.data.worksheet.parentId}
            />
            <Selector
                title='Child ID'
                status={props.data.worksheet.status!==Status.set? Status.hidden:props.data.worksheet.status}
                list={props.data.dashboardItems.allCurrentWorksheetItems.fields}
                onChange={setChild}
                selected={props.data.worksheet.childId}
            />
            <Selector
                title='Child label'
                status={props.data.worksheet.status!==Status.set? Status.hidden:props.data.worksheet.status}
                list={props.data.dashboardItems.allCurrentWorksheetItems.fields}
                onChange={setChildLabel}
                selected={props.data.worksheet.childLabel}
            />
        </div>
    );


}