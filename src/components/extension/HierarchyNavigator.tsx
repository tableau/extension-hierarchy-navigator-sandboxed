import 'babel-polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TreeMenu from '../TreeMenu';
// import '../../../node_modules/react-simple-tree-menu/dist/main.css'
import '../../css/style.css';
import { IField, SelectedWorksheet, IParameter, IFilterType, defaultSelectedProps, defaultParameter, ISelectedProps, ISelectedParameters } from '../config/Interfaces';
import { Button } from '@tableau/tableau-ui';
//import { FilterType, DataType, ParameterValueType, TableauEventType, SelectionUpdateType, FilterUpdateType, ErrorCodes } from '@tableau/extensions-api-types/ExternalContract/Namespaces/Tableau';
import {Extensions} from '@tableau/extensions-api-types/ExternalContract/Namespaces/Extensions'
const debug=true;

declare global {
    interface Window { tableau: {extensions: Extensions}; }
}
interface Settings {
    bgColor: string,
    txtColor: string,
    configComplete: boolean,
    selectedProps: ISelectedProps,
    //selectedChildLabel: string,
    //selectedParameter: { key: string, keyEnabled: boolean, text: string, textEnabled: boolean; },
    // selectedParentID: string;
    // selectedChildID: string;
    // selectedSheet: string,
}

interface State {
    activeKey: string;
    extensionSettings: Settings;
    currentID: string;
    currentSelected: string;
    uiDisabled: boolean;
    tree: Tree[];
    openNodes: string[];
}

interface Tree {
    key: string,
    label: string,
    parent: string,
    path?: string,
    nodes: Tree[];
}
interface PathMap {
    key: string,
    label: string,
    path: string;
}

class Hierarchy {
    private _data: Tree[];
    private _tree: Tree[];
    private _pathMap: PathMap[];
    private _hn: HierarchyNavigator;
    private _currentID: string;
    private _currentSelected: string;
    private _childOf: any;
    constructor(HN: HierarchyNavigator) {
        this._data=[];
        this._hn=HN;
        this._currentID='';
        this._currentSelected='';
        this._tree=[];
        this._pathMap=[];

    }
    public get tree(): Tree[] { return this._tree||[]; }
    public set tree(val: Tree[]) {
        this._tree=this.sortTree(val);
        this.buildPathMap(val);
        this._hn.setState({ tree: this._tree });
        this._hn.paramHandler.setParamDataFromExtension();
    }
    public set data(incomingData: Tree[]) {
        this._data=incomingData;
        this.buildHierarchy();
        this._hn.paramHandler.setEventListeners();
    }
    public get data(): Tree[] {
        return this._data;
    };
    public get currentID(): string { return this._currentID; }
    public set currentID(val: string) {
        this._currentID=val;
        this._hn.setState({ currentID: val });
    }
    public get currentSelected(): string { return this._currentSelected; }
    public set currentSelected(val: string) {
        this._currentSelected=val;
        this._hn.setState({ currentSelected: val });
    }
    private makePath(_path: string) {
        let keys=_path.split('/');
        let len=keys.length;
        let out: string[]=[];
        // len-1 so we don't open the target child mode
        for(var i=0;i<len-1;i++) {
            i===0? out.push(keys[i]):out.push(`${ out[i-1] }/${ keys[i] }`);
        }
        return out;
    }
    public setCurrentIDFromDashboard(ID: string) {
        if(debug) console.log(`in setCurrentIDfromDash`);
        let node;
        // let matchType='int';
        // if(this._hn.state.extensionSettings.selectedProps.worksheet.childId.dataType===DataType.String) { matchType==='string'; }
        // note: probably should remove INT param since all values will be stored as string
        for(var el of this._pathMap) {
            console.log(`el.key: ${ el.key.toString() } ID: ${ ID.toString() }  =:${ el.key.toString()===ID.toString() }`);
            console.log(`el.key: ${ el.key } ID: ${ ID }  =:${ el.key===ID }`);
            if(el.key===ID) {
                node=el;
                if(debug) console.log(`found node ${ JSON.stringify(el) }`);
                break;
            }
        }
        if(typeof node!=='undefined') {
            const _openNodes=this.makePath(node.path);
            if(debug) console.log(`setting open nodes: ${ _openNodes } and key ${ node.path }`);
            this._hn.childRef.current.resetOpenNodes(_openNodes, node.path);
            this.currentID=node.key;
            this.currentSelected=node.label;
            this._hn.paramHandler.setParamDataFromExtension();
        }

    }

    public setCurrentLabelFromDashboard(desiredLabel: string) {

        let node;
        for(var el of this._pathMap) {
            // note: check to see if we can remove the type casting
            if(el.label.toString()===desiredLabel.toString()) {
                node=el;
                break;
            }
        }
        if(typeof node!=='undefined') {
            const _openNodes=this.makePath(node.path);
            if(debug) console.log(`setting open nodes: ${ _openNodes } and key ${ node.path }`);
            this._hn.childRef.current.resetOpenNodes(_openNodes, node.path);
            this.currentID=node.key;
            this.currentSelected=node.label;
            this._hn.paramHandler.setParamDataFromExtension();
        }
    }
    public setSelectedFromExtension(label: string, key: string) {
        console.log(`setSelectedFromExtension`);
        this.currentSelected=label;
        this.currentID=key;
        this._hn.paramHandler.setParamDataFromExtension();
    }
    public clearHierarchy() {
        this._tree=[];
        this._pathMap=[];
        this._childOf=[];
    }
    public buildPathMap(_data: Tree[], _path=''): void {
        for(var el of _data) {
            this._pathMap.push({ key: el.key, path: _path===''? el.key:`${ _path }/${ el.key }`, label: el.label });
            if(el.nodes&&el.nodes.length)
                this.buildPathMap(el.nodes, _path===''? el.key:`${ _path }/${ el.key }`);
        }
    }
    public getChildren() {
        console.log(`child of current`);
        console.log(`this._childOf`)
        console.log(this._childOf)
        console.log(`this._currentID: ${this._currentID}`)
        console.log(JSON.stringify(this._childOf[this._currentID]));
        if(!this._childOf[this._currentID].length) return [this._currentID];
        const reducer=(accumulator:any[], currentValue:any) => {
            if(currentValue.nodes.length) accumulator=currentValue.nodes.reduce(reducer, accumulator);
            return [currentValue.key, ...accumulator];
        };
        let arr=this._childOf[this._currentID];
        return arr.reduce(reducer, [arr[0].parent, arr[0].key]);
    }
    // credit to https://stackoverflow.com/a/58136016/7386278
    public buildHierarchy() {
        if(debug) console.log(`building hierarchy.`);
        if(debug) console.log(`do we have data?`);
        if(debug) console.log(JSON.stringify(this._data));
        this.clearHierarchy();
        let tree: Tree[]=[];
        // let this._childOf={};
        this._data.forEach((item) => {
            const { key, parent }=item;
            this._childOf[key]=this._childOf[key]||[];
            item.nodes=this._childOf[key];
            const _hasParent=!(parent==='Null'||parseInt(parent)===0||parent==='');
            _hasParent? (this._childOf[parent]=this._childOf[parent]||[]).push(item):tree.push(item);
        });
        // if (debug) console.log(`this._childOf`)
        // if (debug) console.log(this._childOf)
        if (debug) console.log(`done with building hier...`)
        if (debug) console.log(JSON.stringify(tree));
        
        // logic if parent/child are not recursive
        // props to Santiago Sanchez, SC Extraodinaire 12/19/19
        if(!tree.length&&Object.keys(this._childOf).length) {
            console.log(`found non-recursive hierarchy`)
            let alreadyFound:string[]=[];
            for(let el in this._childOf) {
                console.log(this._childOf[el].length);
                if(this._childOf[el].length) {
                    for(var i=0;i<this._childOf[el].length;i++) {
                        console.log(i);
                        console.log(this._childOf[el][i].parent);
                        let { parent, key }=this._childOf[el][i];
                        if(!alreadyFound.includes(parent)) {
                            alreadyFound.push(parent);
                            tree.push({ parent: '', key: parent, label: parent, nodes:this._childOf[parent] });
                        }
                    }
                }
            }
            if (debug) console.log(`tree was not recursive... morphing!`)
            if (debug) console.log(JSON.stringify(tree));
        }
        
        this.tree=tree;
        
    }

    private sortTree(tree: Tree[]): Tree[] {
        if(tree.length<=1) return tree;
        if(debug) console.log(`tree.length ${ tree.length }`);
        if(debug) console.log(`first node: ${ tree[0].label }`);
        function compare(a: Tree, b: Tree) {
            if(a.label>b.label) return 1;
            else if(b.label>a.label) return -1;
            else return 0;
        }
        tree=tree.sort(compare);
        // if (tree.length && tree.length){
        for(let i=0;i<tree.length;i++) {
            if(tree[i].nodes&&tree[i].nodes.length>=2)
                tree[i].nodes=this.sortTree(tree[i].nodes);
        }
        // }
        return tree;
    }

    public findRowByKey(key: string): Tree {
        for(const row of this.data) {
            if(row.key===key) { return row; }
        }
        return { key: '', label: '', parent: '', nodes: [] };
    }

    public findRowByChild(child: string): Tree {
        for(const row of this.data) {
            if(parseInt(row.key)<25) {

                if(debug) console.log(`row...row.label===child ${ row.label.toLowerCase()===child.toLowerCase() } -- row.label ${ row.label } and child ${ child }`);
                if(debug) console.log(row);
            }
            if(row.label.toLowerCase()===child.toLowerCase()) {
                if(debug) console.log(`returning row ${ JSON.stringify(row) }`);
                return row;
            }
        }
        return { key: '', label: '', parent: '', nodes: [] };
    }

}

class EventHandler {
    private _temporaryEventHandlers: any[];
    private _dashboard: any;
    private _childIdParam: any;
    private _childIdParamEnabled: boolean;
    private _childLabelParam: any;
    private _childLabelParamEnabled: boolean;
    private _filterEnabled: boolean;
    private _worksheet: any;
    // private _parameters: ISelectedParameters;
    // private _selectedProps: ISelectedProps;
    private _hn: HierarchyNavigator;
    constructor(HN: HierarchyNavigator) {
        ;
        this._hn=HN;
        this._dashboard=HN.dashboard;
        this._temporaryEventHandlers=[];
        // this._selectedProps=this._hn.state.extensionSettings.selectedProps;
    }
    public get childIdParam(): any { return this._childIdParam; }
    public get childLabelParam(): any { return this._childLabelParam; }
    public async findParametersAndFilters() {
        //parameters
        this._childIdParamEnabled=this._hn.state.extensionSettings.selectedProps.parameters.childIdEnabled;
        this._childLabelParamEnabled=this._hn.state.extensionSettings.selectedProps.parameters.childLabelEnabled;

        console.log(`this._hn.state.extensionSettings.selectedProps: ${ JSON.stringify(this._hn.state.extensionSettings.selectedProps, null, 2) }`);
        if(this._childIdParamEnabled)
            this._childIdParam=await this._hn.dashboard.findParameterAsync(this._hn.state.extensionSettings.selectedProps.parameters.childId.name);
        if(this._childLabelParamEnabled)
            this._childLabelParam=await this._dashboard.findParameterAsync(this._hn.state.extensionSettings.selectedProps.parameters.childLabel.name);


        // find filters
        this._filterEnabled=this._hn.state.extensionSettings.selectedProps.worksheet.filterEnabled;

        const dashboard=window.tableau.extensions.dashboardContent!.dashboard;
        await this._hn.asyncForEach(dashboard.worksheets, async (worksheet: any) => {
            console.log(`worksheet`);
            console.log(worksheet);
            console.log(`this._hn.state.extensionSettings.selectedProps.worksheet.name: ${ this._hn.state.extensionSettings.selectedProps.worksheet.name }`);
            if(worksheet.name===this._hn.state.extensionSettings.selectedProps.worksheet.name) {
                console.log(`found worksheet`);
                this._worksheet=worksheet;
                /* let filters: any[]=await worksheet.getFiltersAsync();
                console.log(`found filters:`);
                console.log(filters);
                for(let f=0;f>filters.length;f++) {
                    if(filters[f].fieldName===this._hn.state.extensionSettings.selectedProps.worksheet.filter.fieldName) {
                        this._filter=filters[f];
                    }
                } */

            }
        });

    }

    public async setEventListeners() {
        await this.findParametersAndFilters();
        this.clearEventHandlers(); // just in case.
        console.log(`setEventHandleListeners`);
        console.log(this);
        if(debug) console.log(`setting event handle listeners`);
        if(this._childLabelParamEnabled)
            this._temporaryEventHandlers.push(this._childLabelParam.addEventListener(tableau.TableauEventType.ParameterChanged, this.eventDashboardChangeLabel));
        if(this._childIdParamEnabled)
            this._temporaryEventHandlers.push(this._childIdParam.addEventListener(tableau.TableauEventType.ParameterChanged, this.eventDashboardChangeID));
    }

    public clearEventHandlers() {
        if(debug) console.log(`clearing event handle listeners`);
        if(this._temporaryEventHandlers.length)
            this._temporaryEventHandlers.map(fn => { fn(); });
        this._temporaryEventHandlers=[];
    }
    public async clearFilterAndMarksAsync() {
        await this.findParametersAndFilters();
         if(this._hn.state.extensionSettings.selectedProps.worksheet.filter.fieldName!=='' && this._hn.state.extensionSettings.selectedProps.worksheet.filterEnabled)
            await this._worksheet.clearFilterAsync(this._hn.state.extensionSettings.selectedProps.worksheet.filter.fieldName); 


        console.log(`worksheet:`);
        console.log(this._worksheet);
        console.log(`for sheet: ${ this._hn.state.extensionSettings.selectedProps.worksheet.childId.fieldName }`);

        // clear all marks selection
        await this._worksheet.selectMarksByValueAsync([{
            fieldName: this._hn.state.extensionSettings.selectedProps.worksheet.childId.fieldName,
            value: []
        }], tableau.SelectionUpdateType.Replace);


    }

    // if there is an event change on the dashboard 
    // then send the updated value to the hierarchy for evaluation
    public eventDashboardChangeID=async (): Promise<void> => {
        await this.findParametersAndFilters();
        // if (debug) console.log(`event change DH`);
        // if (debug) console.log(`values... ID: ${this._keyParam.currentValue.formattedValue}, text: ${this._textParam.currentValue.formattedValue}`)

        this._hn.hierarchy.setCurrentIDFromDashboard(this._childIdParam.currentValue.value);
        // this._hn.hierarchy.setCurrentIDFromDashboard(this._childIdParam.currentValue.formattedValue);
    };
    public eventDashboardChangeLabel=async (): Promise<void> => {
        await this.findParametersAndFilters();
        if(debug) console.log(`event change label`);
        if(debug) console.log(`values... label: ${ this._childLabelParam.currentValue.value }, id: ${ this._childIdParam.currentValue.value }`);

        this._hn.hierarchy.setCurrentLabelFromDashboard(this._childLabelParam.currentValue.value);
        /* this._childLabelParam.currentValue.formattedValue }, id: ${ this._childIdParam.currentValue.formattedValue }`);

        this._hn.hierarchy.setCurrentLabelFromDashboard(this._childLabelParam.currentValue.formattedValue); */
    };

    public async setParamDataFromExtension() {
        console.log(`setting Param Data:`);
        console.log(this);
        this.clearEventHandlers();
        await this.findParametersAndFilters();
        this._hn.setState({
            uiDisabled: true
        });
        if(this._childIdParamEnabled)
            await this._childIdParam.changeValueAsync(this._hn.hierarchy.currentID);
        if(this._childLabelParamEnabled)
            await this._childLabelParam.changeValueAsync(this._hn.hierarchy.currentSelected);
        if(this._filterEnabled) {
            // await this._dashboard.clearFilterAsync(this._hn.state.extensionSettings.selectedProps.worksheet.filter.fieldName)
            console.log(`this._worksheet`);
            console.log(this._worksheet);
            //await this._worksheet.clearFilterAsync('Employee Number');
            // await this._worksheet.clearFilterAsync(this._hn.state.extensionSettings.selectedProps.worksheet.filter.fieldName)
            console.log(`children`);
            console.log(this._hn.hierarchy.getChildren());
            await this._worksheet.applyFilterAsync(this._hn.state.extensionSettings.selectedProps.worksheet.filter.fieldName, this._hn.hierarchy.getChildren(), FilterUpdateType.Replace);
        }
        if(this._hn.state.extensionSettings.selectedProps.worksheet.enableMarkSelection) {
            await this._worksheet.selectMarksByValueAsync([{
                fieldName: this._hn.state.extensionSettings.selectedProps.worksheet.childId.fieldName,
                value: this._hn.hierarchy.getChildren()
            }], tableau.SelectionUpdateType.Replace);
        }
        this._hn.setState({
            uiDisabled: false
        });
        this.setEventListeners();
    }

}


class HierarchyNavigator extends React.Component<any, State> {

    public dashboard: any; // object to hold the Tableau Dashboard
    private configureStr='Please configure this extension to display the formatted parameter.'; // Message to display in the main window for error/not configured
    private message=this.configureStr; // message to be displayed to user
    public genericError='This Extension could not retrieve the parameter.  Please add a parameter or select a new one.'; // if param gets deleted or other error
    public hierarchy: Hierarchy;
    public paramHandler: EventHandler;
    public childRef: any;

    public constructor(props: any) {
        super(props);
        this.onChangeToggle=this.onChangeToggle.bind(this);
        this.loadHierarchy=this.loadHierarchy.bind(this);
        this.resetParams=this.resetParams.bind(this);
        this.configure=this.configure.bind(this);
        this.state={
            activeKey: '',
            currentID: '',
            currentSelected: '',
            extensionSettings: {
                bgColor: '#F3F3F3',
                configComplete: false,
                selectedProps: defaultSelectedProps,
                // selectedChildLabel: '',
                // selectedChildID: '',
                // selectedParameter: { key: '', keyEnabled: true, text: '', textEnabled: true },
                // selectedParentID: '',
                // selectedSheet: '',
                txtColor: '#000000',
            },
            tree: [],
            uiDisabled: false,
            openNodes: []
        };
        this.childRef=React.createRef();
        window.tableau.extensions.initializeAsync({ configure: this.configure}).then(() => {
            //this.configure();
            this.dashboard=window.tableau.extensions.dashboardContent!.dashboard;
            this.hierarchy=new Hierarchy(this);
            this.paramHandler=new EventHandler(this);
            this.updateExtensionBasedOnSettings();
            // this is a persistent evt handler so we won't pass it to child function
            window.tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent: any) => {
                this.updateExtensionBasedOnSettings(settingsEvent.newSettings);
            });
        })
            .catch((err: any) => {
                if(debug) console.log(`Something went wrong.  Here is the error: ${ err }.<p> ${ err.stack }`);
                this.resetParams();
            });

    }
    componentDidMount() {
        console.log(`component MOUNTED`);
    }
    componentWillUnmount() {
        console.log(`component UNMOUNTED`);
    }
    public async updateExtensionBasedOnSettings(settings?: any) {
        if(typeof settings==='undefined') {
            settings=window.tableau.extensions.settings.getAll();
        }


        const configCompleteTmp=settings.configComplete==='true'? true:false;
        const selectedPropsTmp=typeof settings.selectedProps==='undefined'?
            defaultSelectedProps:JSON.parse(settings.selectedProps);
        settings=Object.assign({}, settings, { selectedProps: selectedPropsTmp }, { configComplete: configCompleteTmp });
        // if (debug) console.log(`settings are...`)
        // if (debug) console.log(settings)
        this.setState({ extensionSettings: { ...settings } });
        if(settings.configComplete) {
            this.paramHandler.clearEventHandlers();
            await this.paramHandler.clearFilterAndMarksAsync();
            this.hierarchy.clearHierarchy();
            document.body.style.backgroundColor=settings.bgColor;
            // document.body.style.color=settings.txtColor;
            this.loadHierarchy();
        }
        else {
            this.configure();
        }
    }

    // Pops open the configure page if extension isn't configured
    public configure=(): any => {
        console.log(`calling CONFIGURE`);
        if(debug) console.log(`settings in configure:`);
        if(debug) console.log(this.state);
        const popupUrl=`config.html`;
        // if (typeof (this.state.extensionSettings) !== 'undefined' && this.state.extensionSettings.configComplete==='true'){

        window.tableau.extensions.ui.displayDialogAsync(popupUrl, '', { height: 525, width: 450 }).then((closePayload: string) => {
            if(debug) console.log(`returning from Configure! ${ closePayload }`);
            if(debug) console.log(`typeof return: ${ typeof closePayload }`);
            if(closePayload==='true') {
                this.loadHierarchy();
            }
        }).catch((error: any) => {
            // if(window.tableau.extensions.settings.get('configComplete')!=='true') {
            //     this.resetParams()
            // }
            switch(error.errorCode) {
                case tableau.ErrorCodes.DialogClosedByUser:
                    if(debug) console.log('Dialog was closed by user.');
                    break;
                default:
                    console.error(error.message);
                    this.resetParams(this.genericError);
            }
        });
    };

    public render() {
        return (
            <div style={{ overflowX: "hidden" }}>
                <TreeMenu
                    data={this.state.tree}
                    onClickItem={({ label, key, ...props }) => {
                        console.log(`selected... ${label}, ${key}`)
                        console.log(props)
                        this.hierarchy.setSelectedFromExtension(label, key.split('/').pop()||'');
                    }}
                    resetOpenNodesOnDataUpdate
                    ref={this.childRef}
                />
                <p>
                    {/*  {JSON.stringify(this.state.extensionSettings, null, 2)} */}
                </p>
            </div>
        );
    }
    // reset all parameters
    public resetParams=(msg=this.configureStr) => {
        this.message=msg;
        this.setState({
            extensionSettings: {
                bgColor: '#F3F3F3',
                configComplete: false,
                // selectedChildLabel: '',
                // selectedChildID: '',
                selectedProps: defaultSelectedProps,
                // selectedParameter: { key: '', keyEnabled: false, text: '', textEnabled: false },
                // selectedParentID: '',
                // selectedSheet: '',
                txtColor: '#000000'
            }
        });
    };
    // solve forEach with promise issue - https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    public asyncForEach=async (array: any[], callback: any) => {
        for(let index=0;index<array.length;index++) {
            await callback(array[index], index, array);
        }
    };

    // this function handles loading and of stored values and live params 
    private loadHierarchy=async () => {
        this.paramHandler.clearEventHandlers();
        await this.paramHandler.clearFilterAndMarksAsync();
        const map: any[]=[];
        await this.asyncForEach(this.dashboard.worksheets, async (worksheet: any) => {
            if(worksheet.name===this.state.extensionSettings.selectedProps.worksheet.name) {
                if(debug) console.log(`found worksheet: ${ worksheet.name }`);
                await worksheet.getSummaryDataAsync().then(async (dataTable: any) => {
                // await worksheet.getUnderlyingDataAsync().then(async (dataTable: any) => {
                    let parentIDCol=0;
                    let childLabelCol=1;
                    let childIDCol=2;
                    await this.asyncForEach(dataTable.columns, (column: any) => {
                        if(column.fieldName===this.state.extensionSettings.selectedProps.worksheet.parentId.fieldName) {
                            parentIDCol=column.index;
                        }
                        else if(column.fieldName===this.state.extensionSettings.selectedProps.worksheet.childLabel.fieldName) {
                            childLabelCol=column.index;
                        }
                        if(column.fieldName===this.state.extensionSettings.selectedProps.worksheet.childId.fieldName) {
                            childIDCol=column.index;
                        }
                    });
                    if(debug) console.log(`parentCol: ${ parentIDCol }  childCol: ${ childLabelCol } keyCol: ${ childIDCol }`);
                    let isSet: boolean=false;
                    dataTable.data.forEach((row: any, index: number) => {
                        console.log(`row: ${ JSON.stringify(row) }`);
                        map.push({ parent: row[parentIDCol].formattedValue, label: row[childLabelCol].formattedValue, key: row[childIDCol].formattedValue, nodes: [] });
                        if(!isSet&&this.state.currentSelected===''&&(row[parentIDCol].formattedValue==='Null'||row[parentIDCol].formattedValue===''||row[parentIDCol].formattedValue===row[childLabelCol].formattedValue)) {
                            isSet=true;
                            if(debug) console.log(`setting initial current selected as ${ row[childLabelCol].formattedValue } at row ${ index }`);
                            // this.setState((prevState) => {
                            //     return {
                            //         currentKey: row[keyCol].formattedValue,
                            //         currentSelected: row[childCol].formattedValue,
                            //     }
                            // })
                            this.hierarchy.currentSelected=row[childLabelCol].formattedValue;
                            this.hierarchy.currentID=row[childIDCol].formattedValue;
                        }
                    });
                });
                if(debug) console.log('done getting data...');
                // if (debug) console.log(`first selected is ${this.state.currentSelected}`)
            }
            // })

        });
        if(debug) console.log(`map length... ${ map.length }`);
        this.hierarchy.data=map;
        // this.setState({data: map});
        // this.hier.buildHierarchy();
        // this.registerParamHandlers();
    };




    // this function is for a user clicks on a new element in the hierarchy
    /*     public onChange=(e: any): void => {
            // this.setParamData(e.target.getAttribute('data-value'))
            this.hierarchy.setSelectedFromExtension(e.target.getAttribute('data-value'))
        } */

    // this function is when a user changes the toggle/switch
    public onChangeToggle=(isChecked: boolean, e: any, id: any): void => {
        // this.setState({checked: isChecked})
        // this.setParamData(isChecked)
    };



    /*     // set the parameter value based on the new target value
        public setParamData=async (currentTarget: string) => {
            // this.unregisterParamHandlers();
            this.paramHandler.clearEventHandlers();
            const paramKey=await this.dashboard.findParameterAsync(this.state.extensionSettings.selectedParameter.key);
            const paramText=await this.dashboard.findParameterAsync(this.state.extensionSettings.selectedProps.parameters.childLabel);
            try {
                // .then((param: any) => {
                // Disable the UI first, re-enable it when returning from the promise
                this.setState({
                    uiDisabled: true
                });
                const currKey=this.hierarchy.findKeyByChild(currentTarget);
                if (debug) console.log(`setting key ${currKey} for child ${currentTarget}`)
                await paramKey.changeValueAsync(currKey)
                await paramText.changeValueAsync(currentTarget);
    
                // .then(() => {
                this.setState({
                    currentKey: currKey,
                    currentSelected: currentTarget,
                    uiDisabled: false
                });
                this.hierarchy.buildHierarchy();
                // });
                // })
            }
            // .catch((err: any) => {
            catch(err) {
                if (debug) console.log(`Something went wrong.  Here is the error: ${err}.<p> ${err.stack}`)
                this.resetParams(this.genericError)
            };
    
        } */



    // helper function
    public fakeWhiteOverlay(hex: string) {
        const rgb=this.hexToRgb(hex);
        if(rgb) {
            return `rgb(${ Math.min(Math.floor(rgb.r/2)+127, 255) }, ${ Math.min(Math.floor(rgb.g/2)+127, 255) }, ${ Math.min(Math.floor(rgb.b/2)+127, 255) })`;
        } else {
            return '#ffffff';
        }
    }

    // helper function
    public hexToRgb(hex: string) {
        const result=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result? {
            b: parseInt(result[3], 16),
            g: parseInt(result[2], 16),
            r: parseInt(result[1], 16),
        }:null;
    }
}

ReactDOM.render(<HierarchyNavigator />, document.getElementById('container'));