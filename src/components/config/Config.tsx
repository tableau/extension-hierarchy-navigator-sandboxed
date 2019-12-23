import { Button, Checkbox, Tabs } from '@tableau/tableau-ui';
import { Container, Row, Col } from 'reactstrap';
import 'babel-polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../../css/style.css';
import { Selector } from '../shared/Selector';
import Colors from './Colors';
import * as t from "@tableau/extensions-api-types";
import { IParameter, IFilterType, IField, ISelectedProps, defaultField, defaultFilter, defaultParameter, defaultSelectedProps } from './Interfaces';
import { Extensions } from '@tableau/extensions-api-types';

const extend=require("extend");
const debug=true;
export enum Status { 'notpossible', 'notset', 'set', 'hidden' }

declare global {
    interface Window { tableau: { extensions: Extensions; }; }
}


interface AvailableProps {
    parameters: IParameter[], // list of paramaters to be shown to user for selection
    worksheets: AvailableWorksheet[]; // list of available worksheets with their names, fields and filters 
}
interface AvailableWorksheet {
    name: string,
    filters: IFilterType[],
    fields: IField[]; // store all worksheet names and fields for selecting hierarchy
}


interface State {
    configComplete: boolean, // is the extension configured ? 
    error: string[]; // array to hold any errors 0 = param, 1 = sheet, 2 = other
    availableProps: AvailableProps; // hold all available worksheets, fields, filters, parameters
    selectedProps: ISelectedProps; // hold selected worksheet
    bgColor: string, // string for the background color
    parameterStatus: Status; // status of the parameter
    worksheetStatus: Status; // are there enough sheets/dimensions that can be utilized by this extension?
    loading: boolean; // are we loading anything?,
    selectedTabIndex: number; // for tabs
    fieldArr: string[]; // temp var to hold names of fields for current sheet
    filterArr: string[]; // temp var to hold names of available filters for current sheet
    paramArr: string[]; // temp var to hold all string params
}

const defaultWorksheet: AvailableWorksheet={ name: '', fields: [], filters: [] };

const defaultAvailableProps: AvailableProps={
    parameters: [],
    worksheets: []
};


class Configure extends React.Component<any, State> {

    public state: State={
        bgColor: '#F3F3F3',  // tableau default background color
        configComplete: false,
        error: [],
        loading: false,
        parameterStatus: Status.notpossible,
        availableProps: defaultAvailableProps,
        selectedProps: defaultSelectedProps,
        selectedTabIndex: 0,
        worksheetStatus: Status.notset,
        fieldArr: [],
        paramArr: [],
        filterArr: []
    };

    private dashboard: t.Dashboard;
    private Loading: string=' -- Loading...';

    public constructor(props: any) {
        super(props);
        this.getWorksheetsAsync=this.getWorksheetsAsync.bind(this);
        this.setParent=this.setParent.bind(this);
        this.bgChange=this.bgChange.bind(this);
        this.getParamListAsync=this.getParamListAsync.bind(this);
        this.loadExtensionSettings=this.loadExtensionSettings.bind(this);
        this.changeTabs=this.changeTabs.bind(this);
        this.changeTabNext=this.changeTabNext.bind(this);
        this.changeTabPrevious=this.changeTabPrevious.bind(this);
        this.changeEnabled=this.changeEnabled.bind(this);
        this.changeFilter=this.changeFilter.bind(this);
        window.tableau.extensions.initializeDialogAsync().then(() => {
            if(debug) console.log(`in async init`);
            this.dashboard=window.tableau.extensions.dashboardContent!.dashboard;
            this.loadExtensionSettings();
        });
    }
    componentDidMount() {
        if (debug) console.log(`component MOUNTED`);
    }
    componentWillUnmount() {
        if (debug) console.log(`component UNMOUNTED`);
    }
    public render() {
        const worksheetTitle=() => {
            switch(this.state.worksheetStatus) {
                case Status.notpossible:
                    return 'No valid sheets on the dashboard';
                case Status.set:
                case Status.notset:
                    return 'Select the sheet with the hierarchy data';
                default:
                    return '';
            }
        };
        const availableWorksheetArr: string[]=[];
        for(const sheet of this.state.availableProps.worksheets) {
            availableWorksheetArr.push(sheet.name);
        }
        const tabs=[{ content: 'Sheet and Fields' }, { content: 'Interactions' }, { content: 'Display' }];
        const content: React.ReactFragment[]=[];
        // WORKSHEET CONTENT
        content[0]=(
            <div className='sectionStyle mb-5'>
                Worksheet and Fields
            <Selector
                    title={worksheetTitle()}
                    status={this.state.worksheetStatus}
                    selected={this.state.selectedProps.worksheet.name}
                    list={availableWorksheetArr}
                    onChange={this.worksheetChange}
                />
                <Selector
                    title='Parent ID'
                    status={this.state.worksheetStatus!==Status.set? Status.hidden:this.state.worksheetStatus}
                    list={this.state.fieldArr}
                    onChange={this.setParent}
                    selected={this.state.selectedProps.worksheet.parentId.fieldName}
                />
                <Selector
                    title='Child ID'
                    status={this.state.worksheetStatus!==Status.set? Status.hidden:this.state.worksheetStatus}
                    list={this.state.fieldArr}
                    onChange={this.setChild}
                    selected={this.state.selectedProps.worksheet.childId.fieldName}
                />
                <Selector
                    title='Child label'
                    status={this.state.worksheetStatus!==Status.set? Status.hidden:this.state.worksheetStatus}
                    list={this.state.fieldArr}
                    onChange={this.setChildLabel}
                    selected={this.state.selectedProps.worksheet.childLabel.fieldName}
                />
            </div>
        );

        // PARAMETERS CONTENT
        content[1]=(
            <Container>

                <div className='sectionStyle mb-2'>
                    Parameters
            </div>
                <Row>
                    <Col xs="3" style={{ marginLeft: "18px" }}>
                        <Checkbox
                            checked={this.state.selectedProps.parameters.childIdEnabled}
                            onClick={this.changeEnabled}
                            data-type='id'
                        >Enabled?
                </Checkbox>
                    </Col>
                    <Col>
                        <Selector
                            title={'For Id field'}
                            status={this.state.selectedProps.parameters.childIdEnabled?(this.state.paramArr.length? Status.set:Status.notpossible):Status.notpossible} 
                            onChange={this.changeParam}
                            list={this.state.paramArr}
                            selected={this.state.selectedProps.parameters.childId.name}
                            type='id'
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs="3" style={{ marginLeft: "18px" }}>
                        <Checkbox
                            checked={this.state.selectedProps.parameters.childLabelEnabled}
                            onClick={this.changeEnabled}
                            onChange={this.changeEnabled}
                            data-type='label'
                        >Enabled?
                </Checkbox>
                    </Col>
                    <Col>

                        <Selector
                            title={'For label field'}
                            status={this.state.selectedProps.parameters.childLabelEnabled?
                                (this.state.paramArr.length? Status.set:Status.notpossible):Status.notpossible}
                            onChange={this.changeParam}
                            list={this.state.paramArr}
                            selected={this.state.selectedProps.parameters.childLabel.name}
                            type='label'
                        />
                    </Col>
                </Row>
                <div className='sectionStyle mb-2'>
                    Sheet Interactions
                        </div>

                <Row>
                    <Col xs="3" style={{ marginLeft: "18px" }}>
                        <Checkbox
                            disabled={this.state.filterArr.length&&this.state.filterArr.filter(filter => {
                                let selFields=[this.state.selectedProps.worksheet.childId.fieldName, this.state.selectedProps.worksheet.childLabel.fieldName];
                                return selFields.includes(filter);
                            }).length? false:true}
                            checked={this.state.selectedProps.worksheet.filterEnabled}
                            onClick={this.changeEnabled}
                            data-type='filter'
                        >Enabled?
                </Checkbox>
                    </Col>
                    <Col>

                        <Selector
                            title={'For filter field'}
                            status={this.state.filterArr.length&&this.state.filterArr.filter(filter => {
                                let selFields=[this.state.selectedProps.worksheet.childId.fieldName, this.state.selectedProps.worksheet.childLabel.fieldName];
                                return selFields.includes(filter);
                            }).length? Status.set:Status.notpossible}
                            onChange={this.changeFilter}
                            list={this.state.filterArr.filter(filter => {
                                let selFields=[this.state.selectedProps.worksheet.childId.fieldName, this.state.selectedProps.worksheet.childLabel.fieldName];
                                if (debug) console.log(`selFields: ${ selFields } and filter: ${ filter }`);
                                if (debug) console.log(`selFields.includes(filter): ${ selFields.includes(filter) }`);
                                return selFields.includes(filter);
                            })}
                            selected={this.state.selectedProps.worksheet.filter.fieldName}
                            type='filter'
                        />
                    </Col>
                </Row>
                <Row style={{ marginLeft: "18px" }}>
                    <Checkbox
                        checked={this.state.selectedProps.worksheet.enableMarkSelection}
                        onClick={this.changeEnabled}
                        data-type='mark'
                    >Enable Mark Selection
                </Checkbox>

                </Row>
            </Container>
        );
        //  COLOR CONTENT
        content[2]=(
            <div>
                <Colors bg={this.state.bgColor}
                    onBGChange={this.bgChange}
                    enabled={true}
                />
            </div>
        );
        return (
            <>
                <div className='headerStyle' >
                    Hierarchy Navigator {this.state.loading? this.Loading:undefined}
                </div>

                {this.state.error.map((el, idx) =>
                    el.length?
                        (<h4 style={{ color: 'red' }} className={'m-3'} key={`${ idx }err`}>
                            {el}<br />
                        </h4>):undefined
                )}
                <Tabs
                    // onTabChange={this.changeTabs}
                    selectedTabIndex={this.state.selectedTabIndex}
                    tabs={tabs}
                >
                    <span>{content[this.state.selectedTabIndex]}</span>
                </Tabs>
                <div className='d-flex flex-row-reverse'>
                    <div className='p-2'>
                        {[1, 2].includes(this.state.selectedTabIndex)&&
                            <Button
                                kind='outline'
                                onClick={this.changeTabPrevious}>
                                Previous
                        </Button>
                        }
                        {[0, 1].includes(this.state.selectedTabIndex)&&
                            <Button
                                kind='outline'
                                onClick={this.changeTabNext}>
                                Next
                        </Button>
                        }

                        {this.state.selectedTabIndex===2&&
                            <Button kind={this.state.configComplete? 'filledGreen':'outline'} onClick={this.submit}>{this.state.configComplete? 'Submit':'Cancel'} </Button>
                        }
                    </div>
                </div>
            </>
        );
    }
    private async getParamListAsync() {
        if(debug) console.log(`loadParamList`);
        await this.dashboard.getParametersAsync().then((params: any) => {
            const paramArr: string[]=[];
            const parameters: IParameter[]=[];
            if(debug) console.log(`parameters found`);
            for(const p of params) {
                if(debug) console.log(p);
                if(p.allowableValues.type===tableau.ParameterValueType.All && p.dataType===tableau.DataType.String) {
                    // if(p.dataType===tableau.DataType.String) {
                        paramArr.push(p.name);
                    // }
                    // else if(p.dataType===tableau.DataType.Int) {
                    //     paramIntArr.push(p.name);
                    // }
                    parameters.push({ name: p.name, dataType: p.dataType });
                }
            }
            if(debug) console.log(`parameterList`);
            if(debug) console.log(parameters);
            if (debug) console.log(`paramArr: ${ JSON.stringify(paramArr) }`);
            if(parameters.length>0) {
                // case insensitive sort
                parameters.sort((a, b) =>
                    (a.name.localeCompare(b.name, 'en', { 'sensitivity': 'base' })));
                // paramIntArr.sort();
                paramArr.sort();
                if(debug) console.log(`1. Load Param List`);
                const availableProps=Object.assign({},
                    {
                        worksheets: this.state.availableProps.worksheets,
                        parameters
                    }
                );
                // this.setState({ availableProps, paramIntArr, paramStringArr });
                this.setState({ availableProps, paramArr });
                // this.setParameters();
            };
        });
    }

    private updateError(id: number, str: string): void {
        const err=this.state.error.slice();
        err[id]=str;
        this.setState({ error: err });
    }

    // solve forEach with promise issue - https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    private asyncForEach=async (array: any[], callback: any) => {
        for(let index=0;index<array.length;index++) {
            await callback(array[index], index, array);
        }
    };

    private async getWorksheetFieldsAsync(worksheet: any) {
        try {
            const tempFields: IField[]=[];
            const dataTable: any=await worksheet.getSummaryDataAsync({ maxRows: 1 });
            // .then((dataTable: any) => {
            if(dataTable.columns.length>=2) {
                dataTable.columns.forEach((column: any) => {
                    console.log(`dataTable`);
                    console.log(dataTable);
                    // only allow string values
                    if(column.dataType===tableau.DataType.String) {
                        tempFields.push({ fieldName: column.fieldName, dataType: column.dataType });
                    }
                });
            }
            // })
            console.log(`returning tempFields:`);
            console.log(tempFields);
            return tempFields;
        }
        catch(err) {
            console.error(err);
            return [];
        }
    }

    private async getWorksheetsAsync() {
        // get all worksheets
        this.updateError(1, '');
        if(debug) console.log(`loadWorksheets`);
        const dashboard=window.tableau.extensions.dashboardContent!.dashboard;
        const worksheets: AvailableWorksheet[]=[];
        try {

            await this.asyncForEach(dashboard.worksheets, async (worksheet: any) => {
                if (debug) console.log(`worksheet`);
                if (debug) console.log(worksheet);
                const fields: IField[]=await this.getWorksheetFieldsAsync(worksheet);
                let _filters: IFilterType[]=[];
                if(debug) console.log('fields');
                if(debug) console.log(fields);

                let fieldArr: string[]=[];
                fields.forEach(field => {
                    fieldArr.push(field.fieldName);
                });
                if (debug) console.log(`fields: ${ fieldArr }`);


                await worksheet.getFiltersAsync().then((filters: IFilterType[]) => {
                    if (debug) console.log(`Filters!`);
                    for(var filter of filters) {
                        if (debug) console.log(filter);
                        // if filter field name is in list of available fields, add it here
                        if (debug) console.log(`filter.filterType==='categorical'? ${ filter.filterType==='categorical' }`);
                        if(filter.filterType==='categorical') {

                            _filters.push(filter);
                        }
                    }
                });

                // need at least 2 fields (parent/child) to use this sheet.  filters are optional
                if(fields.length>=2)
                    worksheets.push({ name: worksheet.name, fields, filters: _filters });
            });


            let availableProps=Object.assign({}, this.state.availableProps||defaultAvailableProps, { worksheets });
            if (debug) console.log(`setting (in loadworksheet) availableProps`);
            if (debug) console.log(availableProps);
            this.setState((prevState) => { return { availableProps }; });
        }
        catch(e) {
            if(debug) console.log(`error: ${ e }`);
            this.updateError(1, 'No valid sheets.  Please add a sheet that has at least two columns/dimensions.');
        }
        if(debug) console.log(`finished loadWorksheets`);
    };

    private setSelectedWorksheet(selectedWorksheet: string=this.state.availableProps.worksheets[0].name) {
        if (debug) console.log(`setSelectedWorksheet (${ selectedWorksheet })`);
        const { worksheets }=this.state.availableProps;
        if(worksheets.length) {
            let ws=worksheets.find(ws => ws.name===selectedWorksheet)||defaultWorksheet;
            let selectedProps: ISelectedProps=extend(true, {}, this.state.selectedProps);
            selectedProps.worksheet.name=ws.name;
            this.setState({ selectedProps },
                () => { this.setFieldArrayBasedOnSelectedWorksheet(selectedWorksheet); });

        }
    }
    /*
    Set state.fieldArr based on a change/load of worksheet
    */
    private setFieldArrayBasedOnSelectedWorksheet(selectedWorksheet: string=this.state.availableProps.worksheets[0].name, bContinue: boolean=true) {
        if (debug) console.log(`setFieldArrayBasedOnSelectedWorksheet ${ selectedWorksheet }`);
        const { worksheets }=this.state.availableProps;
        if(debug) console.log(`worksheets.length: ${ worksheets.length }`);
        if(debug) console.log(worksheets);
        if(worksheets.length) {
            let fieldArr: string[]=[];
            let ws=worksheets.find(ws => ws.name===selectedWorksheet)||defaultWorksheet;
            ws.fields.forEach(field => {
                fieldArr.push(field.fieldName);
            });
            if (debug) console.log(`fieldArr: ${ JSON.stringify(fieldArr) }`);
            this.setState({
                fieldArr,
                worksheetStatus: fieldArr.length>=2? Status.set:Status.notpossible
            }, () => { if(bContinue) this.setSelectedFields(selectedWorksheet); });


        }
    }
    private setSelectedFields(selectedWorksheet: string=this.state.availableProps.worksheets[0].name||'') {
        if (debug) console.log(`setSelectedFields (${ selectedWorksheet })`);
        const { worksheets }=this.state.availableProps;
        if(worksheets.length&&this.state.fieldArr.length>=2) {
            let ws=worksheets.find(ws => ws.name===selectedWorksheet)||defaultWorksheet;
            let selectedProps=extend(true, {}, this.state.selectedProps, {
                worksheet: {
                    parentId: ws.fields[0],
                    childId: ws.fields[1],
                    childLabel: ws.fields[0]
                }
            });
            this.setState({ selectedProps },
                () => { this.setFilterArrayBasedOnSelectedWorksheet(selectedWorksheet); });
        }
    }


    /*  
    Set state.filterArr based on a change/load of a worksheet
    */
    private setFilterArrayBasedOnSelectedWorksheet(selectedWorksheet: string=this.state.availableProps.worksheets[0].name, bContinue: boolean=true) {
        if (debug) console.log(`setFilterArrayBasedOnSelectedWorksheet (${ selectedWorksheet })`);
        const { worksheets }=this.state.availableProps;
        if(debug) console.log(`worksheets.length: ${ worksheets.length }`);
        if(debug) console.log(worksheets);
        if(worksheets.length) {

            let filterArr: string[]=[];
            let ws=worksheets.find(ws => ws.name===selectedWorksheet)||defaultWorksheet;
            let _filter=defaultFilter;

            ws.filters.forEach(filter => {
                if(_filter.fieldName==='') {
                    _filter.fieldName=filter.fieldName;
                    _filter.filterType=filter.filterType;
                };
                
                filterArr.push(filter.fieldName);
            });

            if (debug) console.log(`filterArr: ${ JSON.stringify(filterArr) }`);
            this.setState({ filterArr },
                () => { if(bContinue) this.setSelectedFilterBasedOnAllowedFilters(selectedWorksheet); }
            );

        }
    }
    /*
    Set state.selectedProps.worksheet.filter based on state.filterArr 
    (used also when fields are changed but not worksheet)
    */
    private setSelectedFilterBasedOnAllowedFilters(selectedWorksheet: string=this.state.availableProps.worksheets[0].name) {
        if (debug) console.log(`setSelectedFilterBasedOnAllowedFilters (${ selectedWorksheet })`);
        const { worksheets }=this.state.availableProps;
        if(debug) console.log(`worksheets.length: ${ worksheets.length }`);
        if(debug) console.log(worksheets);
        const { selectedProps }=this.state;
        if(worksheets.length) {
            let ws=worksheets.find(ws => ws.name===selectedWorksheet)||defaultWorksheet;
            let _filter=defaultFilter;
            for(let i=0;i<ws.filters.length;i++) {
                if (debug) console.log(`ws.filters[${ i }]: ${ JSON.stringify(ws.filters[i]) }`);
                if (debug) console.log(`ws.filters[${ i }].fieldName: ${ JSON.stringify(ws.filters[i].fieldName) }`);
                if (debug) console.log(`selectedProps.worksheet: ${ JSON.stringify(selectedProps.worksheet) }`);
                // if filter name matches either childId or childLabel fields
                if(ws.filters[i].fieldName===selectedProps.worksheet.childId.fieldName||ws.filters[i].fieldName===selectedProps.worksheet.childLabel.fieldName) {
                    if(_filter.fieldName==='') {
                        _filter={
                            fieldName: ws.filters[i].fieldName,
                            filterType: ws.filters[i].filterType
                        };
                        break;
                    };
                };
            }
            let _selectedProps=extend(true, {}, this.state.selectedProps, {
                worksheet: {
                    filter: { fieldName: _filter.fieldName, filterType: _filter.filterType },
                    filterEnabled: false
                }
            });
            this.setState({ selectedProps: _selectedProps },
                () => { this.setParameters(); });
        }
    }

    // Handles selection in worksheet selection dropdown
    private worksheetChange=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        const worksheet: AvailableWorksheet=this.state.availableProps.worksheets.find(ws => ws.name===e.target.value)||defaultWorksheet;
        if(worksheet.name==='') return;
        this.setSelectedWorksheet(e.target.value);
    };

    // Handles selection of the parent field
    private setParent=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        let prevParentId=this.state.selectedProps.worksheet.parentId;
        if (debug) console.log(`this.state.availProps`);
        if (debug) console.log(JSON.stringify(this.state.availableProps, null, 2));
        if (debug) console.log(`this.state.availProps`);
        if (debug) console.log(JSON.stringify(this.state.availableProps, null, 2));
        const ws=this.state.availableProps.worksheets.find(ws => ws.name===this.state.selectedProps.worksheet.name);
        const parentId=ws!.fields.find(field => field.fieldName===e.target.value)||defaultField;
        if (debug) console.log(`setParent: e.target.val: ${ e.target.value }, availField: ${ JSON.stringify(parentId) }`);

        if(parentId.fieldName==='') return;

        let selectedProps: ISelectedProps=extend(true, {}, this.state.selectedProps);
        selectedProps.worksheet.parentId=parentId;
        // switch names if they are now the same.
        let bSwitch=false;
        if(parentId.fieldName===this.state.selectedProps.worksheet.childId.fieldName) {
            selectedProps.worksheet.childId=prevParentId;
            this.setSelectedFilterBasedOnAllowedFilters(selectedProps.worksheet.name);
            bSwitch=true;
        }
        this.setState(
            { selectedProps },
            () => { if(bSwitch) this.setSelectedFilterBasedOnAllowedFilters(selectedProps.worksheet.name); }
        );
        ;
    };

    // Handles selection of the child field
    private setChild=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        let prevChildId=this.state.selectedProps.worksheet.childId;
        const ws=this.state.availableProps.worksheets.find(ws => ws.name===this.state.selectedProps.worksheet.name);
        const childField=ws!.fields.find(field => field.fieldName===e.target.value)||defaultField;
        if (debug) console.log(`setParent: e.target.val: ${ e.target.value }, availField: ${ JSON.stringify(childField) }`);

        if(childField.fieldName==='') return;

        let selectedProps: ISelectedProps=extend(true, {}, this.state.selectedProps);
        selectedProps.worksheet.childId=childField;
        // switch names if they are now the same.
        if(childField.fieldName===this.state.selectedProps.worksheet.parentId.fieldName) {
            selectedProps.worksheet.parentId=prevChildId;
        }
        this.setState({
            selectedProps
        },
            () => { this.setSelectedFilterBasedOnAllowedFilters(selectedProps.worksheet.name); });

    };
    // Handles selection of the label field
    private setChildLabel=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        if(debug) console.log(`child label field set to ${ e.target.value }`);
        const ws=this.state.availableProps.worksheets.find(ws => ws.name===this.state.selectedProps.worksheet.name);
        const childLabel=ws!.fields.find(field => field.fieldName===e.target.value)||defaultField;

        if(childLabel.fieldName==='') return;

        // set appropriate parameters if field type is changed
        let parameters=this.state.selectedProps.parameters;
        parameters.childLabelEnabled=false;
        let selectedProps: ISelectedProps=extend(true, {}, this.state.selectedProps);
        selectedProps.worksheet.childLabel=childLabel;
        selectedProps.parameters=parameters;
        if (debug) console.log(`setting from setChildLabel`);
        if (debug) console.log(selectedProps);
        this.setState(

            { selectedProps },
            () => { this.setFilterArrayBasedOnSelectedWorksheet(selectedProps.worksheet.name); }
        );
        if (debug) console.log(`calling setSelectedFilter...`);
        if (debug) console.log(`after setSelectedFilter...`);
        if (debug) console.log(this.state.selectedProps);
    };
    private getFieldOfAvailableWorksheets(_field: string): IField {
        let availWorksheet: AvailableWorksheet=this.state.availableProps.worksheets.find(ws => ws.name===this.state.selectedProps.worksheet.name)||defaultWorksheet;
        if(availWorksheet.name==='') return defaultField;
        let availField=availWorksheet.fields.find(field => field.fieldName===_field)||defaultField;
        return availField;
    }

    // Handles selection of the key field
    private changeFilter=(e: React.ChangeEvent<HTMLSelectElement>): void => {

        if(debug) console.log(`filter field set to ${ e.target.value }`);

        const ws=this.state.availableProps.worksheets.find(ws => ws.name===this.state.selectedProps.worksheet.name);
        const filter=ws!.filters.find(field => field.fieldName===e.target.value)||defaultField;

        if(filter.fieldName==='') return;
        let selectedProps: ISelectedProps=extend(true, {}, this.state.selectedProps);
        selectedProps.worksheet.filter={fieldName: filter.fieldName};
        this.setState({
            selectedProps
        });
        // this.validateSettings(false);
    };

    private changeEnabled(e: any) {
        if (debug) console.log(`event type change param enabled`);
        if (debug) console.log(e);
        const target=e.target;
        const type: string|null=target.getAttribute('data-type');
        if(typeof type==='string') {
            if(debug) console.log(`changing param enabled for ${ type }`);
            let selectedProps: ISelectedProps=extend(true, {}, this.state.selectedProps);
            // let lengthOfCurrentArr=0;
            let lengthOfCurrentArr=this.state.paramArr.length;
            switch(type) {
                case 'id':
                    if (debug) console.log(`selectedProps.parameters.childId.dataType: ${ selectedProps.parameters.childId.dataType }`);
                    if (debug) console.log(`selectedProps.parameters.childLabel.dataType: ${ selectedProps.parameters.childLabel.dataType }`);
                    if(!lengthOfCurrentArr) return;
                    selectedProps.parameters.childIdEnabled=e.target.checked;
                    if(selectedProps.parameters.childId.name===selectedProps.parameters.childLabel.name&&e.target.checked&&selectedProps.parameters.childLabelEnabled) {
                        selectedProps.parameters.childLabelEnabled=false;
                    }
                    break;
                case 'label':
                    if(!lengthOfCurrentArr) return;
                    selectedProps.parameters.childLabelEnabled=e.target.checked;
                    // here we check if there is only 1 param
                    if (debug) console.log(`lengthOfCurrentArr (${ lengthOfCurrentArr }) for label; childIdEnabled? ${ selectedProps.parameters.childIdEnabled }`);

                    if (debug) console.log(`selectedProps.parameters.childId.name===selectedProps.parameters.childLabel.name && e.target.checked && selectedProps.parameters.childIdEnabled: ${ selectedProps.parameters.childId.name===selectedProps.parameters.childLabel.name&&e.target.checked&&selectedProps.parameters.childIdEnabled }`);

                    if (debug) console.log(`selectedProps.parameters.childId.name: ${ selectedProps.parameters.childId.name }`);
                    if (debug) console.log(`selectedProps.parameters.childLabel.name: ${ selectedProps.parameters.childLabel.name }`);

                    if (debug) console.log(`selectedProps.parameters.childId.name===selectedProps.parameters.childLabel.name: ${ selectedProps.parameters.childId.name===selectedProps.parameters.childLabel.name }`);

                    if (debug) console.log(`e.target.checked: ${ e.target.checked }`);

                    if (debug) console.log(`selectedProps.parameters.childIdEnabled: ${ selectedProps.parameters.childIdEnabled }`);

                    if(selectedProps.parameters.childId.name===selectedProps.parameters.childLabel.name&&e.target.checked&&selectedProps.parameters.childIdEnabled) {
                        selectedProps.parameters.childIdEnabled=false;
                    }
                    break;
                case 'filter':
                    selectedProps.worksheet.filterEnabled=e.target.checked;
                    break;
                case 'mark':
                    selectedProps.worksheet.enableMarkSelection=e.target.checked;
                    break;
            }
            this.setState({ selectedProps });
        }
    }

    private loadExtensionSettings=async () => {
        this.setState({ loading: true });
        let settings=window.tableau.extensions.settings.getAll();

        const _configComplete=settings.configComplete==='true'? true:false;
        const _selectedProps=typeof settings.selectedProps==='undefined'? defaultSelectedProps:JSON.parse(settings.selectedProps);
        if(debug) console.log(`loading settings`);
        if(debug) console.log(settings);

        if(settings.configComplete) {
            this.setState({
                configComplete: _configComplete,
                selectedProps: _selectedProps,
                bgColor: settings.bgColor
            });
            this.validateSettings(false);
        }
        else {
            this.clearSettings();
        }
        this.setState({ loading: false });
    };
    private async validateSettings(bLoad: boolean=false): Promise<any> {
        try {
            this.setState({ loading: true });
            if(debug) console.log(`starting validate worksheets/fields/filters and parameters - bLoad=${ bLoad }`);
            await this.getWorksheetsAsync();
            await this.getParamListAsync();

            if (debug) console.log(`starting bLoad logic`);
            // check existing  settings
            if(bLoad) {

                // parameter logic
                this.updateError(0, '');
                let _selectedProps: ISelectedProps;
                let worksheetStatus: Status;
                if (debug) console.log(`current availableProps`);
                if (debug) console.log(this.state.availableProps);
                // worksheet/filter/sheet logic
                const { worksheets }=this.state.availableProps;
                if(worksheets.length) {
                    // assign fields of first worksheet

                    if(debug) console.log(`setting worksheet state`);
                    this.setState({ selectedProps: defaultSelectedProps }, () => {
                        this.setSelectedWorksheet();
                    });

                    if (debug) console.log(`what are props in VALIDATE\n${ JSON.stringify(this.state, null, 2) }`);
                }
                else {
                    worksheetStatus=Status.notpossible;
                    _selectedProps=defaultSelectedProps;
                    this.updateError(1, 'Err 1001. No valid sheets.  Please add a sheet that has at least two columns/dimensions.');
                }
            }
            else {
                this.setFieldArrayBasedOnSelectedWorksheet(this.state.selectedProps.worksheet.name, false);
                await this.setFilterArrayBasedOnSelectedWorksheet(this.state.selectedProps.worksheet.name, false);
                // validate existing settings
                let bFound=false;
                let { worksheet }=this.state.selectedProps;
                for(var availWorksheet of this.state.availableProps.worksheets) {
                    if(availWorksheet.name===worksheet.name) {
                        bFound=true;
                        break;
                    }
                }

                if(!bFound) {
                    if (debug) console.log(`can't validate existing worksheet - reload`);
                    return this.validateSettings(true);
                }
                bFound=false;
                // validate worksheet/fields
                const foundWorksheet=this.state.availableProps.worksheets.find((ws) => ws.name===worksheet.name)||{ fields: [] };
                if(foundWorksheet?.fields.length<2) {
                    if (debug) console.log(`can't validate existing worksheet has 2+ fields - reload`);
                    return this.validateSettings(true);
                }
                else
                    for(var availFields of foundWorksheet.fields) {
                        if(availFields.fieldName===worksheet.childId.fieldName) {
                            bFound=true;
                            break;
                        }
                    }

                if(!bFound) {
                    if (debug) console.log(`can't validate existing childiId field - reload`);
                    return this.validateSettings(true);
                }
                bFound=false;
                for(var availFields of foundWorksheet.fields) {
                    if(availFields.fieldName===worksheet.parentId.fieldName) {
                        bFound=true;
                        break;
                    }
                }

                if(!bFound) {
                    if (debug) console.log(`can't validate existing parentId field - reload`);
                    return this.validateSettings(true);
                }
                bFound=false;
                for(var availFields of foundWorksheet.fields) {
                    if(availFields.fieldName===worksheet.childLabel.fieldName) {
                        bFound=true;
                        break;
                    }
                }
                if(!bFound) {
                    if (debug) console.log(`can't validate existing childLabel field- reload`);
                    return this.validateSettings(true);
                }
                bFound=false;
                if(worksheet.filterEnabled) {
                    for(var availFilters of foundWorksheet.fields) {
                        if(availFilters.fieldName===worksheet.filter.fieldName) {
                            bFound=true;
                            break;
                        }
                    }
                    if(!bFound) {
                        if (debug) console.log(`can't validate existing worksheet filter - reload`);
                        return this.validateSettings(true);
                    }
                }
                bFound=false;
                // validate params, if they are enabled
                let { childId, childLabel, childIdEnabled, childLabelEnabled }=this.state.selectedProps.parameters;
                if (debug) console.log(`childIdEnabled? ${ childIdEnabled }`);
                if(childIdEnabled) {
                    for(var availParam of this.state.paramArr) {
                        if(availParam===childId.name) {
                            bFound=true;
                            break;
                        }
                    }
                    if(!bFound) {
                        if (debug) console.log(`can't validate existing childId Param - reload`);
                        return this.validateSettings(true);
                    }
                }
                bFound=false;
                if(childLabelEnabled) {
                    for(var availParam of this.state.paramArr) {
                        if(availParam===childLabel.name) {
                            bFound=true;
                            break;
                        }
                    }
                    if(!bFound) {
                        if (debug) console.log(`can't validate existing childLabel Param - reload`);
                        return this.validateSettings(true);
                    }
                }
            }

            // if we get this far, all's good
            this.setState({
                configComplete: true,
                loading: false,
                worksheetStatus: Status.set
            });
            if (debug) console.log(`final state after load
        ${JSON.stringify(this.state, null, 2) }
        `);
            if (debug) console.log(this.state);
            if(debug) console.log(`successfully completed validate fields`);
        }
        catch(err) {
            this.clearSettings();
            console.error(err);
        }
    }
    private setParameters() {
        if (debug) console.log(`setParameters`);
        let selectedProps: ISelectedProps=extend(true, {}, this.state.selectedProps);
                if (debug) console.log(`2 - childId.dataType===string`);
                if(this.state.paramArr.length>=2) {
                    if (debug) console.log(`3 -- paramStrArr.length >= 2`);
                    selectedProps.parameters.childId=this.state.availableProps.parameters.find(p => p.name===this.state.paramArr[0])||defaultParameter;
                    selectedProps.parameters.childLabel=this.state.availableProps.parameters.find(p => p.name===this.state.paramArr[1])||defaultParameter;
                }
                else if(this.state.paramArr.length>=1) {
                    if (debug) console.log(`4`);
                    selectedProps.parameters.childId=this.state.availableProps.parameters.find(p => p.name===this.state.paramArr[0])||defaultParameter;
                }
        selectedProps.parameters.childIdEnabled=false;
        selectedProps.parameters.childLabelEnabled=false;
        if (debug) console.log(`selectedProps in SETINITIALPARAMETERS: \n${ JSON.stringify(selectedProps, null, 2) }`);
        this.setState({ selectedProps }, () => { this.clearMarkSelection(); });
    }
    private clearMarkSelection() {
        let selectedProps: ISelectedProps=extend(true, {}, this.state.selectedProps);
        selectedProps.worksheet.enableMarkSelection=false;
        this.setState({ selectedProps });
    }
    // Handles change in background color input
    private bgChange=(color: any): void => {
        this.setState({ bgColor: color.target.value });
    };

    private changeParam=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        const type: string|null=e.target.getAttribute('data-type');
        if (debug) console.log(`all state: 
        ${JSON.stringify(this.state, null, 2) }`);
        if(typeof type==='string') {

            // check to see if we can even enable (length of current array >= 1)

            const { parameters: availParameters }=this.state.availableProps;
            const newParam=availParameters.find(param => param.name===e.target.value)||defaultParameter;
            const prevChildId: IParameter=extend({}, this.state.selectedProps.parameters.childId);
            if (debug) console.log(`prevChildId: ${ JSON.stringify(prevChildId, null, 2) }`);

            const prevChildLabel: IParameter=this.state.selectedProps.parameters.childLabel;
            if (debug) console.log(`prevChildLabel: ${ JSON.stringify(prevChildLabel, null, 2) }`);
            let childId=prevChildId;
            let childLabel=prevChildLabel;
            // if new value is same as existing other value than switch, but only to the same type (string/int)
            if(type==='id') {
                childId=newParam;
                if(prevChildLabel.name===e.target.value) {
                    childLabel=prevChildId; // switch values if they are the same
                }
            }
            else if(type==='label') {
                childLabel=newParam;
                if(prevChildId.name===e.target.value) {
                    childId=prevChildLabel; // switch values if they are the same
                }

            }

            if(debug) console.log(`childId param set to ${ JSON.stringify(prevChildId) }`);
            if(debug) console.log(`childLabel param set to ${ JSON.stringify(prevChildLabel) }`);
            const selectedProps=extend(true, {}, this.state.selectedProps, { parameters: { childId, childLabel } });
            if (debug) console.log(`setting (finally): ${ JSON.stringify(selectedProps, null, 2) }`);
            this.setState({
                selectedProps
            });
        }
    };

    // Clears setting for which tableau parameter to update
    // Don't update the saved settings until the user clicks Okay (or cancels)
    private clearSettings=async (): Promise<void> => {
        if(debug) console.log(`clearSettings`);
        this.setState({
            bgColor: '#F3F3F3',  // tableau default background color
            configComplete: false,
            error: [],
            loading: false,
            parameterStatus: Status.notpossible,
            availableProps: defaultAvailableProps,
            selectedProps: defaultSelectedProps,
            worksheetStatus: Status.notset,
        });
        if (debug) console.log(`calling validateSettings from clearSettings`);
        this.validateSettings(true);


    };

    // Saves settings and closes configure dialog
    private submit=(): void => {
        // if the user hits Clear the parameter will not be configured so save 'configured' state from that
        if(debug) console.log(`submitting settings...`);
        if(debug) console.log(this.state);
        window.tableau.extensions.settings.set('configComplete', this.state.configComplete.toString());
        window.tableau.extensions.settings.set('selectedProps', JSON.stringify(this.state.selectedProps));
        window.tableau.extensions.settings.set('bgColor', this.state.bgColor.toString());

        window.tableau.extensions.settings.saveAsync().then(() => {
            window.tableau.extensions.ui.closeDialog(this.state.configComplete.toString());
        })
            .catch((err: any) => {
                if(debug) console.log(`an error occurred closing the dialogue box: ${ err } ${ err.stack }`);
            });
    };
    private changeTabs(index: number) {
        if(debug) console.log(`onChange tab index: ${ index }`);
        this.setState({ selectedTabIndex: index });
    }
    private changeTabNext() {
        if(debug) console.log(`onChange tab next: ${ this.state.selectedTabIndex }`);
        if(this.state.selectedTabIndex<2)
            this.setState((prevState) => { return { selectedTabIndex: prevState.selectedTabIndex+1 }; });
    }
    private changeTabPrevious() {
        if(debug) console.log(`onChange tab previous: ${ this.state.selectedTabIndex }`);
        if(this.state.selectedTabIndex>0)
            this.setState((prevState) => { return { selectedTabIndex: prevState.selectedTabIndex-1 }; });
    }
}

export default Configure;
ReactDOM.render(<Configure />, document.getElementById('container'));