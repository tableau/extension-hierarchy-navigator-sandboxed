// import {  DataType } from '@tableau/extensions-api-types/ExternalContract/Namespaces/Tableau';
import { Checkbox, TextField } from '@tableau/tableau-ui';
import React, { useEffect, useState } from 'react';
import { Selector } from '../shared/Selector';
import { debug, HierarchyProps, Status } from './Interfaces';
import { inspect } from 'util';

const extend=require('extend');

interface Props {
    data: HierarchyProps;
    setUpdates: (obj: { type: string, data: any; }) => void;
    changeEnabled: (s: React.MouseEvent<HTMLInputElement, MouseEvent>|React.ChangeEvent<HTMLInputElement>) => void;
    changeParam: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function Page3Flat(props: Props) {
    const [flatFieldsForChildLabel, setFlatFieldsForChildLabel]=useState<string[]>([]);
    const [generatedParams, setGeneratedParams]=useState<string[]>([]);
    const [levelParam, setLevelParam]=useState<boolean>(false);
    const [filterList, setFilterList]=useState<string[]>([]);
    // for flat hier; this is the list of params that are auto-generated
    useEffect(() => {
        const p: string[]=[];
        p.push(`Level ${ props.data.paramSuffix }`);
        p.push(`${ props.data.worksheet.childId }${ props.data.paramSuffix }`);
        for(const field of props.data.worksheet.fields) {
            p.push(`${ field }${ props.data.paramSuffix }`);
        }
        setGeneratedParams(p);

        const _flatFields: string[]=[];
        props.data.dashboardItems.parameters.forEach(param => {
            if(!p.includes(param)) { _flatFields.push(param); }
        });
        setFlatFieldsForChildLabel(_flatFields);
        if(props.data.parameters.childLabel==='') { props.setUpdates({ type: 'SETCHILDLABELPARAMETER', data: _flatFields[0] }); }
    }, [props.data.dashboardItems.parameters, props.data]);

    useEffect(() => {
        if(debug) { console.log(`checking if Level${ props.data.paramSuffix } is a viable numeric parameter`); }
    }, []);

    useEffect(() => {
        const { filters }=props.data.dashboardItems.allCurrentWorksheetItems;
        const res=filters.filter(filter => {
            return (filter===props.data.worksheet.childId);
        });
        console.log(`SETTING FILTER(s) ${res.join(', ')} from ${filters.join(', ')}`)
        setFilterList(res);

    }, [props.data.worksheet.childId, props.data.dashboardItems.allCurrentWorksheetItems.filters]);


    // Is there a parameter that exists that matches the name/type?
    // This is used on Page3Flat to check if the Level parameter of type int is present
    // String parameters are the only one stored hence the need for an additional check
    useEffect(() => {

        const check=async () => {
            await window.tableau.extensions.dashboardContent!.dashboard.getParametersAsync()
                .then(params => {

                    if(debug) { console.log(`parameters found`); }
                    for(const p of params) {
                        if(debug) { console.log(p); }
                        if(p.dataType==='int'&&p.name===`Level${ props.data.paramSuffix }`) {
                            console.log(`matching ${ p.dataType } & ${ p.name }. Returning true`);
                            return setLevelParam(true);
                        }
                    }
                    console.log(`no match; returning false`);
                    setLevelParam(false);
                });
        };
        check();

    }, [props.data.paramSuffix]);

    const inputProps={
        errorMessage: undefined,
        kind: 'line' as 'line'|'outline'|'search',
        label: `Suffix for all Parameters.`,
        onChange: (e: any) => {
            props.setUpdates({ type: 'SETPARAMSUFFIX', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SETPARAMSUFFIX', data: ' Param' });
        },
        style: { width: 200, paddingLeft: '9px' },
        value: props.data.paramSuffix,
    };
    // const changeFilter=(e: React.ChangeEvent<HTMLSelectElement>): void => {
    //     props.setUpdates({ type: 'SETFILTERFIELD', data: e.target.value });
    // };
    const yes=(<span style={{ color: 'green', marginRight: '0.5em' }}>✔</span>);
    const no=(<span style={{ marginRight: '0.5em' }}>⚠️</span>);

    const idPresent=() => {
        return props.data.dashboardItems.parameters.includes(`${ props.data.worksheet.childId }${ props.data.paramSuffix }`)? yes:no;
    };
    const labelPresent=() => {
        return props.data.dashboardItems.parameters.includes(`${ props.data.parameters.childLabel }`)? yes:no;
    };
    const paramPresent=(field: string) => {
        const fullField = `${field}${ props.data.paramSuffix }`;
        console.log(`paramPresent for field: ${ field }${ props.data.paramSuffix }?  ${props.data.dashboardItems.parameters.includes(fullField)}`);
        console.log(`${props.data.dashboardItems.parameters.join(', ')}`)
        return props.data.dashboardItems.parameters.includes(`${ field }${ props.data.paramSuffix }`)? yes:no;
    };

    // PARAMETERS CONTENT
    return (
        <>
            <div className='sectionStyle mb-2'>
                <b>Parameters</b>
                <br />
                <div style={{ marginLeft: '9px' }}>
                    <TextField {...inputProps} />
                    <br />
                    <Checkbox
                        disabled={!flatFieldsForChildLabel.length}
                        checked={props.data.parameters.childLabelEnabled}
                        onClick={props.changeEnabled}
                        onChange={props.changeEnabled}
                        data-type='label'
                    >
                        Parameter for Child Label Field
        </Checkbox>
                    <br />
                    <Selector
                        // For label field'
                        status={props.data.parameters.childLabelEnabled?
                            (props.data.dashboardItems.parameters.length? Status.set:Status.notpossible):Status.notpossible}
                        onChange={props.changeParam}
                        list={flatFieldsForChildLabel}
                        selected={props.data.parameters.childLabel}
                        type='label'
                    />

            This Extension will attempt to set the following parameters for metadata:
            <br />

                    <ul>
                        <li style={{ listStyleType: 'none', marginLeft: '-1.2em' }}>{levelParam? yes:no} [Level{props.data.paramSuffix}]: Current level of selected item in the hierarchy (1..n)</li>


                        <li style={{ listStyleType: 'none', marginLeft: '-1.2em' }}>{idPresent()} {`[${ props.data.worksheet.childId }${ props.data.paramSuffix }]`}: ID of the current selected field </li>


                        {props.data.parameters.childLabelEnabled? (<li style={{ listStyleType: 'none', marginLeft: '-1.2em' }}>{labelPresent()} {`[${ props.data.parameters.childLabel }]`}: Label of the current selected field</li>):<></>}
                    </ul>
                And parameters for the fields in the hierarchy:
            <ul>
                        {props.data.worksheet.fields.map((field) => {
                            return <li style={{ listStyleType: 'none', marginLeft: '-1.2em' }} key={field+'_item'}>{paramPresent(field)} {`[${ field }${ props.data.paramSuffix }]`}: Value of field or Null</li>;
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
                        onClick={props.changeEnabled}
                        data-type='filter'
                    >Filter {!filterList.length? ` (to enable, add a filter on ID field on the source sheet)`:` for ${ props.data.worksheet.filter }`}
                    </Checkbox>
                    <br />
                    {/* <div style={props.data.dashboardItems.allCurrentWorksheetItems.filters.length>0? {}:{ display: 'none' }}>
                        <Selector
                            status={filterStatus()? Status.set:Status.notpossible}
                            onChange={changeFilter}
                            list={filterList()}
                            selected={props.data.worksheet.filter}
                            type='filter'
                        />
                        </div> */}
                    <Checkbox
                        checked={props.data.worksheet.enableMarkSelection}
                        onClick={props.changeEnabled}
                        data-type='mark'
                    >Enable Mark Selection
                </Checkbox>
            </div>
        </>
    );
}