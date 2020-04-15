import { Parameter, Worksheet } from '@tableau/extensions-api-types';
import React, { useEffect, useState } from 'react';
import { debug, HierType, SelectedParameters, SelectedWorksheet, HierarchyProps } from '../config/Interfaces';
import Hierarchy from './Hierarchy';
import { HierarchyState } from '../API/HierarchyAPI';
import * as t from '@tableau/extensions-api-types';

interface Props {
    data: HierarchyProps;
    dashboard: t.Dashboard;
}

function ParamHandler(props: Props) {
    const [lastUpdated, setLastUpdated]=useState<Date>(new Date());
    const [currentId, setCurrentId]=useState<string>('');
    const [currentLabel, setCurrentLabel]=useState<string>('');
    const [dataFromExtension, setDataFromExtension]=useState<any>();
    const _temporaryEventHandlers: { childId?: () => {}, childLabel?: () => {}; }={}; // not using useState here because state was having trouble holding functions and executing them later

    
    // will be called with user selects new value in hierarchy
    // this is set by child Hierarchy component
    useEffect(() => {
        if(props.data.configComplete) {
            if(debug) { console.log(`SETPARAMDATAFROMEXTENSION: ${ JSON.stringify(dataFromExtension) }`); }
            if(typeof (dataFromExtension)!=='undefined') {
                setParamDataFromExtension(dataFromExtension);
            }
        }
    }, [dataFromExtension]);

    // any time configure is completed (aka lastUpdated is changed) find new params and reset filter/marks    
    useEffect(() => {
        async function clear() {
            // if data changes, clear event handlers
            if(debug) { console.log(`clearing events/filters/marks...`); }
            await clearFilterAndMarksAsync();
            if(debug) { console.log(`done clearing events/filters/marks...`); }
            setLastUpdated(new Date());
        }
        if(props.data.configComplete) { clear(); }

    }, [props.data]);

    // if any of the parameters change via configure, (re)set event listeners
    useEffect(() => {
        if(props.data.configComplete) { setEventListeners(); }
        return () => {
            async function run() {
                clearEventHandlers();
                await clearFilterAndMarksAsync();
            }
            run();
        };
    }, [props.data.parameters.childId, props.data.parameters.childIdEnabled, props.data.parameters.childLabel, props.data.parameters.childLabelEnabled]);

    // solve forEach with promise issue - https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    async function asyncForEach(array: any[], callback: any) {
        for(let index=0;index<array.length;index++) {
            await callback(array[index], index, array);
        }
    };

    // finds the worksheet in the dashboard that matches the user selected worksheet
    // returns the worksheet
    async function findWorksheet(): Promise<t.Worksheet|undefined> {
        console.log(`findWorksheet: props.data.worksheet: ${ props.data.worksheet.name }`);
        let ws: Worksheet|undefined;
         if(props.data.worksheet.name !== '') {
            await asyncForEach(props.dashboard.worksheets, (currWorksheet: t.Worksheet) => {
                if(currWorksheet.name===props.data.worksheet.name) {
                    if(debug) {
                        console.log(`fW: found worksheet : ${ currWorksheet.name }`);
                        console.log(currWorksheet);
                    }
                    ws = currWorksheet;
                }
            });

        } 
        // return ws;
        if(debug && typeof ws === 'undefined') { console.log(`fW: No worksheets found that match ${ props.data.worksheet.name }`); }
        return ws;
    }

    // find parameters, if enabled, and returns an array 
    // [childIdParam, childLabelParam] for recursive
    // OR [level, childid, childlabel, field1, field2, field3, ...] for flat
    async function findParameters() {
        if(debug) {
            console.log(`fp: parameters`);
            console.log(props.data.parameters);
        }
        const res: any=[];
        if(props.data.worksheet.name!=='') {
            console.log(`1`);

            if(props.data.type===HierType.RECURSIVE) {

                // RECURSIVE
                 if(props.data.parameters.childIdEnabled) {
                    res[0]=await props.dashboard.findParameterAsync(props.data.parameters.childId);
                }
                if(props.data.parameters.childLabelEnabled) {
                    res[1]=await props.dashboard.findParameterAsync(props.data.parameters.childLabel);
                } 
            }

            else if(props.data.type===HierType.FLAT) {
                res[0]=await props.dashboard.findParameterAsync(`Level${ props.data.paramSuffix }`);
                res[1]=await props.dashboard.findParameterAsync(`${ props.data.worksheet.childId }${ props.data.paramSuffix }`);
                console.log(`childLabel enabled (${props.data.parameters.childLabelEnabled}) and looking for param -- ${ props.data.parameters.childLabel }`)
                if(props.data.parameters.childLabelEnabled) {
                    res[2]=await props.dashboard.findParameterAsync(`${ props.data.parameters.childLabel }`);
                    console.log(`found childLabel: ${res[2]}`)
                }
                for(let i=0;i<props.data.worksheet.fields.length;i++) {
                    // todo: turn into promise.all
                    const param=`${ props.data.worksheet.fields[i] }${ props.data.paramSuffix }`;
                    console.log(`looking for param ${ param }`);
                    res[i+3]=await props.dashboard.findParameterAsync(param);
                    console.log(res[i+3]);
                }
            }
        }
        if(debug) {
            console.log(`fP: returning...VVV`);
            console.log(res);
        }
        return res;

    }

    // sets event listeners so they can be called later and released
    async function setEventListeners() {
        if(props.data.type===HierType.FLAT) { return; }
        const [childIdParam, childLabelParam]:t.Parameter[]=await (findParameters());
        if(props.data.parameters.childIdEnabled||props.data.parameters.childLabelEnabled) {
            clearEventHandlers(); // just in case.
            if(debug) { console.log(`setEventHandleListeners`); }
            if(debug) { console.log(`setting event handle listeners`); }
            if(childLabelParam) {
                _temporaryEventHandlers.childLabel=childLabelParam.addEventListener(tableau.TableauEventType.ParameterChanged, eventDashboardChangeLabel);
            }
            if(childIdParam) {
                _temporaryEventHandlers.childId=childIdParam.addEventListener(tableau.TableauEventType.ParameterChanged, eventDashboardChangeId);
            }
            if (debug) {console.log(`done setting event handle listeners`)}
        }
        else {
            if(debug) { console.log(`skipping set event handlers because neither param is enabled.`); }
        }
    }

    // clear any event handlers that have been set
    function clearEventHandlers() {
        if(props.data.type===HierType.FLAT) { return; }
        if(debug) { console.log(`clearing event handle listeners`); }
        // Object.keys(_temporaryEventHandlers).forEach(function(fn){ fn()});
        // _temporaryEventHandlers=[];
        if(_temporaryEventHandlers.childId) {
            _temporaryEventHandlers.childId();
            _temporaryEventHandlers.childId=undefined;
        }
        if(_temporaryEventHandlers.childLabel) {
            _temporaryEventHandlers.childLabel();
            _temporaryEventHandlers.childLabel=undefined;
        }
    }

    // clear and filter and marks
    // used when we return from the configure dialogue or the extension is loaded for the first time
    async function clearFilterAndMarksAsync() {
        if(debug) { console.log(`begin clearFilterAndMarksAsync`); }
        try {
            const worksheet=await findWorksheet();
            if(typeof worksheet==='undefined') { return; }
            // await asyncForEach(props.dashboard.worksheets, async (worksheet: Worksheet) => {
            if(props.data.worksheet.filterEnabled) {
                if(debug) { console.log(`clearing filter props.data.worksheet.filter: ${ props.data.worksheet.filter }`); }

                await worksheet.clearFilterAsync(props.data.worksheet.filter);
            }
            if(debug) { console.log(`worksheet: ${ props.data.worksheet.name } for childId: ${ props.data.worksheet.childId }`); }
            // clear all marks selection
            if(props.data.worksheet.childId!==null||props.data.worksheet.childId!=='') {
                await worksheet.selectMarksByValueAsync([{
                    fieldName: props.data.worksheet.childId,
                    value: []
                }], tableau.SelectionUpdateType.Replace);
            }
        }

        catch(err) {
            console.error(err);
            console.log(`state.props`);
            console.log(props);
        }
        if(debug) { console.log(`finished clearFilterAndMarksAsync`); }
    }

    // if there is an event change on the dashboard 
    // then send the updated value to the hierarchy for evaluation
    async function eventDashboardChangeId() {
        // retrieve param so we get the latest value
        const cp=await props.dashboard.findParameterAsync(props.data.parameters.childId);
        setCurrentId(cp!.currentValue.value||'');

    };
    async function eventDashboardChangeLabel() {
        const cl=await props.dashboard.findParameterAsync(props.data.parameters.childLabel);
        setCurrentLabel(cl!.currentValue.value||'');
    };

    async function setParamDataFromExtension(incomingData: { currentId: string, currentLabel: string, childrenById?: string[], childrenByLabel?: string[]; }) {

        // childIdParam, childLabelParam for HierType.RECURSIVE
        // childIdParam, field1 param, field2 param... fieldn param
        setCurrentId(incomingData.currentId);
        setCurrentLabel(incomingData.currentLabel);

        // setState({
        //     uiDisabled: true
        // });

        function escapeRegex(value: string) {
            return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
        }

        if(props.data.type===HierType.FLAT) {
            const [levelParam, childIdParam, childLabelParam, ...fieldParams]: Parameter[]=await (findParameters());
            const level=(incomingData.currentId.match(new RegExp(escapeRegex(props.data.separator), 'g'))?.length||0)+1;
            try {
                levelParam.changeValueAsync(level);
            }
            catch(e) {
                if(debug) { console.log(`can't set level param: ${ e.message }`); }
            }
            try {
                childIdParam.changeValueAsync(incomingData.currentId);
            }
            catch(e) {
                if(debug) { console.log(`can't set childId param: ${ e.message }`); }
            }
            try {
                childLabelParam.changeValueAsync(incomingData.currentLabel);
            }
            catch(e) {

                if(debug) { console.log(`can't set childLabel param: ${ e.message }`); }
            }
            const fieldVals=incomingData.currentId.split(props.data.separator);
            for(let i=0;i<props.data.worksheet.fields.length;i++) {
                try {
                    if(typeof fieldParams[i]==='undefined') { continue; }
                    fieldParams[i].changeValueAsync(fieldVals[i]||'Null');
                }
                catch(e) {
                    console.error(`cannot set param for field ${ props.data.worksheet.fields[i] } (param should be ${ props.data.worksheet.fields[i] } Param) with value ${ fieldVals[i] }`);
                }
            }
        }
        else {
            const [childIdParam, childLabelParam]=await (findParameters());
            if(debug) { console.log(`setting Param Data: currentId: ${ incomingData.currentId }; currentLabel: ${ incomingData.currentLabel }, boolean? props.data.parameters.childIdEnabled&&childIdParam: ${ props.data.parameters.childIdEnabled&&childIdParam }`); }
            clearEventHandlers();
            if(props.data.parameters.childIdEnabled&&childIdParam) {
                await childIdParam.changeValueAsync(incomingData.currentId);
            }
            if(props.data.parameters.childLabelEnabled&&childLabelParam) {
                await childLabelParam.changeValueAsync(incomingData.currentLabel);
            }
        }

        // if we don't pass children, we are resetting the data 
        // and should skip setting the filter/mark selection
        if(incomingData.childrenById&&incomingData.childrenByLabel) {
            const worksheet=await findWorksheet();
            if(typeof worksheet==='undefined') { return; }
            if(props.data.worksheet.filterEnabled) {
                // determine if the current filter is based off Id or Label
                const replaceArr=props.data.worksheet.filter===props.data.worksheet.childId? incomingData.childrenById:incomingData.childrenByLabel;

                if(debug) { console.log(`replacing filter (${ props.data.worksheet.filter }) with values ${ JSON.stringify(replaceArr) }`); }
                await worksheet.applyFilterAsync(props.data.worksheet.filter, replaceArr, tableau.FilterUpdateType.Replace, { isExcludeMode: false });
            }

            console.log(`props vvvV`);
            console.log(props);
            if(props.data.worksheet.enableMarkSelection) {
                {
                    await worksheet.selectMarksByValueAsync([{
                        fieldName: props.data.worksheet.childId,
                        value: incomingData.childrenById
                    }], tableau.SelectionUpdateType.Replace);
                }
            }
            // _hn.setState({
            //     uiDisabled: false
            // }); 
        }
        setEventListeners();
    }


    return (
        <Hierarchy
            data={props.data}
            lastUpdated={lastUpdated}
            setDataFromExtension={setDataFromExtension}
            currentLabel={currentLabel}
            currentId={currentId}
        />
    );
}


export default ParamHandler;