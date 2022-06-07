// import * as t from '@tableau/extensions-api-types';
import { Parameter, Worksheet } from '@tableau/extensions-api-types';
import { useEffect, useReducer, useRef, useState } from 'react';
import * as React from 'react';
import { debugOverride, defaultSelectedProps, HierarchyProps, HierType, SelectedParameters, Status } from './Interfaces';
import { withHTMLSpaces } from './Utils';

const extend=require('extend');

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
    const {debug=false||debugOverride} = state.data.options;
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
        case 'ERROR':
            return {
                ...state,
                errorStr: state.errorStr? `${ state.errorStr }\n${ action.data }`:action.data,
                isError: true
            };
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
    const getWorksheetsRunning=useRef<boolean>(false);
    const [state, dispatch]=useReducer(dataFetchReducer, initialData);
    const [debug, setDebug]=useState(debugOverride);

    useEffect(()=>{
        setDebug(state.data.options.debug || debugOverride);
    },[state.data.options.debug])

    // if we are loading, or reset the data, re-init
    const initAsync=async (_initialData: HierarchyProps=extend(true, {}, defaultSelectedProps)) => {
        initAsyncLoading.current=true;
        if(debug) { console.log(`begin initAsync`); }
        dispatch({ type: 'FETCH_INIT' });

        await window.tableau.extensions.initializeDialogAsync();
        const _settings=loadSettings();
        if(debug) {
            console.log(`loading _settings: vvv`);
            console.log(_settings);
        }
        const _params=await getParamListFromDashboardAsync();
        _initialData.dashboardItems.parameters=_params;
        // validate settings
        // true means all good; false means some data didn't pass the logic
        // skip if current worksheet name is blank (initial load)
        if(typeof _settings.configComplete!=='undefined'&&_settings.configComplete) {
            extend(true, _initialData, _settings);
            _initialData=await getWorksheetsFilterAndFieldsFromDashboardAsyncWithoutAssignments(_initialData);
            const { data, result, msg }=validateSettings(_initialData);
            switch(result) {
                case 'SUCCESS':
                    dispatch({ type: 'FETCH_SUCCESS', data: _initialData });
                    break;
                case 'MODIFIED':
                    dispatch({ type: 'FETCH_SUCCESS', data });
                    dispatch({ type: 'ERROR', data: msg });
                    break;
                case 'FAIL':
                    _initialData.dashboardItems.parameters=_params;
                    await getWorksheetsFilterAndFieldsFromDashboardAsyncWithAssignments(_initialData);
                    dispatch({ type: 'ERROR', data: `Configuration could not be restored.` });
                    break;
            }

        }
        else {
            await getWorksheetsFilterAndFieldsFromDashboardAsyncWithAssignments(_initialData);
        }

        if(debug) { console.log(`finished initAsync`); }
        initAsyncLoading.current=false;
    };

    // load settings from Extension
    const loadSettings=(): any => {
        const _settings=window.tableau.extensions.settings.getAll();
        let res={};
        if(debug) { console.log(`loadSettings: raw settings = ${ JSON.stringify(_settings) }`); }
        if(typeof _settings.data==='undefined') { return res; }
        res=JSON.parse(_settings.data);
        return res;
    };

    const changeHierType=(hierType: HierType) => {
        const changeHierTypeAsync=async () => {
            if(hierType===state.data.type) { return; }
            if(debug) { console.log(`begin resetAsync`); }
            dispatch({ type: 'FETCH_INIT' });
            const _initialData: HierarchyProps=extend(true, {}, defaultSelectedProps);
            _initialData.type=hierType;
            _initialData.dashboardItems.parameters=await getParamListFromDashboardAsync();
            await getWorksheetsFilterAndFieldsFromDashboardAsyncWithAssignments(_initialData);
        };
        changeHierTypeAsync();
    };

    // load initial extension and settings upon load
    useEffect(() => {
        initAsync();
    }, []);

    const setUpdates=(action: { type: string, data: any; }): void => {
        const payload: HierarchyProps=extend(true, {}, state.data);
        switch(action.type) {
            case 'SET_PARENT_ID_FIELD':
                {
                    // update parentId from UI
                    // if childId = new parentId then switch values
                    if(payload.worksheet.childId===action.data) {
                        payload.worksheet.childId=payload.worksheet.parentId;
                    }
                    payload.worksheet.parentId=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_CHILD_ID_FIELD':
                {
                    // update childId from UI
                    // if childId = new parentId then switch values
                    if(payload.worksheet.parentId===action.data) {
                        payload.worksheet.parentId=payload.worksheet.childId;
                    }
                    if(payload.type===HierType.FLAT) { payload.parameters.childId=`${ action.data }${ payload.paramSuffix }`; }
                    if (debug) console.log(`PARAM CHILD ID set to ${ payload.parameters.childId }`);
                    payload.worksheet.childId=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_CHILD_LABEL_FIELD':
                {
                    // update parentId from UI
                    payload.worksheet.childLabel=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_CHILD_ID_PARAMETER':
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
            case 'SET_CHILD_LABEL_PARAMETER': 
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
            case 'SET_BG_COLOR':
                {
                    // update background color
                    payload.options.bgColor=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_PARAM_SUFFiX':
                {
                    // update parameter suffix
                    payload.paramSuffix=action.data;
                    payload.parameters.level=`Level${ payload.paramSuffix }`;
                    payload.parameters.childId=`${ payload.worksheet.childId }${ payload.paramSuffix }`;
                    payload.parameters.fields=[];
                    for(const field of payload.worksheet.fields) {
                        payload.parameters.fields.push(`${ field }${ payload.paramSuffix }`);
                    }
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_SEPARATOR':
                {
                    // update separator
                    payload.separator=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_FIELDS':
                {
                    // update fields for flat hierarchy
                    let _hasChanged=false;
                    payload.worksheet.fields=action.data;
                    if(payload.type===HierType.FLAT) {
                        payload.parameters.fields=[];
                        for(const field of payload.worksheet.fields) {
                            payload.parameters.fields.push(`${ field }${ payload.paramSuffix }`);
                        }
                        payload.dashboardItems.flatParameters=availableFlatParamList(payload.parameters, payload.dashboardItems.parameters);
                        if(!payload.dashboardItems.flatParameters.includes(payload.parameters.childLabel)||payload.parameters.childLabel==='') {
                            payload.parameters.childLabel=payload.dashboardItems.flatParameters[0]||'';
                            if(payload.parameters.childLabelEnabled) {
                                payload.parameters.childLabelEnabled=false;
                                _hasChanged=true;
                            }
                        }
                    }
                    payload.configComplete=evalConfigComplete(payload);
                    dispatch({ type: 'FETCH_SUCCESS', data: payload });
                    if(_hasChanged) { dispatch({ type: 'ERROR', data: `Please recheck your Label parameter.  It has changed and has been disabled.` }); };
                    return;
                }
            case 'SET_FILTER_FIELD':
                {
                    // update filter name from UI
                    payload.worksheet.filter=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'TOGGLE_FILTER_ENABLED':
                {
                    // update filter enabled/disabled from UI
                    payload.worksheet.filterEnabled=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'TOGGLE_MARKSELECTION_ENABLED':
                {
                    // update mark selection enabled/disabled from UI
                    payload.worksheet.enableMarkSelection=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }

            case 'TOGGLE_ID_PARAMETER_ENABLED':
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
            case 'TOGGLE_LABEL_PARAMETER_ENABLED':
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
            // BEGIN OPTIONS 
            case 'TOGGLE_SEARCH_DISPLAY':
                {
                    // enable/disable title
                    payload.options.searchEnabled=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'TOGGLE_TITLE_DISABLED':
                {
                    // enable/disable title
                    payload.options.titleEnabled=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_TITLE':
                {
                    // set title
                    payload.options.title=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_FONT_FAMILY':
                {
                    // set font family
                    payload.options.fontFamily=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_FONT_COLOR':
                {
                    // set title
                    payload.options.fontColor=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_FONT_SIZE':
                {
                    // set title
                    payload.options.fontSize=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_HIGHLIGHT_COLOR':
                {
                    // set highlight
                    payload.options.highlightColor=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_ITEM_CSS':
                {
                    // set item css
                    payload.options.itemCSS=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_OPENED_ICON_BASE64IMAGE':
                {
                    // set opened icon
                    payload.options.openedIconBase64Image=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_OPENED_ICON_ASCII':
                {
                    // set opened icon
                    payload.options.openedIconAscii=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_OPENED_ICON_TYPE':
                {
                    // set opened icon type
                    payload.options.openedIconType=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_CLOSED_ICON_BASE64IMAGE':
                {
                    // set closed icon
                    payload.options.closedIconBase64Image=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_CLOSED_ICON_ASCII':
                {
                    // set closed icon
                    payload.options.closedIconAscii=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_CLOSED_ICON_TYPE':
                {
                    // set closed icon type
                    payload.options.closedIconType=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'TOGGLE_DEBUG':
                {
                    // update debug true/false
                    payload.options.debug=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'SET_DEBOUNCE':
                {
                    // set debounce time
                    payload.options.debounce=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'TOGGLE_DASHBOARD_LISTENERS':
                {
                    // set if parameters should listen for dashboard actions
                    payload.options.dashboardListenersEnabled=action.data;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            // END OPTIONS
            case 'CLEAR_WARNING':
                {
                    // enable/disable warning
                    payload.options.warningEnabled=false;
                    return dispatch({ type: 'FETCH_SUCCESS', data: payload });
                }
            case 'CHANGE_HIER_TYPE':
                changeHierType(action.data);
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
    const getWorksheetsFilterAndFieldsFromDashboardAsyncWithoutAssignments=async (_initialData: HierarchyProps): Promise<HierarchyProps> => {
        return new Promise(async (resolve, reject) => {
            getWorksheetsRunning.current=true;

            if(debug) { console.log(`getWorksheetsFilterAndFieldsFromDashboardAsyncWithoutAssignments`); }
            if(typeof window.tableau.extensions.dashboardContent==='undefined') { await window.tableau.extensions.initializeDialogAsync(); }
            try {
                setCurrentWorksheetName(_initialData.worksheet.name);
                // step 2: get current worksheet object
                await asyncForEach(window.tableau.extensions.dashboardContent!.dashboard.worksheets, async (worksheet: Worksheet) => {
                    if(worksheet.name===_initialData.worksheet.name) {
                        if(debug) {
                            console.log(`worksheet: vvv`);
                            console.log(worksheet);
                        }
                        _initialData.dashboardItems.allCurrentWorksheetItems.fields=await getWorksheetFieldsAsync(worksheet);;

                        _initialData.dashboardItems.allCurrentWorksheetItems.filters=await getWorksheetFilters(worksheet);
                    }
                    if(_initialData.dashboardItems.worksheets.indexOf(worksheet.name)===-1) { _initialData.dashboardItems.worksheets.push(worksheet.name); }

                });


                // check to see if params were previously blank but now exist
                // mismatches will be picked up by validate
                if(_initialData.type===HierType.RECURSIVE) {
                    if(_initialData.parameters.childId==='') {
                        _initialData.parameters.childId=_initialData.dashboardItems.parameters[0]||'';
                    }
                    if(_initialData.parameters.childLabel==='') {
                        _initialData.parameters.childLabel=_initialData.dashboardItems.parameters.find(p => p!==_initialData.parameters.childId)||'';
                    }
                }
                else {
                    // flat hier
                    if(_initialData.parameters.childId==='') {
                        _initialData.parameters.childId=_initialData.dashboardItems.parameters[0]||'';
                    }
                    // always set list for flat parameters; then check to see if id is null
                    _initialData.dashboardItems.flatParameters=availableFlatParamList(_initialData.parameters, _initialData.dashboardItems.parameters);
                    if(_initialData.parameters.childLabel==='') {
                        _initialData.parameters.childLabel=_initialData.dashboardItems.flatParameters[0]||'';
                    }
                }

            }
            catch(e) {
                if(debug) { console.log(`error in getWorksheetsFromDashboardAsyncWithoutAssignment: ${ e }`); }

            }
            if(debug) { console.log(`finished getWorksheetsFromDashboardAsyncWithoutAssignment`); }
            getWorksheetsRunning.current=false;
            resolve(_initialData);
        });
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
        return new Promise(async (resolve: any, reject: any) => {
            getWorksheetsRunning.current=true;
            if(debug) { console.log(`getWorksheetsFilterAndFieldsFromDashboardAsyncWithAssignments`); }
            dispatch({ type: 'FETCH_INIT' });
            if(typeof _initialData==='undefined') { _initialData=state.data; }
            const payload: HierarchyProps=extend(true, {}, _initialData); // operate on a copy
            // step 1: Set worksheet name
            payload.worksheet.name=currentWorksheetName;
            if(typeof window.tableau.extensions.dashboardContent==='undefined') { await window.tableau.extensions.initializeDialogAsync(); }
            try {
                // step 2: get current worksheet object
                await asyncForEach(window.tableau.extensions.dashboardContent!.dashboard.worksheets, async (worksheet: Worksheet) => {
                    if(debug) {
                        console.log(`worksheet ${ worksheet.name }: vvv`);
                        console.log(worksheet);
                    }
                    const _fields=await getWorksheetFieldsAsync(worksheet);
                    // need at least 2 fields (parent/child or flat tree) to use this sheet.  filters are optional
                    if(_fields.length<2) {
                        if(debug) { console.log(` --- skipping ${ worksheet.name }; not enough fields`); }
                    }
                    else {
                        // if worksheets isn't in list, add it
                        if(payload.dashboardItems.worksheets.indexOf(worksheet.name)===-1) { payload.dashboardItems.worksheets.push(worksheet.name); }
                        // if name is blank, assume fresh load or reset and take 1st worksheet found
                        if(currentWorksheetName===''&&payload.worksheet.name==='') {
                            initAsyncLoading.current=true; // make sure we don't trigger a loop here
                            payload.worksheet.name=worksheet.name;
                            setCurrentWorksheetName(payload.worksheet.name);
                            initAsyncLoading.current=false;
                        }
                        if(worksheet.name===payload.worksheet.name) {
                            // step 3: set current fields
                            payload.dashboardItems.allCurrentWorksheetItems.fields=await getWorksheetFieldsAsync(worksheet);;

                            payload.dashboardItems.allCurrentWorksheetItems.filters=await getWorksheetFilters(worksheet);

                            // step 5: set childid/childlabel/parentid; reset selected fields and disable filter
                            payload.worksheet.childId=payload.dashboardItems.allCurrentWorksheetItems.fields[1];
                            payload.worksheet.childLabel=payload.dashboardItems.allCurrentWorksheetItems.fields[0];
                            payload.worksheet.parentId=payload.dashboardItems.allCurrentWorksheetItems.fields[0];
                            payload.worksheet.filter=payload.dashboardItems.allCurrentWorksheetItems.filters[0]||'';
                            payload.worksheet.fields=[];
                            payload.worksheet.filterEnabled=false;
                        }
                    }
                });
                if(payload.type===HierType.RECURSIVE) {
                    payload.parameters.childId=payload.dashboardItems.parameters[0]||'';
                    console.log(`setting PARAM CHILDLABEL to one of: ${ _initialData.dashboardItems.parameters.find(p => p!==payload.parameters.childId) } or ''`);
                    payload.parameters.childLabel=_initialData.dashboardItems.parameters.find(p => p!==payload.parameters.childId)||'';
                }
                else {
                    payload.parameters.childId=`${ payload.worksheet.childId }${ payload.paramSuffix }`;
                    payload.dashboardItems.flatParameters=availableFlatParamList(payload.parameters, payload.dashboardItems.parameters);
                    payload.parameters.childLabel=payload.dashboardItems.flatParameters[0]||'';
                }

            }
            catch(e) {
                if(debug) { console.log(`error in getWorksheetsFromDashboardAsyncWithAssigments: ${ e }`); }
                payload.worksheet.status=Status.notpossible;
                dispatch({ type: 'FETCH_INIT', data: payload });
                dispatch({ type: 'FETCH_FAILURE', data: e });
                reject();
            }
            payload.worksheet.status=Status.set;
            payload.configComplete=evalConfigComplete(payload);
            dispatch({ type: 'FETCH_SUCCESS', data: payload });
            if(debug) { console.log(`finished getWorksheetsFromDashboardAsyncWithAssignments`); }
            getWorksheetsRunning.current=false;
            resolve();
        });


    };

    useEffect(() => {
        /*         console.log(`initasyncloading: ${initAsyncLoading}; getWorksheetsRunning: ${getWorksheetsRunning.current}`) */
        if(!initAsyncLoading.current&&!getWorksheetsRunning.current) { getWorksheetsFilterAndFieldsFromDashboardAsyncWithAssignments(); }
    }, [currentWorksheetName, initAsyncLoading, getWorksheetsRunning]);

    // solve forEach with promise issue - https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    const asyncForEach=async (array: any[], callback: any) => {
        for(let index=0;index<array.length;index++) {
            await callback(array[index], index, array);
        }
    };

    /* for Flat hierarchies -
    take the given inputs 
    level, childId, fields[] and available parameters
    and return a unique list of parameters that are still left for childLabel */
    const availableFlatParamList=(selectedParams: SelectedParameters, availableParameters: string[]): string[] => {
        const { level, childId, fields }=selectedParams;
        const p: string[]=[];
        console.log(`p param list: ${ p }`);
        availableParameters.forEach(param => {
            if(param!==level&&param!==childId&&!fields.includes(param)) { p.push(param); }
        });
        console.log(`setting p: ${ p }`);
        return p;
    };

    /*
    Get the fields for a give worksheet
    */
    const getWorksheetFieldsAsync=async (worksheet: Worksheet): Promise<string[]> => {
        return new Promise(async (resolve, reject) => {

            if(debug) { console.log(`getWorksheetFieldAsync`); }
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
                        if(column.dataType===tableau.DataType.String||column.dataType===tableau.DataType.Int) {
                            tempFields.push(column.fieldName);
                        }
                    });
                }
                resolve(tempFields);
            }
            catch(err) {
                console.error(err);
                reject([]);
            }
        });
    };

    // retrieve parameters for the dashboard
    const getParamListFromDashboardAsync=async (): Promise<string[]> => {
        if(debug) {
            console.log(`begin loadParamList`);
        }
        const _params: Parameter[]=await window.tableau.extensions.dashboardContent!.dashboard.getParametersAsync();
        const params: string[]=[];
        if(debug) { console.log(`parameters found`); }
        for(const p of _params) {
            if(debug) { console.log(`${ p.name } of allowable Values ${ p.allowableValues.type } and type ${ p.dataType }`); }
            if(p.allowableValues.type===tableau.ParameterValueType.All&&(p.dataType===tableau.DataType.String||p.dataType===tableau.DataType.Int)) {
                params.push(p.name);
            }
            else { if(debug) { console.log(` --- skipping ${ p.name }`); } }
        }
        // TODO: case insensitive sort was returning incorrect results
        if(params.length>0) {
            // case insensitive sort
            params.sort((a, b) =>
                (a.localeCompare(b, 'en', { 'sensitivity': 'base' })));

        };
        if(debug) {
            console.log(`parameterList`);
            console.log(params);
            console.log(params.toString());
        }
        if(debug) { console.log(`finished loadParamList`); }
        return params;
    };

    const getWorksheetFilters=async (worksheet: Worksheet): Promise<string[]> => {
        return new Promise(async (resolve, reject) => {

            const _filters=await worksheet.getFiltersAsync();
            if(debug) { console.log(`Filters!`); }
            const filters: string[]=[];
            for(const filter of _filters) {
                if(debug) { console.log(filter); }
                // if filter field name is in list of available fields, add it here
                if(debug) { console.log(`filter.filterType==='categorical'? ${ filter.filterType==='categorical' }`); }
                if(filter.filterType==='categorical') {
                    filters.push(filter.fieldName);
                }
            }
            resolve(filters);
        });
    };

    // if we have a worksheet, childId/parentId (for recursive) or fields.length>2 (for flat) we can set configComplete to true
    const evalConfigComplete=(data: HierarchyProps): boolean => {
        if(data.worksheet.name===''||data.worksheet.childId==='') {
            return false;
        }
        if(data.type===HierType.FLAT&&data.worksheet.fields.length>=2) {
            return true;
        }
        else if(data.type===HierType.RECURSIVE&&data.worksheet.childLabel!==''&&data.worksheet.parentId!=='') {
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
            const _data=extend(true, {}, state.data);
            delete _data.dashboardItems;
            await window.tableau.extensions.settings.set('data', JSON.stringify(_data));
            // extensions.settings.set('worksheet', JSON.stringify(state.data.worksheet));
            // extensions.settings.set('bgColor', state.data.bgColor.toString());
            window.tableau.extensions.settings.saveAsync().then(() => {
                window.tableau.extensions.ui.closeDialog(state.data.configComplete.toString());
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
    const validateSettings=(d: HierarchyProps): { data?: HierarchyProps, result: 'SUCCESS'|'MODIFIED'|'FAIL'; msg?: React.ReactFragment; } => {
        const modifiedStr=[]; // srting to return if we modified 1+ item
        if(debug) {
            console.log(`validate settings`);
            console.log(`availProps: vvv`);
            // console.log(availableProps);
            console.log(`selectedProps: vvv`);
            // console.log(selectedProps);
        }
        try {
            // does the array of available worksheets contain the selected sheet?
            if(!d.dashboardItems.worksheets.includes(d.worksheet.name)) { return { result: 'FAIL', msg: `Worksheet ${ d.worksheet.name } no longer present. Please reconfigure extension.` }; }
            if(d.dashboardItems.allCurrentWorksheetItems.fields.length<2) {
                return { result: 'FAIL', msg: `Worksheet ${ d.worksheet.name } no longer has 2+ fields required for the hierarchy. Please reconfigure extension.` };
            }

            if(d.type===HierType.RECURSIVE) {
                // Check Parent Id
                if(!d.dashboardItems.allCurrentWorksheetItems.fields.includes(d.worksheet.parentId)) {
                    modifiedStr.push(`Parent Id (${ d.worksheet.childId }) no longer present.`);
                    d.worksheet.parentId=d.worksheet.childId===d.dashboardItems.allCurrentWorksheetItems.fields[0]? d.dashboardItems.allCurrentWorksheetItems.fields[1]:d.dashboardItems.allCurrentWorksheetItems.fields[0];
                };
                // Check Child Id
                if(!d.dashboardItems.allCurrentWorksheetItems.fields.includes(d.worksheet.childId)) {
                    modifiedStr.push(`Child Id (${ d.worksheet.childId }) no longer present.`);
                    d.worksheet.childId=d.worksheet.parentId===d.dashboardItems.allCurrentWorksheetItems.fields[0]? d.dashboardItems.allCurrentWorksheetItems.fields[1]:d.dashboardItems.allCurrentWorksheetItems.fields[0];
                };

                // Check Child Label
                if(!d.dashboardItems.allCurrentWorksheetItems.fields.includes(d.worksheet.parentId)) {
                    modifiedStr.push(`Child Label (${ d.worksheet.childLabel }) no longer present.`);
                    d.worksheet.childLabel=d.dashboardItems.allCurrentWorksheetItems.fields[0];
                };
            }

            else {
                // flat tree
                // tslint:disable:prefer-for-of
                for(let i=0;i<d.worksheet.fields.length;i++) {
                    if(!d.dashboardItems.allCurrentWorksheetItems.fields.includes(d.worksheet.fields[i])) {
                        d.worksheet.fields=[];
                        modifiedStr.push(`One or more fields in the hierarchy has changed.`);
                        break;
                    }
                }
                // tslint:enable:prefer-for-of

                // Check Child Id
                if(!d.dashboardItems.allCurrentWorksheetItems.fields.includes(d.worksheet.childId)) {
                    modifiedStr.push(`ID Column '(${ withHTMLSpaces(d.worksheet.childId) })' no longer present.`);
                    // is there a field that isn't used?
                    if(d.dashboardItems.allCurrentWorksheetItems.fields.length>d.worksheet.fields.length) {
                        // find first match and set it
                        // tslint:disable:prefer-for-of
                        for(let i=0;i<d.dashboardItems.allCurrentWorksheetItems.fields.length;i++) {
                            if(!d.worksheet.fields.includes(d.dashboardItems.allCurrentWorksheetItems.fields[i])) {
                                d.worksheet.childId=d.dashboardItems.allCurrentWorksheetItems.fields[i];
                                break;
                            }
                        }
                        // tslint:enable:prefer-for-of
                    }
                    else {
                        // just take the last field and set it as the id field
                        d.worksheet.childId=d.dashboardItems.allCurrentWorksheetItems.fields.splice(d.dashboardItems.allCurrentWorksheetItems.fields.length-1)[0];
                    }
                };
            }

            // Check Child ID Param; recursive only
            if(d.type===HierType.RECURSIVE) {
                if(d.parameters.childIdEnabled&&!d.dashboardItems.parameters.includes(d.parameters.childId)) {
                    modifiedStr.push(`Child ID Parameter is no longer present.`);
                    d.parameters.childIdEnabled=false;
                    d.parameters.childId=d.dashboardItems.parameters[0]||'';
                }
            }

            // Check for Child Label Param; recursive and flat
            if(d.parameters.childLabelEnabled&&!d.dashboardItems.parameters.includes(d.parameters.childLabel)) {
                modifiedStr.push(`Child Label Parameter '${ d.parameters.childLabel }' no longer present.`);
                d.parameters.childLabelEnabled=false;
                d.parameters.childLabel=d.dashboardItems.parameters[1]||d.dashboardItems.parameters[0]||'';
            }

            // Check filter
            if(d.worksheet.filterEnabled&&!d.dashboardItems.allCurrentWorksheetItems.filters.includes(d.worksheet.filter)) {
                modifiedStr.push(`Filter '${ d.worksheet.filter }' no longer present.`);
                d.worksheet.filter=d.dashboardItems.allCurrentWorksheetItems.filters[0]||'';
                d.worksheet.filterEnabled=false;
            }
            // if filter added/changed, assign it
            if(d.worksheet.filter==='') {
                d.worksheet.filter=d.dashboardItems.allCurrentWorksheetItems.filters[0]||'';
            }

            if(debug) { console.log(`successfully completed validate fields`); }

        }
        catch(err) {
            console.error(`Error in validate settings`);
            console.error(err);
            const snippet: React.ReactFragment=(<>A critical error was encountered:<br />{modifiedStr.join(', ')}</>);
            return { result: 'MODIFIED', msg: snippet, data: d };
        }
        if(modifiedStr.length) {
            const snippet: React.ReactFragment=(<>
                The following have changed.<br /><ul>
                    {modifiedStr.map((el, idx) => {
                        return (<ul key={`${ idx }-errors`}>{el}</ul>);
                    })}
                </ul>
                Please check the configuration options.
            </>
            );

            return { result: 'MODIFIED', msg: snippet, data: d };
        }
        else {
            return { result: 'SUCCESS' };
        }
    };
    return [state, setCurrentWorksheetName, setUpdates];
};


export default hierarchyAPI;