import { Button, Checkbox } from '@tableau/tableau-ui';
import React, { useState } from 'react';
import { Selector } from '../shared/Selector';
import { AvailableProps, SelectedProps, HierType, Status, FilterType } from './Interfaces';

interface Props {
    selectedProps: SelectedProps;
    fieldArr: string[];
    availableProps: AvailableProps;
    debug: boolean;
    paramArr: string[];
    filterArr: string[];
    worksheetStatus: Status;
    changeEnabled: (obj1: any) => void;
    changeParam: (obj1: any) => void;
    changeFilter: (obj1: any) => void;
}

export function Page3(props: Props) {

    const filterDisabled=() => {
        return props.filterArr.length&&props.filterArr.filter((filter) => {
            const selFields=[props.selectedProps.worksheet.childId.fieldName, props.selectedProps.worksheet.childLabel.fieldName];
            return selFields.includes(filter);
        }).length? false:true;
    };

    // PARAMETERS CONTENT
    return (
        <>
            <div className='sectionStyle mb-2'>
                <b>Parameters</b>
                <br />
                <div style={{ marginLeft: '9px' }}>
                    <Checkbox
                        disabled={!props.paramArr.length}
                        checked={props.selectedProps.parameters.childIdEnabled}
                        onClick={props.changeEnabled}
                        data-type='id'
                    >{props.selectedProps.type===HierType.FLAT? `Parameter for Id Field`:`Parameter for Child Id Field`}
                    </Checkbox>
                    <Selector
                        status={props.selectedProps.parameters.childIdEnabled? (props.paramArr.length? Status.set:Status.notpossible):Status.notpossible}
                        onChange={props.changeParam}
                        list={props.paramArr}
                        selected={props.selectedProps.parameters.childId.name}
                        type='id'
                    />
                    <Checkbox
                        disabled={!props.paramArr.length}
                        checked={props.selectedProps.parameters.childLabelEnabled}
                        onClick={props.changeEnabled}
                        onChange={props.changeEnabled}
                        data-type='label'
                    >
                        {props.selectedProps.type===HierType.FLAT? `Parameter for Label Field`:`Parameter for Child Label Field`}
                    </Checkbox>
                    <Selector
                        // For label field'
                        status={props.selectedProps.parameters.childLabelEnabled?
                            (props.paramArr.length? Status.set:Status.notpossible):Status.notpossible}
                        onChange={props.changeParam}
                        list={props.paramArr}
                        selected={props.selectedProps.parameters.childLabel.name}
                        type='label'
                    />
                </div>
            </div>
            <div className='sectionStyle mb-2'>
                <b>Sheet Interactions</b>
                <div style={{ marginLeft: '9px' }}>
                    <Checkbox
                        // for filter field
                        disabled={filterDisabled()}
                        checked={props.selectedProps.worksheet.filterEnabled}
                        onClick={props.changeEnabled}
                        data-type='filter'
                    >Filter {!props.filterArr.length? ` (to enable, add a filter on ID field of the source sheet)`:''}
                    </Checkbox>
                    <br />
                    <div style={props.filterArr.length? {}:{ display: 'none' }}>
                            status={props.filterArr.length&&props.filterArr.filter((filter) => {
                            const selFields=[props.selectedProps.worksheet.childId.fieldName, props.selectedProps.worksheet.childLabel.fieldName];
                            return selFields.includes(filter);
                        }).length&&props.selectedProps.worksheet.filterEnabled? Status.set:Status.notpossible}
                            onChange={props.changeFilter}
                            list={props.filterArr.filter((filter) => {
                            const selFields=[props.selectedProps.worksheet.childId.fieldName, props.selectedProps.worksheet.childLabel.fieldName];
                            if(props.debug) { console.log(`selFields: ${ selFields } and filter: ${ filter }`); }
                            if(props.debug) { console.log(`selFields.includes(filter): ${ selFields.includes(filter) }`); }
                            return selFields.includes(filter);
                        })}
                            selected={props.selectedProps.worksheet.filter.fieldName}
                            type='filter'
                        />
                        </div>
                    <Checkbox
                        checked={props.selectedProps.worksheet.enableMarkSelection}
                        onClick={props.changeEnabled}
                        data-type='mark'
                    >Enable Mark Selection
                </Checkbox>
                </div>
            </div>
        </>
    );
}