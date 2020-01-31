import React, { useEffect, useState } from 'react';
import { SelectedParameters, SelectedWorksheet } from '../config/Interfaces';
import Hierarchy from './Hierarchy';

interface Props {
    dashboard: any;
    parameters: SelectedParameters;
    worksheet: SelectedWorksheet;
    lastUpdated: Date;
    configComplete: boolean;
}

function ParamHandler(props: Props) {
    const debug=false;
    const [lastUpdated, setLastUpdated]=useState();
    const [currentId, setCurrentId]=useState();
    const [currentLabel, setCurrentLabel]=useState();
    const [dataFromExtension, setDataFromExtension]=useState();
    const _temporaryEventHandlers: { childId?: () => {}, childLabel?: () => {}; }={}; // not using useState here because state was having trouble holding functions and executing them later

    // will be called with user selects new value in hierarchy
    // this is set by child Hierarchy component
    useEffect(() => {
        if(props.configComplete) {
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
            if (debug){console.log(`clearing events/filters/marks...`);}
            await clearFilterAndMarksAsync();
            if(debug){console.log(`done clearing events/filters/marks...`);}
            setLastUpdated(new Date());
        }
        if(props.configComplete) { clear(); }

    }, [props.lastUpdated]);

    // if any of the parameters change via configure, (re)set event listeners
    useEffect(() => {
        if(props.configComplete) { setEventListeners(); }
        return () => {
            async function run() {
                clearEventHandlers();
                await clearFilterAndMarksAsync();
            }
            run();
        };
    }, [props.parameters.childId, props.parameters.childIdEnabled, props.parameters.childLabel, props.parameters.childLabelEnabled]);

    // solve forEach with promise issue - https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    async function asyncForEach(array: any[], callback: any) {
        for(let index=0;index<array.length;index++) {
            await callback(array[index], index, array);
        }
    };

    // finds the worksheet in the dashboard that matches the user selected worksheet
    // returns the worksheet
    async function findWorksheet(): Promise<any> {
        console.log(`findWorksheet: props.worksheet.name: ${ props.worksheet.name }`);
        let ws;
        if(props.worksheet.name) {
            await asyncForEach(props.dashboard.worksheets, async (currWorksheet: any) => {
                if(debug) { console.log(`currWorksheet`); }
                if(debug) { console.log(currWorksheet); }
                if(debug) { console.log(`props.worksheet.name: ${ props.worksheet.name }`); }
                if(currWorksheet.name===props.worksheet.name) {
                    if(debug) {
                        console.log(`found worksheet : ${ currWorksheet.name }`);
                        console.log(currWorksheet);
                    }
                    ws=currWorksheet;
                }
            });

        }
        console.log(`about to return ws:  ${ ws }`);
        return ws;
    }

    // find parameters, if enabled, and returns an array [childIdParam, childLabelParam]
    async function findParameters() {
        if(debug) {
            console.log(`fp: props.dashboard?`);
            console.log(props.dashboard);
            console.log(`fp: parameters`);
            console.log(props.parameters);
        }
        const res: any[]=[null, null];  // childId, childLabel
        if(props.dashboard) {
            console.log(`1`);
            if(props.parameters.childIdEnabled) {
                res[0]=await props.dashboard.findParameterAsync(props.parameters.childId.name);
                // console.log(`2: cp: ${ cp }`);
                // setChildIdParam(cp);
                // _childIdParam=cp;
            }
            if(props.parameters.childLabelEnabled) {
                res[1]=await props.dashboard.findParameterAsync(props.parameters.childLabel.name);
                // setChildLabelParam(cl);
                // _childLabelParam=cl;
            }
        }
        return res;

    }

    // sets event listeners so they can be called later and released
    async function setEventListeners() {
        const [childIdParam, childLabelParam]=await (findParameters());
        if(props.parameters.childIdEnabled||props.parameters.childLabelEnabled) {
            clearEventHandlers(); // just in case.
            if(debug) { console.log(`setEventHandleListeners`); }
            if(debug) { console.log(`setting event handle listeners`); }
            if(childLabelParam) {
                _temporaryEventHandlers.childLabel=childLabelParam.addEventListener(tableau.TableauEventType.ParameterChanged, eventDashboardChangeLabel);
            }
            if(childIdParam) {
                _temporaryEventHandlers.childId=childIdParam.addEventListener(tableau.TableauEventType.ParameterChanged, eventDashboardChangeId);
            }
        }
        else {
            if(debug) { console.log(`skipping set event handlers because neither param is enabled.`); }
        }
    }

    // clear any event handlers that have been set
    function clearEventHandlers() {
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
        const worksheet=await findWorksheet();
        try {
            if(worksheet) {
                if(props.worksheet.filterEnabled) {
                    if(debug) { console.log(`clearing filter props.worksheet.filter: ${ props.worksheet.filter }`); }
                    await worksheet.clearFilterAsync(props.worksheet.filter.fieldName);
                }
                if(debug) { console.log(`worksheet: ${ props.worksheet } for sheet: ${ props.worksheet.childId }`); }
                // clear all marks selection
                if(props.worksheet.childId.fieldName!==null||props.worksheet.childId.fieldName!=='') {
                    await worksheet.selectMarksByValueAsync([{
                        fieldName: props.worksheet.childId.fieldName,
                        value: []
                    }], tableau.SelectionUpdateType.Replace);
                }
            }
        }
        catch(err) {
            console.error(err);
            console.log(`state.props`);
            console.log(props);
        }

    }

    // if there is an event change on the dashboard 
    // then send the updated value to the hierarchy for evaluation
    async function eventDashboardChangeId() {
        // retrieve param so we get the latest value
        const cp=await props.dashboard.findParameterAsync(props.parameters.childId.name);
        setCurrentId(cp.currentValue.value);

    };
    async function eventDashboardChangeLabel() {
        const cl=await props.dashboard.findParameterAsync(props.parameters.childLabel.name);
        setCurrentLabel(cl.currentValue.value);
    };

    async function setParamDataFromExtension(data: { currentId: string, currentLabel: string, childrenById?: string[], childrenByLabel?: string[]; }) {
        const [childIdParam, childLabelParam]=await (findParameters());
        setCurrentId(data.currentId);
        setCurrentLabel(data.currentLabel);

        // setState({
        //     uiDisabled: true
        // });

        if(debug) { console.log(`setting Param Data: currentId: ${ data.currentId }; currentLabel: ${ data.currentLabel }, boolean? props.parameters.childIdEnabled&&childIdParam: ${ props.parameters.childIdEnabled&&childIdParam }`); }

        clearEventHandlers();
        if(props.parameters.childIdEnabled&&childIdParam) {
            console.log(`in props.parameters.childIdEnabled vvv`);
            console.log(childIdParam);
            await childIdParam.changeValueAsync(data.currentId);
        }
        if(props.parameters.childLabelEnabled&&childLabelParam) {
            await childLabelParam.changeValueAsync(data.currentLabel);
        }

        // if we don't pass children, we are resetting the data 
        // and should skip setting the filter/mark selection
        if(data.childrenById&&data.childrenByLabel) {
            const worksheet=await findWorksheet();
            if(props.worksheet.filterEnabled) {
                // determine if the current filter is based off Id or Label
                const replaceArr=props.worksheet.filter.fieldName===props.worksheet.childId.fieldName? data.childrenById:data.childrenByLabel;

                if(debug) { console.log(`replacing filter (${ props.worksheet.filter }) with values ${ JSON.stringify(replaceArr) }`); }
                await worksheet.applyFilterAsync(props.worksheet.filter.fieldName, replaceArr, tableau.FilterUpdateType.Replace);
            }

            if(props.worksheet.enableMarkSelection) {
                await worksheet.selectMarksByValueAsync([{
                    fieldName: props.worksheet.childId.fieldName,
                    value: data.childrenById
                }], tableau.SelectionUpdateType.Replace);
            }
            // _hn.setState({
            //     uiDisabled: false
            // }); 
        }
        setEventListeners();
    }

    return (
        <Hierarchy
            currentId={currentId}
            currentLabel={currentLabel}
            dashboard={props.dashboard}
            setDataFromExtension={setDataFromExtension}
            lastUpdated={lastUpdated}
            worksheet={props.worksheet}
            configComplete={props.configComplete}
        />
    );
}


export default ParamHandler;