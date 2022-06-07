// import {  DataType } from '@tableau/extensions-api-types/ExternalContract/Namespaces/Tableau';
import { Checkbox, TextField, TextFieldProps } from '@tableau/tableau-ui';
import { InputAttrs } from '@tableau/tableau-ui/lib/src/utils/NativeProps';
import React, { useEffect, useState } from 'react';
import { debugOverride, HierarchyProps, Status } from '../API/Interfaces';
import { withHTMLSpaces } from '../API/Utils';
import { Selector } from '../shared/Selector';

interface Props {
    data: HierarchyProps;
    setUpdates: (obj: { type: string, data: any; }) => void;
    changeEnabled: (s: React.MouseEvent<HTMLInputElement, MouseEvent>|React.ChangeEvent<HTMLInputElement>) => void;
    changeParam: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onClear?: () => void;
}

export function Page3Flat(props: Props) {
    const [levelParam, setLevelParam]=useState<boolean>(false);
    const [filterList, setFilterList]=useState<string[]>([]);
    const {debug=false||debugOverride} = props.data.options;
    // check level param upon page load
    useEffect(() => {
        if(debug) { console.log(`checking if ${props.data.parameters.level} is a viable numeric parameter`); }
        checkLevelParam();

        // legacy... to upgrade to new parameters format
        if (props.data.parameters.fields.length !== props.data.worksheet.fields.length){
            props.setUpdates({type: 'SET_FIELDS', data: props.data.worksheet.fields});
        }
    }, []);

    // set the available filter that matches the childId field
    useEffect(() => {
        const { filters }=props.data.dashboardItems.allCurrentWorksheetItems;
        const res=filters.filter(filter => {
            return (filter===props.data.worksheet.childId);
        });
        if (res.length && props.data.worksheet.filter !== res[0]) {props.setUpdates({type: 'SET_FILTER_FIELD', data: res[0]})};
        setFilterList(res);

    }, [props.data.worksheet.childId, props.data.dashboardItems.allCurrentWorksheetItems.filters]);

    // Is there a parameter that exists that matches the name/type?
    // This is used on Page3Flat to check if the Level parameter of type int is present
    // String parameters are the only one stored hence the need for an additional check
    useEffect(() => {
        checkLevelParam();
    }, [props.data.paramSuffix]);

    // function to set the 
    const checkLevelParam = () => {
        const check=async () => {
            await window.tableau.extensions.dashboardContent!.dashboard.getParametersAsync()
                .then(params => {

                    if(debug) { console.log(`parameters found`); }
                    for(const p of params) {
                        if(debug) { console.log(p); }
                        if(p.dataType==='int'&&p.name===props.data.parameters.level ) {
                            return setLevelParam(true);
                        }
                    }
                    setLevelParam(false);
                });
        };
        check();
    }

    const inputProps: TextFieldProps & InputAttrs & React.RefAttributes<HTMLInputElement>={
        message: undefined,
        kind: 'line' as 'line'|'outline'|'search',
        label: `Suffix for all Parameters.`,
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_PARAM_SUFFiX', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SET_PARAM_SUFFiX', data: ' Param' });
        },
        style: { width: 200, paddingLeft: '9px' },
        value: props.data.paramSuffix,
    };

    const yes=(<span style={{ color: 'green', marginRight: '0.5em' }}>✔</span>);
    const no=(<span style={{ marginRight: '0.5em' }}>⚠️</span>);

    const idPresent=() => {
        return props.data.dashboardItems.parameters.includes(`${ props.data.parameters.childId }`)? yes:no;
    };
    const labelPresent=() => {
        return props.data.dashboardItems.parameters.includes(`${ props.data.parameters.childLabel }`)? yes:no;
    };
    const paramPresent=(param: string) => {
        return props.data.dashboardItems.parameters.includes(`${ param }`)? yes:no;
    };
    return (
        <>
            <div className='sectionStyle mb-2'>
                <b>Parameters</b>
                <br />
                <div style={{ marginLeft: '9px' }}>
                    <TextField {...inputProps} />
                    <br />
                    <Checkbox
                        disabled={!props.data.dashboardItems.flatParameters.length}
                        checked={props.data.parameters.childLabelEnabled}
                        onChange={props.changeEnabled}
                        data-type='label'
                    >
                        Parameter for Label (current value of any selected hierarchy member)
        </Checkbox>
                    <br />
                    <Selector
                        // For label field'
                        status={props.data.parameters.childLabelEnabled?
                            (props.data.dashboardItems.parameters.length? Status.set:Status.notpossible):Status.notpossible}
                        onChange={props.changeParam}
                        list={props.data.dashboardItems.flatParameters}
                        selected={props.data.parameters.childLabel}
                        type='label'
                    />

            This Extension will attempt to set the following parameters for metadata:
            <br />

                    <ul>
                        <li style={{ listStyleType: 'none', marginLeft: '-1.2em' }}>{levelParam? yes:no} [{props.data.parameters.level}]: Current level of selected item in the hierarchy (1..n)</li>
                        <li style={{ listStyleType: 'none', marginLeft: '-1.2em' }}>{idPresent()} {`[${ withHTMLSpaces(props.data.parameters.childId) }]`}: ID of the current selected field </li>
                        {props.data.parameters.childLabelEnabled? (<li style={{ listStyleType: 'none', marginLeft: '-1.2em' }}>{labelPresent()} {`[${ withHTMLSpaces(props.data.parameters.childLabel) }]`}: Label of the current selected field</li>):<></>}
                    </ul>
                And parameters for the fields in the hierarchy:
            <ul>
                        {props.data.parameters.fields.map((param) => {
                            return <li style={{ listStyleType: 'none', marginLeft: '-1.2em' }} key={param+'_item'} value={param}>{paramPresent(param)} {`[${withHTMLSpaces(param)}]`}: Value of field or Null</li>;
                        })}
                    </ul>
                </div>
            </div>

            <div className='sectionStyle mb-2'>
                <b>Sheet Interactions</b>
                <div style={{ marginLeft: '9px' }}>
                    <Checkbox
                        // for filter field
                        disabled={!filterList.length}
                        checked={props.data.worksheet.filterEnabled}
                        onChange={props.changeEnabled}
                        data-type='filter'
                    >Filter {!filterList.length? ` (to enable, add a filter on ID field on the source sheet)`:` for ${ props.data.worksheet.filter }`}
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={props.data.worksheet.enableMarkSelection}
                        onChange={props.changeEnabled}
                        data-type='mark'
                    >Enable Mark Selection
                </Checkbox>
                </div>
            </div>
        </>
    );
}