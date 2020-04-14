import * as t from '@tableau/extensions-api-types';
import { useEffect, useReducer, useRef, useState } from 'react';

import { debug, defaultSelectedProps, HierarchyProps, HierType, Status } from '../config/Interfaces';


const extend=require('extend');

// declare global {
//     interface Window { tableau: { extensions: Extensions; }; }
// }
export interface HierarchyState {
    doneLoading: boolean;
    isError: boolean;
    isLoading: boolean;
    data: HierarchyProps;
    errorStr: string;
}
const initialData: HierarchyState={
    data: defaultSelectedProps,
    doneLoading: false,
    errorStr: '',
    isError: false,
    isLoading: false
};

const dataFetchReducer=(state: HierarchyState, action: { type: string, data?: any; }) => {
    if(debug) {
        console.log(`dataFetchReducer receivied: ${ action.type }`);
        console.log(action.data);
    }
    switch(action.type) {
        case 'FETCH_INIT':
            return {
                ...state,
                doneLoading: false,
                isError: false,
                isLoading: true,
            } as HierarchyState;
        case 'FETCH_SUCCESS':
            console.log(`FETCH_SUCCESS returning...`);
            console.log({
                ...state,
                data: action.data,
                doneLoading: true,
                isError: false,
                isLoading: false,
            });
            return {
                ...state,
                data: action.data,
                doneLoading: true,
                isError: false,
                isLoading: false,
            } as HierarchyState;
        case 'FETCH_FAILURE':
            return {
                ...state,
                doneLoading: false,
                errorStr: action.data,
                isError: true,
                isLoading: false
            } as HierarchyState;
        case 'CLEAR_ERROR':
            return {
                ...state,
                errorStr: '',
                isError: false
            };
        default:
            throw new Error(`Missing action.type ${ action.type }`);
    }
};

const hierarchyAPI=(): any => {
    const [currentWorksheetName, setCurrentWorksheetName]=useState('');
    const initAsyncLoading=useRef<boolean>(true);
    const [state, dispatch]=useReducer(dataFetchReducer, initialData);

    // if we are loading, or reset the data, re-init
    const initAsync=async (_initialData: HierarchyProps=extend(true, {}, defaultSelectedProps)) => {
        if(debug) { console.log(`begin initAsync`); }
        dispatch({ type: 'FETCH_INIT' });

        await tableau.extensions.initializeDialogAsync();

        // isConfigure is TRUE when we are in the configuration; so this logic may seem a bit
        // backwards but we only want to pass the configure object from the base extension
        /*         if(_initialData.isConfigure) {
                    await extensions.initializeAsync();
                    setConfigEventHandler(extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent: any) => {
                        if(debug) { console.log(`Tableau Event Handler: Settings Changed.`); }
                        dispatch({ type: 'FETCH_INIT' });
                        const currentData: HierarchyProps=extend(true, {}, state.data, loadSettings(settingsEvent.newSettings));
                        dispatch({ type: 'FETCH_SUCCESS', data: currentData });
                    }));
                }
                else { await extensions.initializeAsync({ configure }); }
         */
        const _settings=loadSettings();
        if(debug) {
            console.log(`loading _settings: vvv`);
            console.log(_settings);
        }
        _initialData.dashboardItems.parameters=await getParamListFromDashboardAsync();
        // validate settings
        // true means all good; false means some data didn't pass the logic
        // skip if current worksheet name is blank (initial load)
        if (typeof _settings.configComplete !== 'undefined' && _settings.configComplete) {
            extend(true, _initialData, _settings);
            _initialData=await getWorksheetsFilterAndFieldsFromDashboardAsyncWithoutAssignments(_initialData);
            const { result, msg }=validateSettings(_initialData);
            if(result) {
                console.log(`WE PASSED`);
                // return initialData as HierarchyState;
                dispatch({ type: 'FETCH_SUCCESS', data: _initialData });
            }
            else {
                console.log(`WE FAILED, ${ msg }`);
                
                getWorksheetsFilterAndFieldsFromDashboardAsyncWithAssignments(_initialData);
            }
        }
        else {
            getWorksheetsFilterAndFieldsFromDashboardAsyncWithAssignments(_initialData);
        }


        if(debug) { console.log(`finished initAsync`); }
        initAsyncLoading.current=false;
    };

    // load settings from Extension
    const loadSettings=(): any => {
        const _settings=tableau.extensions.settings.getAll();
        let res={};
        console.log(`loadSettings: raw settings = ${ _settings }`);
        if (typeof _settings.data === 'undefined'){return res;}
        res=JSON.parse(_settings.data);
        return res;
    };



    const reset=(hierType: HierType) => {
        const resetAsync=async () => {
            console.log(`begin resetAsync`);
            dispatch({ type: 'FETCH_INIT' });
            const _initialData:HierarchyProps=extend(true, {}, defaultSelectedProps);
            _initialData.type=hierType;
            _initialData.dashboardItems.parameters=await getParamListFromDashboardAsync();
            // dispatch({ type: 'FETCH_SUCCESS', data: _initialData });
            await getWorksheetsFilterAndFieldsFromDashboardAsyncWithAssignments(_initialData);
            console.log(`finished resetAsync`);
        };
        resetAsync();

    };

    // load initial extension and settings upon load
    useEffect(() => {
        initAsync();
    }, []);



    const setUpdates=(action: { type: string, data: any; }): void => {
        const payload: HierarchyProps=extend(true, {}, state.data);
        switch(action.type) {
            case 'SETPARENTIDFIELD':
                {
                    // update parentId from UI
                    // if childId = new parentId then switch values
                    if(payload.worksheet.childId===action.data) {
                        payload.worksheet.childId=payload.worksheet.parentId;
                    }
                    payload.worksheet.parentId=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SETCHILDIDFIELD':
                {
                    // update childId from UI
                    // if childId = new parentId then switch values
                    if(payload.worksheet.parentId===action.data) {
                        payload.worksheet.parentId=payload.worksheet.childId;
                    }
                    payload.worksheet.childId=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SETCHILDLABELFIELD':
                {
                    // update parentId from UI
                    payload.worksheet.childLabel=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SETCHILDIDPARAMETER':
                {
                    // update childId from UI
                    // if childId = new parentId then switch values
                    if(payload.parameters.childId===action.data) {
                        payload.parameters.childId=payload.parameters.childLabel;
                    }
                    // only string types allowed her
                    payload.parameters.childId=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SETCHILDLABELPARAMETER':
                {
                    // update childId from UI
                    // if childId = new parentId then switch values
                    if(payload.parameters.childLabel===action.data) {
                        payload.parameters.childLabel=payload.parameters.childId;
                    }
                    // only string types allowed her
                    payload.parameters.childLabel=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SETBGCOLOR':
                {
                    // update background color
                    payload.bgColor=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SETPARAMSUFFIX':
                {
                    // update parameter suffix
                    payload.paramSuffix=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SETseparator':
                {
                    // update separator
                    payload.separator=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SETFIELDS':
                {
                    // update fields for flat hierarchy
                    payload.worksheet.fields=action.data;
                    payload.configComplete=evalConfigComplete(payload);
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SETFILTERFIELD':
                {
                    // update filter name from UI
                    payload.worksheet.filter=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'TOGGLEFILTERENABLED':
                {
                    // update filter enabled/disabled from UI
                    payload.worksheet.filterEnabled=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'TOGGLEMARKSELECTIONENABLED':
                {
                    // update mark selection enabled/disabled from UI
                    payload.worksheet.enableMarkSelection=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'TOGGLEIDPARAMETERENABLED':
                {
                    // enable/disable id parameter
                    // if only 1 param or the same param is chosen for id + label  
                    if(payload.dashboardItems.parameters.length===1||
                        ((payload.parameters.childId===payload.parameters.childLabel)&&payload.parameters.childLabelEnabled)) {
                        payload.parameters.childLabelEnabled=false;
                    }
                    payload.parameters.childIdEnabled=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'TOGGLELABELPARAMETERENABLED':
                {
                    // enable/disable label parameter
                    // if only 1 param or the same param is chosen for id + label  
                    if(payload.dashboardItems.parameters.length===1||
                        ((payload.parameters.childId===payload.parameters.childLabel)&&payload.parameters.childIdEnabled)) {
                        payload.parameters.childIdEnabled=false;
                    }
                    payload.parameters.childLabelEnabled=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'CHANGE_HIER_TYPE':
                reset(action.data);
                break;
            case 'CLEAR_ERROR':
                dispatch({ type: 'CLEAR_ERROR' });
                break;
            case 'SUBMIT':
                submit();
                break;
            default:
                console.log(`No state found for ${ action.type } (action.data follows...)`);
                console.log(action.data);
        }
    };

    // this method will get the current worksheets and fields for the given worksheet.name without populating data.worksheets or data.parameters
    // it is for validating settings after getAll()
    const getWorksheetsFilterAndFieldsFromDashboardAsyncWithoutAssignments=async (_initialData: HierarchyProps) => {

        if(debug) { console.log(`getWorksheetsFilterAndFieldsFromDashboardAsyncWithoutAssignments`); }
        if(typeof tableau.extensions.dashboardContent==='undefined') { await tableau.extensions.initializeDialogAsync(); }
        try {
            setCurrentWorksheetName(_initialData.worksheet.name);
            // step 2: get current worksheet object
            await asyncForEach(tableau.extensions.dashboardContent!.dashboard.worksheets, async (worksheet: t.Worksheet) => {
                if(worksheet.name===_initialData.worksheet.name) {
                    if(debug) {
                        console.log(`worksheet: vvv`);
                        console.log(worksheet);
                    }
                    const _fields=await getWorksheetFieldsAsync(worksheet);
                    _initialData.dashboardItems.allCurrentWorksheetItems.fields=_fields;
                    _initialData.dashboardItems.allCurrentWorksheetItems.filters=[];
                    if(debug) { console.log(`filters... vvv`); }
                    const _filters=await worksheet.getFiltersAsync();
                    for(const filter of _filters) {
                        if(debug) { console.log(filter); }
                        // if filter field name is in list of available fields, add it here
                        if(debug) { console.log(`filter.filterType==='categorical'? ${ filter.filterType==='categorical' }`); }
                        if(filter.filterType==='categorical') {
                            _initialData.dashboardItems.allCurrentWorksheetItems.filters.push(filter.fieldName);
                        }
                    }
                }
                if(_initialData.dashboardItems.worksheets.indexOf(worksheet.name)===-1) { _initialData.dashboardItems.worksheets.push(worksheet.name); }

                // if filter added, assign it
                if (_initialData.worksheet.filter==='') {_initialData.worksheet.filter=_initialData.dashboardItems.allCurrentWorksheetItems.filters[0];}
            });
        }
        catch(e) {
            if(debug) { console.log(`error in getWorksheetsFromDashboardAsyncWithoutAssignment: ${ e }`); }

        }
        if(debug) { console.log(`finished getWorksheetsFromDashboardAsyncWithoutAssignment`); }
        return _initialData;
    };

    /* when Ext loads or user selects a new worksheet:
     1. change worksheet name
     2. get current worksheet object in order to
     3. set current fields
     4. set current filters
     5. set childId and childLabel and parentId for default selections
     */
    const getWorksheetsFilterAndFieldsFromDashboardAsyncWithAssignments=async (_initialData?: HierarchyProps) => {
        // if initAsync is still loading, skip this.  Will return when it finishes.

        if(debug) { console.log(`getWorksheetsFilterAndFieldsFromDashboardAsyncWithAssignments`); }
        console.log(`What IS currentWorksheetName, initAsyncLoading?  [${ currentWorksheetName }, ${ initAsyncLoading }]`);
        dispatch({ type: 'FETCH_INIT' });
        if(typeof _initialData==='undefined') { _initialData=state.data; }
        const payload: HierarchyProps=extend(true, {}, _initialData); // operate on a copy
        // step 1: Set worksheet name
        payload.worksheet.name=currentWorksheetName;
        if(typeof tableau.extensions.dashboardContent==='undefined') { await tableau.extensions.initializeDialogAsync(); }
        try {
            // step 2: get current worksheet object
            await asyncForEach(tableau.extensions.dashboardContent!.dashboard.worksheets, async (worksheet: t.Worksheet) => {
                if(debug) {
                    console.log(`worksheet: vvv`);
                    console.log(worksheet);
                }
                const _fields=await getWorksheetFieldsAsync(worksheet);
                // need at least 2 fields (parent/child or flat tree) to use this sheet.  filters are optional
                if(_fields.length<2) {
                    if(debug) { console.log(`UH OH!  NOT ENOUGH FIELDS IN ${ worksheet.name }.`); }
                }
                else {
                    // if worksheets isn't in list, add it
                    if(payload.dashboardItems.worksheets.indexOf(worksheet.name)===-1) { payload.dashboardItems.worksheets.push(worksheet.name); }
                    // if name is blank, assume fresh load or reset and take 1st worksheet found
                    if(currentWorksheetName===''&&payload.worksheet.name==='') { payload.worksheet.name=worksheet.name; }
                    if(worksheet.name===payload.worksheet.name) {
                        // step 3: set current fields
                        // Ípayload.dashboardItems.allCurrentWorksheetItems.worksheetObject=worksheet;
                        payload.dashboardItems.allCurrentWorksheetItems.fields=_fields;
                        if(debug) {
                            console.log('fields: vvv');
                            console.log(payload.dashboardItems.allCurrentWorksheetItems.fields);
                        }

                        // step 4: set current filters
                        const _filters=await worksheet.getFiltersAsync();
                        payload.dashboardItems.allCurrentWorksheetItems.filters=[];
                        if(debug) { console.log(`Filters!`); }
                        for(const filter of _filters) {
                            if(debug) { console.log(filter); }
                            // if filter field name is in list of available fields, add it here
                            if(debug) { console.log(`filter.filterType==='categorical'? ${ filter.filterType==='categorical' }`); }
                            if(filter.filterType==='categorical') {
                                payload.dashboardItems.allCurrentWorksheetItems.filters.push(filter.fieldName);
                            }
                        }
                    }
                }
            });

            // step 5: set childid/childlabel/parentid; reset selected fields and disable filter
            payload.worksheet.childId=payload.dashboardItems.allCurrentWorksheetItems.fields[1];
            payload.worksheet.childLabel=payload.dashboardItems.allCurrentWorksheetItems.fields[0];
            payload.worksheet.parentId=payload.dashboardItems.allCurrentWorksheetItems.fields[0];
            payload.worksheet.filter=payload.dashboardItems.allCurrentWorksheetItems.filters[0];
            payload.worksheet.fields=[];
            payload.worksheet.filterEnabled=false;
            if (payload.type === HierType.RECURSIVE){
                payload.parameters.childId = payload.dashboardItems.parameters[0] || payload.dashboardItems.parameters[1] || '';
                payload.parameters.childLabel =  payload.dashboardItems.parameters[1] || '';
            }
        }
        catch(e) {
            if(debug) { console.log(`error in getWorksheetsFromDashboardAsyncWithAssigments: ${ e }`); }
            payload.worksheet.status=Status.notpossible;
            dispatch({ type: 'FETCH_INIT', data: payload });
            dispatch({ type: 'FETCH_FAILURE', data: e });
            return;
        }
        payload.worksheet.status=Status.set;
        payload.configComplete=evalConfigComplete(payload);
        dispatch({ type: 'FETCH_SUCCESS', data: payload });
        if(debug) { console.log(`finished getWorksheetsFromDashboardAsyncWithAssignments`); }
    };

    useEffect(() => {
        console.log(`??? ${!initAsyncLoading.current} for ws ${currentWorksheetName}`)
        if(!initAsyncLoading.current) { getWorksheetsFilterAndFieldsFromDashboardAsyncWithAssignments(); }
    }, [currentWorksheetName, initAsyncLoading]);

    // solve forEach with promise issue - https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    const asyncForEach=async (array: any[], callback: any) => {
        for(let index=0;index<array.length;index++) {
            await callback(array[index], index, array);
        }
    };

    /*
    Get the fields for a give worksheet
    */
    const getWorksheetFieldsAsync=async (worksheet: t.Worksheet) => {
        console.log(`getWorksheetFieldAsync`);
        try {
            const tempFields: string[]=[];
            const dataTable: any=await worksheet.getSummaryDataAsync();
            // todo: does maxRows work with summary data or just underlying data?
            // const dataTable: any=await worksheet.getSummaryDataAsync({ maxRows: 1 });
            if(dataTable.columns.length>=2) {
                dataTable.columns.forEach((column: any) => {
                    if(debug) {
                        console.log(`dataTable: vvv`);
                        console.log(dataTable);
                    }
                    // only allow string values
                    if(column.dataType===tableau.DataType.String) {
                        tempFields.push(column.fieldName);
                    }
                });
            }
            return tempFields;
        }
        catch(err) {
            console.error(err);
            return [];
        }
    };

    // retrieve parameters for the dashboard
    const getParamListFromDashboardAsync=async (): Promise<string[]> => {
        if(debug) {
            console.log(`begin loadParamList`);
        }
        const _params: t.Parameter[]=await tableau.extensions.dashboardContent!.dashboard.getParametersAsync();
        const params: string[]=[];
        if(debug) { console.log(`parameters found`); }
        for(const p of _params) {
            if(debug) { console.log(`${p.name} of allowable Values ${p.allowableValues.type} and type ${p.dataType}`); }
            if(p.allowableValues.type===tableau.ParameterValueType.All&&p.dataType===tableau.DataType.String) {
                console.log(`pushing ${p.name}`)
                params.push(p.name);
            }
            else {console.log(` --- skipping ${p.name}`)}
            console.log(`list now: ${params.join(', ')}`)
        }
        // TODO: case insensitive sort was returning incorrect results
        if(params.length>0) {
            console.log(`params before sort`)
            console.log(params.toString())
            // case insensitive sort
            params.sort((a, b) =>
                 (a.localeCompare(b, 'en', { 'sensitivity': 'base' })));

        };
        if(debug) {
            console.log(`parameterList`);
            console.log(params);
            console.log(params.toString())

        }
        if(debug) { console.log(`finished loadParamList`); }
        return params;
    };

    // if we have a worksheet, childId/parentId (for recursive) or fields.length>2 (for flat) we can set configComplete to true
    const evalConfigComplete=(data: HierarchyProps): boolean => {
        if(data.worksheet.name===''||data.worksheet.childId==='') {
            return false;
        }
        if(data.type===HierType.FLAT&&data.worksheet.fields.length>=2) {
            return true;
        }
        else if(data.type===HierType.RECURSIVE&&data.worksheet.childLabel!==''&& data.worksheet.parentId!=='') {
            return true;
        }
        // all other conditions
        return false;
    };

    // Saves settings and closes configure dialog
    const submit=(): void => {
        // if the user hits Clear the parameter will not be configured so save 'configured' state from that
        const submitAsync=async () => {
            if(debug) {
                console.log(`submitting settings...
            ${JSON.stringify(state.data) }`);
            }
            const _data = extend(true,{},state.data);
            delete _data.dashboardItems;
            await tableau.extensions.settings.set('data', JSON.stringify(_data));
            // extensions.settings.set('worksheet', JSON.stringify(state.data.worksheet));
            // extensions.settings.set('bgColor', state.data.bgColor.toString());
            tableau.extensions.settings.saveAsync().then(() => {
                tableau.extensions.ui.closeDialog(state.data.configComplete.toString());
            })
                .catch((err: any) => {
                    if(debug) { console.log(`an error occurred closing the dialogue box: ${ err } ${ err.stack }`); }
                });
        };
        submitAsync();
    };

    // big logic block to make sure existing settings are still valid
    // if any fail, reset all data
    // bLoad = are we loading fresh data?
    const validateSettings=(d: HierarchyProps): { result: boolean; msg: string; } => {
        if(debug) {
            console.log(`validate settings`);
            console.log(`availProps: vvv`);
            // console.log(availableProps);
            console.log(`selectedProps: vvv`);
            // console.log(selectedProps);
        }
        try {
            // setState({ loading: true });
            // setLoading(true);
            // if(debug) { console.log(`starting validate worksheets/fields/filters and parameters - bLoad=${ bLoad }`); }
            // await getWorksheetsFromDashboardAsync();
            // await getParamListFromDashboardAsync();

            if(debug) { console.log(`starting bLoad logic`); }
            // check existing  settings
            /*             if(bLoad) {
                            // parameter logic
                            updateError(0, '');
                            // worksheet/filter/sheet logic
                            const { worksheets }=availableProps;
                            if(worksheets.length) {
                                // assign fields of first worksheet
                                if(debug) { console.log(`setting worksheet state`); }
                                // dispatchSelectedProps({ type: 'reset' });
                                setSelectedWorksheet();
                                /* setState({ selectedProps: defaultSelectedProps }, () => {
                                                        setSelectedWorksheet();
                                                    }); 
                            }
                            else {
                                updateError(1, 'Err 1001. No valid sheets.  Please add a sheet that has at least two string dimensions.');
                            }
                        }
                        else { */
            // setFieldArrayBasedOnSelectedWorksheet(selectedProps.worksheet.name, false);
            // setFilterArrayBasedOnSelectedWorksheet(selectedProps.worksheet.name, false);
            // validate existing settings
            let bFound=false;
            // const { worksheet }=_initialData.wor
            // does the array of available worksheets contain the selected sheet?
            if(!d.dashboardItems.worksheets.includes(d.worksheet.name)) { return { result: false, msg: `Worksheet ${ d.worksheet.name } no longer present;` }; }

            // for(const availWorksheet of availableProps.worksheets) {
            //     if(availWorksheet.name===dataForValidate.worksheet.name) {
            //         bFound=true;
            //         break;
            //     }
            // }

            // if(!bFound) {
            //     if(debug) { console.log(`can't validate existing worksheet - reload`); }
            //     return clearSettings();
            // }
            bFound=false;
            // validate worksheet/fields
            // const foundWorksheet=availableProps.worksheets.find((ws:any) => ws.name===worksheet.name)||{ fields: [] };
            // if(foundWorksheet?.fields.length<2) {
            //     if(debug) { console.log(`can't validate existing worksheet has <2 fields - reload`); }
            //     return clearSettings();
            // }
            // else {

            if(d.type===HierType.RECURSIVE) {
                if(!d.dashboardItems.allCurrentWorksheetItems.fields.includes(d.worksheet.childId)) {
                    return { result: false, msg: `ChildId ${ d.worksheet.childId } no longer present;` };
                }
                /* for(const availFields of foundWorksheet.fields) {
                    if(availFields.fieldName===worksheet.childId.fieldName) {
                        bFound=true;
                        break;
                    }
                }
                if(!bFound) {
                    if(debug) { console.log(`can't validate existing childiId field (recursive tree) - reload`); }
                    return clearSettings();
                } */
            }
            else {
                // flat tree
                bFound=true; // start with true and set false if any field is not found.
                for(const field of d.worksheet.fields) {
                    let fieldFound=false;
                    for(const availField of d.dashboardItems.allCurrentWorksheetItems.fields) {
                        if(availField===field) {
                            fieldFound=true;
                        }
                    }
                    bFound=bFound&&fieldFound;
                }
                if(!bFound) {
                    if(debug) { console.log(`can't validate existing worksheet fields (flat tree) - reload`); }
                    return { result: false, msg: `One or more selected fields no longer present in selected sheet;` };
                }
            }



            // is the selected parent field still present?
            bFound=false;
            if(!d.dashboardItems.allCurrentWorksheetItems.fields.includes(d.worksheet.parentId)) {
                return { result: false, msg: `ParentId ${ d.worksheet.parentId } no longer present;` };
            }
            // for(const availFields of d.fields) {
            //     if(availFields.fieldName===worksheet.parentId.fieldName) {
            //         bFound=true;
            //         break;
            //     }
            // }

            // if(!bFound) {
            //     if(debug) { console.log(`can't validate existing parentId field - reload`); }
            //     return clearSettings();
            // }
            bFound=false;
            // is the selected childLabel field still present?
            // skip if flat tree
            if(!d.dashboardItems.allCurrentWorksheetItems.fields.includes(d.worksheet.childLabel)) {
                return { result: false, msg: `Child Label ${ d.worksheet.childLabel } no longer present;` };
            }
            // if(selectedProps.type===HierType.RECURSIVE) {
            //     for(const availFields of foundWorksheet.fields) {
            //         if(availFields.fieldName===worksheet.childLabel.fieldName) {
            //             bFound=true;
            //             break;
            //         }
            //     }
            //     if(!bFound) {
            //         if(debug) { console.log(`can't validate existing childLabel field- reload`); }
            //         return clearSettings();
            //     }
            // }
            bFound=false;
            // is the selected filter still available, if it is selected?
            

            if(d.worksheet.filter!=='' &&   !d.dashboardItems.allCurrentWorksheetItems.filters.includes(d.worksheet.filter)) {
                return { result: false, msg: `Filter ${ d.worksheet.filter } no longer present;` };
            }
            if(debug) { console.log(`childIdEnabled? ${ d.parameters.childIdEnabled }`); }
            if(d.parameters.childIdEnabled) {
                if(!d.dashboardItems.parameters.includes(d.parameters.childId)) {
                    return { result: false, msg: `ChildID Parameter ${ d.parameters.childId } no longer present;` };
                }
            }
            bFound=false;
            if(d.parameters.childLabelEnabled) {
                if(!d.dashboardItems.parameters.includes(d.parameters.childLabel)) {
                    return { result: false, msg: `Child Label Parameter ${ d.parameters.childLabel } no longer present;` };
                }
            }
            if(debug) { console.log(`successfully completed validate fields`); }

        }
        catch(err) {
            console.error(`Error in validate settings`);
            console.error(err);
        }
        return { result: true, msg: '' };
    };


    return [state, setCurrentWorksheetName, setUpdates];
};


export default hierarchyAPI;