import { Checkbox } from '@tableau/tableau-ui';
import React, { useEffect, useState } from 'react';

import { Selector } from '../shared/Selector';
import { debug, HierarchyProps, Status } from './Interfaces';

interface Props {
    data: HierarchyProps
    setUpdates: (obj: { type: string, data: any; }) => void;
    changeEnabled: (s: React.MouseEvent<HTMLInputElement, MouseEvent> | React.ChangeEvent<HTMLInputElement>) => void
    changeParam: (e: React.ChangeEvent<HTMLSelectElement>)=>void

}

export function Page3Recursive(props: Props) {
    const [filterList, setFilterList]=useState<string[]>([]);

    useEffect(() => {
        const { filters }=props.data.dashboardItems.allCurrentWorksheetItems;
        const res=filters.filter(filter => {
            return (filter===props.data.worksheet.childId || filter===props.data.worksheet.childLabel);
        });
        console.log(`SETTING FILTER(s) ${res.join(', ')} from ${filters.join(', ')}`)
        setFilterList(res);

    }, [props.data.worksheet.childId, props.data.dashboardItems.allCurrentWorksheetItems.filters]);

    const changeFilter=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        props.setUpdates({type: 'SETFILTERFIELD', data: e.target.value})
     };


    // PARAMETERS CONTENT
    return (
        <>
            <div className='sectionStyle mb-2'>
                <b>Parameters</b>
                <br />
                <div style={{ marginLeft: '9px' }}>
                    <Checkbox
                        disabled={!props.data.dashboardItems.parameters.length}
                        checked={props.data.parameters.childIdEnabled}
                        onClick={props.changeEnabled}
                        data-type='id'
                    >Parameter for Child Id Field
        </Checkbox>
                    <Selector
                        status={props.data.parameters.childIdEnabled? (props.data.dashboardItems.parameters.length? Status.set:Status.notpossible):Status.notpossible}
                        onChange={props.changeParam}
                        list={props.data.dashboardItems.parameters}
                        selected={props.data.parameters.childId}
                        type='id'
                    />
                    <Checkbox
                        disabled={!props.data.dashboardItems.parameters.length}
                        checked={props.data.parameters.childLabelEnabled}
                        onClick={props.changeEnabled}
                        onChange={props.changeEnabled}
                        data-type='label'
                    >
                        Parameter for Child Label Field
        </Checkbox>
                    <Selector
                        // For label field'
                        status={props.data.parameters.childLabelEnabled?
                            (props.data.dashboardItems.parameters.length? Status.set:Status.notpossible):Status.notpossible}
                        onChange={props.changeParam}
                        list={props.data.dashboardItems.parameters}
                        selected={props.data.parameters.childLabel}
                        type='label'
                    />
                </div>
            </div>
            <div className='sectionStyle mb-2'>
                <b>Sheet Interactions</b>
                <div style={{ marginLeft: '9px' }}>
                    <Checkbox
                        // for filter field
                        disabled={filterList.length===0}
                        checked={props.data.worksheet.filterEnabled}
                        onClick={props.changeEnabled}
                        data-type='filter'
                    >Filter {!filterList.length? ` (to enable, add a filter on Child ID  or Child Label field on the source sheet)`:''}
                    </Checkbox>
                    <br />
                    <div style={filterList.length? {}:{ display: 'none' }}>
                        <Selector
                        status={filterList.length>0?Status.set:Status.notset}
                            onChange={changeFilter}
                            list={filterList}
                            selected={props.data.worksheet.filter}
                            type='filter'
                        />
                        </div>
                    <Checkbox
                        checked={props.data.worksheet.enableMarkSelection}
                        onClick={props.changeEnabled}
                        data-type='mark'
                    >Enable Mark Selection
                </Checkbox>
                </div>
            </div>
        </>
    );
}