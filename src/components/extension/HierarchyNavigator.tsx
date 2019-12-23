import 'babel-polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TreeMenu from 'react-simple-tree-menu';
import '../../css/style.css';
import { defaultSelectedProps,ISelectedProps } from '../config/Interfaces';
import {Extensions} from '@tableau/extensions-api-types/ExternalContract/Namespaces/Extensions'
const extend=require("extend");
const debug=true;

declare global {
    interface Window { tableau: {extensions: Extensions}; }
}
interface Settings {
    bgColor: string,
    txtColor: string,
    configComplete: boolean,
    selectedProps: ISelectedProps,
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
        for(var el of this._pathMap) {
            if (debug) console.log(`el.key: ${ el.key.toString() } ID: ${ ID.toString() }  =:${ el.key.toString()===ID.toString() }`);
            if (debug) console.log(`el.key: ${ el.key } ID: ${ ID }  =:${ el.key===ID }`);
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
        if (debug) console.log(`setSelectedFromExtension`);
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
    public getChildren(type:string) {
        // if (debug) console.log(`child of current`);
        // if (debug) console.log(`this._childOf`)
        // if (debug) console.log(this._childOf)
        if (debug) console.log(`getting children for this._currentID: ${this._currentID}`)
        if (debug) console.log(JSON.stringify(this._childOf[this._currentID]));
        if(!this._childOf[this._currentID].length) return [this._currentID];
        const reducer=(accumulator:any[], currentValue:any) => {
            if(currentValue.nodes.length) accumulator=currentValue.nodes.reduce(reducer, accumulator);
            if (type==='id'){return [currentValue.key, ...accumulator];}
            else {return [currentValue.label, ...accumulator];}
        };
        let arr=this._childOf[this._currentID];
        if (type==='id') {return arr.reduce(reducer, [arr[0].parent, arr[0].key]);}
        else {
            return arr.reduce(reducer, [this.currentSelected, arr[0].label]);}
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

        
        // logic if parent/child are not recursive
        // props to Santiago Sanchez, SC Extraodinaire 12/19/19
        if(!tree.length&&Object.keys(this._childOf).length) {
            if (debug) console.log(`found non-recursive hierarchy`)
            let alreadyFound:string[]=[];
            for(let el in this._childOf) {
                if (debug) console.log(this._childOf[el].length);
                if(this._childOf[el].length) {
                    for(var i=0;i<this._childOf[el].length;i++) {
                        if (debug) console.log(i);
                        if (debug) console.log(this._childOf[el][i].parent);
                        let { parent }=this._childOf[el][i];
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
        for(let i=0;i<tree.length;i++) {
            if(tree[i].nodes&&tree[i].nodes.length>=2)
                tree[i].nodes=this.sortTree(tree[i].nodes);
        }
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
    private _hn: HierarchyNavigator;
    constructor(HN: HierarchyNavigator) {
        this._hn=HN;
        this._dashboard=HN.dashboard;
        this._temporaryEventHandlers=[];
    }
    public get childIdParam(): any { return this._childIdParam; }
    public get childLabelParam(): any { return this._childLabelParam; }
    public async findParametersAndFilters() {
        //parameters
        this._childIdParamEnabled=this._hn.state.extensionSettings.selectedProps.parameters.childIdEnabled;
        this._childLabelParamEnabled=this._hn.state.extensionSettings.selectedProps.parameters.childLabelEnabled;

        if (debug) console.log(`this._hn.state.extensionSettings.selectedProps: ${ JSON.stringify(this._hn.state.extensionSettings.selectedProps, null, 2) }`);
        if(this._childIdParamEnabled)
            this._childIdParam=await this._hn.dashboard.findParameterAsync(this._hn.state.extensionSettings.selectedProps.parameters.childId.name);
        if(this._childLabelParamEnabled)
            this._childLabelParam=await this._dashboard.findParameterAsync(this._hn.state.extensionSettings.selectedProps.parameters.childLabel.name);


        // find filters
        this._filterEnabled=this._hn.state.extensionSettings.selectedProps.worksheet.filterEnabled;

        const dashboard=window.tableau.extensions.dashboardContent!.dashboard;
        await this._hn.asyncForEach(dashboard.worksheets, async (worksheet: any) => {
            if (debug) console.log(`worksheet`);
            if (debug) console.log(worksheet);
            if (debug) console.log(`this._hn.state.extensionSettings.selectedProps.worksheet.name: ${ this._hn.state.extensionSettings.selectedProps.worksheet.name }`);
            if(worksheet.name===this._hn.state.extensionSettings.selectedProps.worksheet.name) {
                if (debug) console.log(`found worksheet`);
                this._worksheet=worksheet;
            }
        });

    }

    public async setEventListeners() {
        await this.findParametersAndFilters();
        this.clearEventHandlers(); // just in case.
        if (debug) console.log(`setEventHandleListeners`);
        if (debug) console.log(this);
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
        try {
        await this.findParametersAndFilters();
         if(this._hn.state.extensionSettings.selectedProps.worksheet.filter.fieldName!=='' && this._hn.state.extensionSettings.selectedProps.worksheet.filterEnabled)
         {
            if (debug) console.log(`clearing filter this._hn.state.extensionSettings.selectedProps.worksheet.filter.fieldName: ${this._hn.state.extensionSettings.selectedProps.worksheet.filter.fieldName}`)
             await this._worksheet.clearFilterAsync(this._hn.state.extensionSettings.selectedProps.worksheet.filter.fieldName); 
            }
        if (debug) console.log(`worksheet:`);
        if (debug) console.log(this._worksheet);
        if (debug) console.log(`for sheet: ${ this._hn.state.extensionSettings.selectedProps.worksheet.childId.fieldName }`);

        // clear all marks selection
        await this._worksheet.selectMarksByValueAsync([{
            fieldName: this._hn.state.extensionSettings.selectedProps.worksheet.childId.fieldName,
            value: []
        }], tableau.SelectionUpdateType.Replace);
    }
    catch (err){
        console.error(err);
        console.log(`this.state.selectedprops`)
        console.log(this._hn.state.extensionSettings.selectedProps)
    }

    }

    // if there is an event change on the dashboard 
    // then send the updated value to the hierarchy for evaluation
    public eventDashboardChangeID=async (): Promise<void> => {
        await this.findParametersAndFilters();
        this._hn.hierarchy.setCurrentIDFromDashboard(this._childIdParam.currentValue.value);
    };
    public eventDashboardChangeLabel=async (): Promise<void> => {
        await this.findParametersAndFilters();
        if(debug) console.log(`event change label`);
        if(debug) console.log(`values... label: ${ this._childLabelParam.currentValue.value }, id: ${ this._childIdParam.currentValue.value }`);
        this._hn.hierarchy.setCurrentLabelFromDashboard(this._childLabelParam.currentValue.value);
    };

    public async setParamDataFromExtension() {
        if (debug) console.log(`setting Param Data:`);
        if (debug) console.log(this);
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
            if (debug) console.log(`this._worksheet`);
            if (debug) console.log(this._worksheet);
            if (debug) console.log(`state.selectedProps???`);
            if (debug) console.log(this._hn.state.extensionSettings.selectedProps);
            let type = this._hn.state.extensionSettings.selectedProps.worksheet.filter.fieldName===this._hn.state.extensionSettings.selectedProps.worksheet.childId.fieldName?'id':'label';
            if (debug) console.log(`replacing filter (${this._hn.state.extensionSettings.selectedProps.worksheet.filter.fieldName}) with values ${JSON.stringify(this._hn.hierarchy.getChildren(type))}`)
            await this._worksheet.applyFilterAsync(this._hn.state.extensionSettings.selectedProps.worksheet.filter.fieldName, this._hn.hierarchy.getChildren(type), tableau.FilterUpdateType.Replace);
        }
        if(this._hn.state.extensionSettings.selectedProps.worksheet.enableMarkSelection) {
            await this._worksheet.selectMarksByValueAsync([{
                fieldName: this._hn.state.extensionSettings.selectedProps.worksheet.childId.fieldName,
                value: this._hn.hierarchy.getChildren('id')
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
    public genericError='This Extension could not retrieve the parameter.  Please add a parameter or select a new one.'; // if param gets deleted or other error
    public hierarchy: Hierarchy;
    public paramHandler: EventHandler;
    public childRef: any;
    private configEventHandler: any;
    public constructor(props: any) {
        super(props);
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
                txtColor: '#000000',
            },
            tree: [],
            uiDisabled: false,
            openNodes: []
        };
        this.childRef=React.createRef();
        window.tableau.extensions.initializeAsync({ configure: this.configure}).then(() => {
            this.dashboard=window.tableau.extensions.dashboardContent!.dashboard;
            this.hierarchy=new Hierarchy(this);
            this.paramHandler=new EventHandler(this);
            this.updateExtensionBasedOnSettings();
            this.configEventHandler = window.tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent: any) => {
                this.updateExtensionBasedOnSettings(settingsEvent.newSettings);
            });
        })
            .catch((err: any) => {
                if(debug) console.log(`Something went wrong.  Here is the error: ${ err }.<p> ${ err.stack }`);
                this.resetParams();
            });

    }
    componentDidMount() {
        if (debug) console.log(`component MOUNTED`);
    }
    componentWillUnmount() {
        if (debug) console.log(`component UNMOUNTED`);
        this.paramHandler.clearEventHandlers();
        if (this.configEventHandler) {
            this.configEventHandler();
            this.configEventHandler = undefined;
        }
    }
    public async updateExtensionBasedOnSettings(settings?: any) {
        if(typeof settings==='undefined') {
            settings=window.tableau.extensions.settings.getAll();
        }


        const configCompleteTmp=settings.configComplete==='true'? true:false;
        const selectedPropsTmp=typeof settings.selectedProps==='undefined'?
            defaultSelectedProps:JSON.parse(settings.selectedProps);
        settings=Object.assign({}, settings, { selectedProps: selectedPropsTmp }, { configComplete: configCompleteTmp });
        this.setState({ extensionSettings: { ...settings } });
        if(settings.configComplete) {
            this.paramHandler.clearEventHandlers();
            await this.paramHandler.clearFilterAndMarksAsync();
            this.hierarchy.clearHierarchy();
            document.body.style.backgroundColor=settings.bgColor;
            this.loadHierarchy();
        }
        else {
            this.configure();
        }
    }

    // Pops open the configure page if extension isn't configured
    public configure=(): any => {
        if (debug) console.log(`calling CONFIGURE`);
        this.paramHandler.clearFilterAndMarksAsync();
        if(debug) console.log(`settings in configure:`);
        if(debug) console.log(this.state);
        const popupUrl=`config.html`;
        window.tableau.extensions.ui.displayDialogAsync(popupUrl, '', { height: 525, width: 450 }).then((closePayload: string) => {
            if(debug) console.log(`returning from Configure! ${ closePayload }`);
            if(debug) console.log(`typeof return: ${ typeof closePayload }`);
            if(closePayload==='true') {
                this.loadHierarchy();
            }
        }).catch((error: any) => {
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
                        if (debug) console.log(`selected... ${label}, ${key}`)
                        if (debug) console.log(props)
                        this.hierarchy.setSelectedFromExtension(label, key.split('/').pop()||'');
                    }}
                    // resetOpenNodesOnDataUpdate
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
        this.setState({
            extensionSettings: {
                bgColor: '#F3F3F3',
                configComplete: false,
                selectedProps: defaultSelectedProps,
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
                        // console.log(`row: ${ JSON.stringify(row) }`);
                        map.push({ parent: row[parentIDCol].formattedValue, label: row[childLabelCol].formattedValue, key: row[childIDCol].formattedValue, nodes: [] });
                        if(!isSet&&this.state.currentSelected===''&&(row[parentIDCol].formattedValue==='Null'||row[parentIDCol].formattedValue===''||row[parentIDCol].formattedValue===row[childLabelCol].formattedValue)) {
                            isSet=true;
                            this.hierarchy.currentSelected=row[childLabelCol].formattedValue;
                            this.hierarchy.currentID=row[childIDCol].formattedValue;
                        }
                    });
                });
                if(debug) console.log('done getting data...');
            }
            // })

        });
        if(debug) console.log(`map length... ${ map.length }`);
        this.hierarchy.data=map;
    };

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