/* tslint:disable:jsx-no-lambda */
import { Extensions } from '@tableau/extensions-api-types';
import * as t from '@tableau/extensions-api-types';
import { Button } from '@tableau/tableau-ui';

import 'babel-polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Button as RSButton, Col, Container, Row } from 'reactstrap';
import '../../css/style.css';
import flatHier from '../../images/FlatHier.jpeg';
import recursiveHier from '../../images/RecursiveHier.jpeg';
import Colors from './Colors';
import {
    AvailableProps, AvailableWorksheet, debug, defaultField, defaultFilter, defaultParameter,  defaultSelectedProps, Field, FilterType, HierType, Parameter, SelectedProps, Status
} from './Interfaces';
import { Page2Flat } from './Page2Flat';
import { Page2Recursive } from './Page2Recursive';
import { Page3 } from './Page3Flat';

const extend=require('extend');

declare global {
    interface Window { tableau: { extensions: Extensions; }; }
}

export interface State {
    configComplete: boolean, // is the extension configured ? 
    error: string[]; // array to hold any errors 0 = param, 1 = sheet, 2 = other
    availableProps: AvailableProps; // hold all available worksheets, fields, filters, parameters
    selectedProps: SelectedProps; // hold selected worksheet
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
        availableProps: defaultAvailableProps,
        bgColor: '#F3F3F3',  // tableau default background color
        configComplete: false,
        error: [],
        fieldArr: [],
        filterArr: [],
        loading: false,
        paramArr: [],
        parameterStatus: Status.notpossible,
        selectedProps: defaultSelectedProps,
        selectedTabIndex: 0,
        worksheetStatus: Status.notset,
    };


    private dashboard: t.Dashboard;
    private loading: string=' -- Loading...';
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
        this.changeHierType=this.changeHierType.bind(this);
        this.setStatePassThru=this.setStatePassThru.bind(this);
        window.tableau.extensions.initializeDialogAsync().then(() => {
            this.dashboard=window.tableau.extensions.dashboardContent!.dashboard;
            this.loadExtensionSettings();
        });

    }
    public getStyle(style: HierType) {
        console.log(`calling getStyle`);
        console.log(`style=${ style } and this.state.selectedProps.type=${ this.state.selectedProps.type }`);
        if((style===HierType.FLAT&&this.state.selectedProps.type===HierType.FLAT)||
            (style===HierType.RECURSIVE&&this.state.selectedProps.type===HierType.RECURSIVE)) {
            return { background: 'lightblue' };
        }
        return {};
    }
    public setStatePassThru(obj: any) {
        const self=this;
        self.setState(obj);
    }
    public render() {
        console.log(`start of render`);
        console.log(`props - start of render???`);
        console.log(this.props);

        const page: Array<{ name: string, content: React.ReactFragment; }>=[{ name: 'Hierarchy Type', content: (<div />) }, { name: 'Sheet/Fields', content: (<div />) }, { name: 'Interactions', content: (<div />) }, { name: 'Display', content: (<div />) }];
        // WORKSHEET CONTENT
        page[0].content=(
            <div className='sectionStyle mb-5'>
                <b>Hierarchy Type</b><br />
            Select your data type. The source hierarchy should be on a separate sheet (can be hidden).
                <p />
                <Row>

                    <Col onClick={() => this.changeHierType(HierType.FLAT)} className='centerChildren sectionStyle' style={this.getStyle(HierType.FLAT)}>
                        <b>Dimensional </b><br />
                        <img src={flatHier} /><br />
                    Description: Levels of the hierarchy are in separate columns/dimensions.
            </Col>
                    <Col onClick={() => this.changeHierType(HierType.RECURSIVE)} className='centerChildren sectionStyle' style={this.state.selectedProps.type===HierType.RECURSIVE? { background: 'lightblue' }:{}}>
                        <b>Recursive</b> <br />
                        <img src={recursiveHier} /><br />
                    Description: Relationships are stored in a parent/child relationship.
            </Col>
                </Row>
            </div>
        );
        //  COLOR CONTENT
        page[3].content=(
            <div>
                <Colors bg={this.state.bgColor}
                    onBGChange={this.bgChange}
                    enabled={true}
                />
            </div>
        );

        const self=this;
        function returnPage(index: number) {
            switch(index) {
                case 0:
                case 3:
                    return (<span>{page[index].content}</span>);
                case 1:
                    if(self.state.selectedProps.type===HierType.FLAT) {
                        return <Page2Flat
                            // self={self} 
                            // page={page} 
                            debug={debug}
                            availableProps={self.state.availableProps}
                            selectedProps={self.state.selectedProps}
                            paramArr={self.state.paramArr}
                            filterArr={self.state.filterArr}
                            fieldArr={self.state.fieldArr}
                            worksheetStatus={self.state.worksheetStatus}
                            setStatePassThru={self.setStatePassThru}
                            setChild={self.setChild}
                            worksheetChange={self.worksheetChange}
                        />;
                    }

                    else if(self.state.selectedProps.type===HierType.RECURSIVE) {
                        return <Page2Recursive
                            availableProps={self.state.availableProps}
                            selectedProps={self.state.selectedProps}
                            worksheetStatus={self.state.worksheetStatus}
                            debug={debug}
                            setParent={self.setParent}
                            setChild={self.setChild}
                            setChildLabel={self.setChildLabel}
                            fieldArr={self.state.fieldArr}
                            worksheetChange={self.worksheetChange}
                        />;
                    }

                case 2:
                    return <Page3
                        debug={debug}
                        fieldArr={self.state.fieldArr}
                        availableProps={self.state.availableProps}
                        selectedProps={self.state.selectedProps}
                        paramArr={self.state.paramArr}
                        filterArr={self.state.filterArr}
                        worksheetStatus={self.state.worksheetStatus}
                        type={self.state.selectedProps.type}
                        changeEnabled={self.changeEnabled}
                        changeParam={self.changeParam}
                        changeFilter={self.changeFilter}
                        setStatePassThru={self.setStatePassThru}
                    />;

                default:
                    return (<div>Not here yet</div>);
            }
        }
        return (
            <>
                <div className='headerStyle' >
                    Hierarchy Navigator {this.state.loading? this.loading:undefined}
                </div>

                {this.state.error.map((el, idx) =>
                    el.length?
                        (<h4 style={{ color: 'red' }} className={'m-3'} key={`${ idx }err`}>
                            {el}<br />
                        </h4>):undefined
                )}
                <Container className='navcontainer'>
                    <Row>
                        <Col>
                            <Row>

                                <RSButton type='button' className='btn btn-default btn-circle' color='primary'>1
                            </RSButton>
                            </Row>
                            <Row className='noMargin'>
                                {page[0].name}
                            </Row>
                        </Col>
                        <Col className='narrow'>
                            <div className='userhr' />
                        </Col>
                        <Col>
                            <Row>

                                <RSButton type='button' className='btn btn-default btn-circle' color={this.state.selectedTabIndex>=1? 'primary':'secondary'}>2
                            </RSButton>
                            </Row>
                            <Row className='noMargin'>
                                {page[1].name}
                            </Row>
                        </Col>
                        <Col className='narrow'>
                            <div className='userhr' />
                        </Col>
                        <Col>
                            <Row>

                                <RSButton type='button' className='btn btn-default btn-circle' color={this.state.selectedTabIndex>=2? 'primary':'secondary'} active={false}>3
                            </RSButton>
                            </Row>
                            <Row className='noMargin'>
                                {page[2].name}
                            </Row>
                        </Col>
                        <Col className='narrow'>
                            <div className='userhr' />
                        </Col>
                        <Col>
                            <Row>

                                <RSButton type='button' className='btn btn-default btn-circle' color={this.state.selectedTabIndex>=3? 'primary':'secondary'} active={false}>4
                            </RSButton>
                            </Row>
                            <Row className='noMargin'>
                                {page[3].name}
                            </Row>
                        </Col>


                    </Row>

                </Container>
                {returnPage(this.state.selectedTabIndex)}

                <div className='d-flex flex-row-reverse'>
                    <div className='p-2'>
                        {[1, 2, 3].includes(this.state.selectedTabIndex)&&
                            <Button
                                kind='outline'
                                onClick={this.changeTabPrevious}>
                                Previous
                        </Button>
                        }
                        {[0, 1, 2].includes(this.state.selectedTabIndex)&&
                            <Button
                                kind='outline'
                                onClick={this.changeTabNext}>
                                Next
                        </Button>
                        }

                        {this.state.selectedTabIndex===3&&
                            <Button kind={this.state.configComplete? 'filledGreen':'outline'} onClick={this.submit}>{this.state.configComplete? 'Submit':'Cancel'} </Button>
                        }
                    </div>
                </div>
                {console.log(`end of render`)}
            </>
        );
    }

    // retrieve parameters for the dashboard
    private async getParamListAsync() {
        if(debug) { console.log(`loadParamList`); }
        await this.dashboard.getParametersAsync().then((params: any) => {
            const paramArr: string[]=[];
            const parameters: Parameter[]=[];
            if(debug) { console.log(`parameters found`); }
            for(const p of params) {
                if(debug) { console.log(p); }
                if(p.allowableValues.type===tableau.ParameterValueType.All&&p.dataType===tableau.DataType.String) {
                    paramArr.push(p.name);
                    parameters.push({ name: p.name, dataType: p.dataType });
                }
            }
            if(debug) {
                console.log(`parameterList`);
                console.log(parameters);
                console.log(`paramArr: ${ JSON.stringify(paramArr) }`);
            }
            if(parameters.length>0) {
                // case insensitive sort
                parameters.sort((a, b) =>
                    (a.name.localeCompare(b.name, 'en', { 'sensitivity': 'base' })));
                // paramIntArr.sort();
                paramArr.sort();
                if(debug) { console.log(`1. Load Param List`); }
                const availableProps=Object.assign({},
                    {
                        parameters,
                        worksheets: this.state.availableProps.worksheets,
                    }
                );
                this.setState({ availableProps, paramArr });
            };
        });
    }

    // helper function to set error messages
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
        console.log(`getWorksheetFieldAsync`);
        try {
            const tempFields: Field[]=[];
            const dataTable: any=await worksheet.getSummaryDataAsync({ maxRows: 1 });
            if(dataTable.columns.length>=2) {
                dataTable.columns.forEach((column: any) => {
                    if(debug) {
                        console.log(`dataTable: vvv`);
                        console.log(dataTable);
                    }
                    // only allow string values
                    if(column.dataType===tableau.DataType.String) {
                        tempFields.push({ fieldName: column.fieldName, dataType: column.dataType });
                    }
                });
            }
            return tempFields;
        }
        catch(err) {
            console.error(err);
            return [];
        }
    }

    // get all worksheets
    private async getWorksheetsAsync() {
        console.log(`getWorksheetsAsync`);
        this.updateError(1, '');
        if(debug) { console.log(`loadWorksheets`); }
        const dashboard=window.tableau.extensions.dashboardContent!.dashboard;
        const worksheets: AvailableWorksheet[]=[];
        try {

            await this.asyncForEach(dashboard.worksheets, async (worksheet: any) => {
                if(debug) {
                    console.log(`worksheet: vvv`);
                    console.log(worksheet);
                }
                const fields: Field[]=await this.getWorksheetFieldsAsync(worksheet);
                const _filters: FilterType[]=[];
                if(debug) {
                    console.log('fields: vvv');
                    console.log(fields);
                }

                const fieldArr: string[]=[];
                fields.forEach(field => {
                    fieldArr.push(field.fieldName);
                });
                if(debug) { console.log(`fields: ${ fieldArr }`); }


                await worksheet.getFiltersAsync().then((filters: FilterType[]) => {
                    if(debug) { console.log(`Filters!`); }
                    for(const filter of filters) {
                        if(debug) { console.log(filter); }
                        // if filter field name is in list of available fields, add it here
                        if(debug) { console.log(`filter.filterType==='categorical'? ${ filter.filterType==='categorical' }`); }
                        if(filter.filterType==='categorical') {
                            _filters.push(filter);
                        }
                    }
                });

                // need at least 2 fields (parent/child) to use this sheet.  filters are optional
                if(fields.length>=2) {
                    worksheets.push({ name: worksheet.name, fields, filters: _filters });
                }
            });

            const availableProps=Object.assign({}, this.state.availableProps||defaultAvailableProps, { worksheets });
            if(debug) { console.log(`setting (in loadworksheet) availableProps`); }
            if(debug) { console.log(availableProps); }
            this.setState((prevState) => ({ availableProps }));
        }
        catch(e) {
            if(debug) { console.log(`error: ${ e }`); }
            this.updateError(1, 'No valid sheets.  Please add a sheet that has at least two columns/dimensions.');
        }
        if(debug) { console.log(`finished loadWorksheets`); }
    };

    // set a selected worksheet in the UI
    private setSelectedWorksheet(selectedWorksheet: string=this.state.availableProps.worksheets[0].name) {
        if(debug) { console.log(`setSelectedWorksheet (${ selectedWorksheet })`); }
        const { worksheets }=this.state.availableProps;
        if(worksheets.length) {
            const ws=worksheets.find(_ws => _ws.name===selectedWorksheet)||defaultWorksheet;
            const selectedProps: SelectedProps=extend(true, {}, this.state.selectedProps);
            selectedProps.worksheet.name=ws.name;
            this.setState({ selectedProps },
                () => { this.setFieldArrayBasedOnSelectedWorksheet(selectedWorksheet); });

        }
    }
    /*
    Set state.fieldArr based on a change/load of worksheet
    */
    private setFieldArrayBasedOnSelectedWorksheet(selectedWorksheet: string=this.state.availableProps.worksheets[0].name, bContinue: boolean=true) {
        if(debug) { console.log(`setFieldArrayBasedOnSelectedWorksheet ${ selectedWorksheet }`); }
        const { worksheets }=this.state.availableProps;
        if(debug) { console.log(`worksheets.length: ${ worksheets.length }`); }
        if(debug) { console.log(worksheets); }
        if(worksheets.length) {
            const fieldArr: string[]=[];
            const ws=worksheets.find(_ws => _ws.name===selectedWorksheet)||defaultWorksheet;
            ws.fields.forEach(field => {
                fieldArr.push(field.fieldName);
            });
            if(debug) { console.log(`fieldArr: ${ JSON.stringify(fieldArr) }`); }
            this.setState({
                fieldArr,
                worksheetStatus: fieldArr.length>=2? Status.set:Status.notpossible
            }, () => { if(bContinue) { this.setSelectedFields(selectedWorksheet); } });
        }
    }
    // set fields based on selected worksheet
    private setSelectedFields(selectedWorksheet: string=this.state.availableProps.worksheets[0].name||'') {
        if(debug) { console.log(`setSelectedFields (${ selectedWorksheet })`); }
        const { worksheets }=this.state.availableProps;
        if(worksheets.length&&this.state.fieldArr.length>=2) {
            const ws=worksheets.find(_ws => _ws.name===selectedWorksheet)||defaultWorksheet;
            const selectedProps=extend(true, {}, this.state.selectedProps, {
                worksheet: {
                    childId: ws.fields[1],
                    childLabel: ws.fields[0],
                    parentId: ws.fields[0],
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
        if(debug) { console.log(`setFilterArrayBasedOnSelectedWorksheet (${ selectedWorksheet })`); }
        const { worksheets }=this.state.availableProps;
        if(debug) { console.log(`worksheets.length: ${ worksheets.length }`); }
        console.log(worksheets);
        if(worksheets.length) {

            const filterArr: string[]=[];
            const ws=worksheets.find(_ws => _ws.name===selectedWorksheet)||defaultWorksheet;
            const _filter=defaultFilter;

            ws.filters.forEach(filter => {
                if(_filter.fieldName==='') {
                    _filter.fieldName=filter.fieldName;
                    _filter.filterType=filter.filterType;
                };

                filterArr.push(filter.fieldName);
            });

            if(debug) { console.log(`filterArr: ${ JSON.stringify(filterArr) }`); }
            this.setState({ filterArr },
                () => { if(bContinue) { this.setSelectedFilterBasedOnAllowedFilters(selectedWorksheet); } }
            );

        }
    }
    /*
    Set state.selectedProps.worksheet.filter based on state.filterArr 
    (used also when fields are changed but not worksheet)
    */
    private setSelectedFilterBasedOnAllowedFilters(selectedWorksheet: string=this.state.availableProps.worksheets[0].name) {
        if(debug) { console.log(`setSelectedFilterBasedOnAllowedFilters (${ selectedWorksheet })`); }
        const { worksheets }=this.state.availableProps;
        if(debug) { console.log(`worksheets.length: ${ worksheets.length }`); }
        if(debug) { console.log(worksheets); }
        const { selectedProps }=this.state;
        if(worksheets.length) {
            const ws=worksheets.find(_ws => _ws.name===selectedWorksheet)||defaultWorksheet;
            let _filter=defaultFilter;
            for(let i=0;i<ws.filters.length;i++) {
                if(debug) { console.log(`ws.filters[${ i }]: ${ JSON.stringify(ws.filters[i]) }`); }
                if(debug) { console.log(`ws.filters[${ i }].fieldName: ${ JSON.stringify(ws.filters[i].fieldName) }`); }
                if(debug) { console.log(`selectedProps.worksheet: ${ JSON.stringify(selectedProps.worksheet) }`); }
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
            const _selectedProps=extend(true, {}, this.state.selectedProps, {
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
        const worksheet: AvailableWorksheet=this.state.availableProps.worksheets.find(_ws => _ws.name===e.target.value)||defaultWorksheet;
        if(worksheet.name==='') { return; }
        this.setSelectedWorksheet(e.target.value);
    };

    // Handles selection of the parent field
    private setParent=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        const prevParentId=this.state.selectedProps.worksheet.parentId;
        if(debug) {
            console.log(`this.state.availProps: vvv`);
            console.log(JSON.stringify(this.state.availableProps, null, 2));
            console.log(`this.state.selectedProps: vvv`);
            console.log(JSON.stringify(this.state.selectedProps, null, 2));
        }
        const ws=this.state.availableProps.worksheets.find(_ws => _ws.name===this.state.selectedProps.worksheet.name);
        const parentId=ws!.fields.find(field => field.fieldName===e.target.value)||defaultField;
        if(debug) { console.log(`setParent: e.target.val: ${ e.target.value }, availField: ${ JSON.stringify(parentId) }`); }
        if(parentId.fieldName==='') { return; }

        const selectedProps: SelectedProps=extend(true, {}, this.state.selectedProps);
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
            () => { if(bSwitch) { this.setSelectedFilterBasedOnAllowedFilters(selectedProps.worksheet.name); } }
        );
        ;
    };

    // Handles selection of the child field
    private setChild=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        const prevChildId=this.state.selectedProps.worksheet.childId;
        const ws=this.state.availableProps.worksheets.find(_ws => _ws.name===this.state.selectedProps.worksheet.name);
        const childField=ws!.fields.find(field => field.fieldName===e.target.value)||defaultField;
        if(debug) { console.log(`setParent: e.target.val: ${ e.target.value }, availField: ${ JSON.stringify(childField) }`); }

        if(childField.fieldName==='') { return; }

        const selectedProps: SelectedProps=extend(true, {}, this.state.selectedProps);
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
        if(debug) { console.log(`child label field set to ${ e.target.value }`); }
        const ws=this.state.availableProps.worksheets.find(_ws => _ws.name===this.state.selectedProps.worksheet.name);
        const childLabel=ws!.fields.find(field => field.fieldName===e.target.value)||defaultField;

        if(childLabel.fieldName==='') { return; }

        // set appropriate parameters if field type is changed
        const parameters=this.state.selectedProps.parameters;
        parameters.childLabelEnabled=false;
        const selectedProps: SelectedProps=extend(true, {}, this.state.selectedProps);
        selectedProps.worksheet.childLabel=childLabel;
        selectedProps.parameters=parameters;
        if(debug) { console.log(`setting from setChildLabel`); }
        if(debug) { console.log(selectedProps); }
        this.setState(

            { selectedProps },
            () => { this.setFilterArrayBasedOnSelectedWorksheet(selectedProps.worksheet.name); }
        );
    };

    // Handles selection of the key field
    private changeFilter=(e: React.ChangeEvent<HTMLSelectElement>): void => {

        if(debug) { console.log(`filter field set to ${ e.target.value }`); }

        const ws=this.state.availableProps.worksheets.find(_ws => _ws.name===this.state.selectedProps.worksheet.name);
        const filter=ws!.filters.find(field => field.fieldName===e.target.value)||defaultField;

        if(filter.fieldName==='') { return; }
        const selectedProps: SelectedProps=extend(true, {}, this.state.selectedProps);
        selectedProps.worksheet.filter={ fieldName: filter.fieldName };
        this.setState({
            selectedProps
        });
    };

    // event fired when one of the parameters/filter/mark selection is changed
    private changeEnabled(e: any) {
        if(debug) {
            console.log(`event type change param enabled: vvv`);
            console.log(e);
        }
        const target=e.target;
        const type: string|null=target.getAttribute('data-type');
        if(typeof type==='string') {
            if(debug) { console.log(`changing param enabled for ${ type }`); }
            const selectedProps: SelectedProps=extend(true, {}, this.state.selectedProps);
            const lengthOfCurrentArr=this.state.paramArr.length;
            switch(type) {
                case 'id':
                    if(!lengthOfCurrentArr) { return; }
                    selectedProps.parameters.childIdEnabled=e.target.checked;
                    if(selectedProps.parameters.childId.name===selectedProps.parameters.childLabel.name&&e.target.checked&&selectedProps.parameters.childLabelEnabled||(lengthOfCurrentArr===1&&e.target.checked)) {
                        selectedProps.parameters.childLabelEnabled=false;
                    }
                    break;
                case 'label':
                    if(!lengthOfCurrentArr) { return; }
                    selectedProps.parameters.childLabelEnabled=e.target.checked;
                    // here we check if there is only 1 param
                    if(selectedProps.parameters.childId.name===selectedProps.parameters.childLabel.name&&e.target.checked&&selectedProps.parameters.childIdEnabled||(lengthOfCurrentArr===1&&e.target.checked)) {
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

    // load settings upon opening configuration dialogue
    private loadExtensionSettings=async () => {
        console.log(`loadExtensionSettings`);
        this.setState({ loading: true });
        const settings: any=window.tableau.extensions.settings.getAll();

        settings.configComplete==='true'? settings.configComplete=true:settings.configComplete=false;
        if(typeof settings.selectedProps==='undefined') {
            settings.selectedProps=defaultSelectedProps;
        }
        else {
            settings.selectedProps=JSON.parse(settings.selectedProps);
        }
        // const _selectedProps=typeof settings.selectedProps==='undefined'? defaultSelectedProps:JSON.parse(settings.selectedProps);
        if(debug) {
            console.log(`loading settings: vvv`);
            console.log(settings);
        }

        if(settings.configComplete) {
            this.setState({
                bgColor: settings.bgColor,
                configComplete: settings.configComplete,
                selectedProps: settings.selectedProps,
            });
            this.validateSettings(false);
        }
        else {
            this.clearSettings();
        }
        this.setState({ loading: false });
    };

    // big logic block to make sure existing settings are still valid
    // if any fail, reset all data
    private async validateSettings(bLoad: boolean=false): Promise<any> {
        console.log(`validate settings`);
        try {
            this.setState({ loading: true });
            if(debug) { console.log(`starting validate worksheets/fields/filters and parameters - bLoad=${ bLoad }`); }
            await this.getWorksheetsAsync();
            await this.getParamListAsync();

            if(debug) { console.log(`starting bLoad logic`); }
            // check existing  settings
            if(bLoad) {
                // parameter logic
                this.updateError(0, '');
                // worksheet/filter/sheet logic
                const { worksheets }=this.state.availableProps;
                if(worksheets.length) {
                    // assign fields of first worksheet
                    if(debug) { console.log(`setting worksheet state`); }
                    this.setState({ selectedProps: defaultSelectedProps }, () => {
                        this.setSelectedWorksheet();
                    });
                }
                else {
                    this.updateError(1, 'Err 1001. No valid sheets.  Please add a sheet that has at least two string dimensions.');
                }
            }
            else {
                this.setFieldArrayBasedOnSelectedWorksheet(this.state.selectedProps.worksheet.name, false);
                this.setFilterArrayBasedOnSelectedWorksheet(this.state.selectedProps.worksheet.name, false);
                // validate existing settings
                let bFound=false;
                const { worksheet }=this.state.selectedProps;
                // does the array of available worksheets contain the selected sheet?
                for(const availWorksheet of this.state.availableProps.worksheets) {
                    if(availWorksheet.name===worksheet.name) {
                        bFound=true;
                        break;
                    }
                }

                if(!bFound) {
                    if(debug) { console.log(`can't validate existing worksheet - reload`); }
                    return this.validateSettings(true);
                }
                bFound=false;
                // validate worksheet/fields
                const foundWorksheet=this.state.availableProps.worksheets.find((ws) => ws.name===worksheet.name)||{ fields: [] };
                if(foundWorksheet?.fields.length<2) {
                    if(debug) { console.log(`can't validate existing worksheet has <2 fields - reload`); }
                    return this.validateSettings(true);
                }
                else {

                    if(this.state.selectedProps.type===HierType.RECURSIVE) {

                        for(const availFields of foundWorksheet.fields) {
                            if(availFields.fieldName===worksheet.childId.fieldName) {
                                bFound=true;
                                break;
                            }
                        }
                        if(!bFound) {
                            if(debug) { console.log(`can't validate existing childiId field (recursive tree) - reload`); }
                            return this.validateSettings(true);
                        }
                    }
                    else {
                        // flat tree
                        bFound=true; // start with true and set false if any field is not found.
                        for(const field of worksheet.fields) {
                            let fieldFound=false;
                            for(const availField of foundWorksheet.fields) {
                                if(availField.fieldName===field) {
                                    fieldFound=true;
                                }
                            }
                            bFound=bFound&&fieldFound;
                        }
                        if(!bFound) {
                            if(debug) { console.log(`can't validate existing worksheet fields (flat tree) - reload`); }
                            return this.validateSettings(true);
                        }
                    }
                }


                // is the selected parent field still present?
                bFound=false;
                for(const availFields of foundWorksheet.fields) {
                    if(availFields.fieldName===worksheet.parentId.fieldName) {
                        bFound=true;
                        break;
                    }
                }

                if(!bFound) {
                    if(debug) { console.log(`can't validate existing parentId field - reload`); }
                    return this.validateSettings(true);
                }
                bFound=false;
                // is the selected childLabel field still present?
                // skip if flat tree
                if(this.state.selectedProps.type===HierType.RECURSIVE) {
                    for(const availFields of foundWorksheet.fields) {
                        if(availFields.fieldName===worksheet.childLabel.fieldName) {
                            bFound=true;
                            break;
                        }
                    }
                    if(!bFound) {
                        if(debug) { console.log(`can't validate existing childLabel field- reload`); }
                        return this.validateSettings(true);
                    }
                }
                bFound=false;
                // is the selected filter still available, if it is selected?
                if(worksheet.filterEnabled) {
                    for(const availFilters of foundWorksheet.fields) {
                        if(availFilters.fieldName===worksheet.filter.fieldName) {
                            bFound=true;
                            break;
                        }
                    }
                    if(!bFound) {
                        if(debug) { console.log(`can't validate existing worksheet filter - reload`); }
                        return this.validateSettings(true);
                    }
                }
                bFound=false;
                // validate params, if they are enabled
                const { childId, childLabel, childIdEnabled, childLabelEnabled }=this.state.selectedProps.parameters;
                if(debug) { console.log(`childIdEnabled? ${ childIdEnabled }`); }
                if(childIdEnabled) {
                    for(const availParam of this.state.paramArr) {
                        if(availParam===childId.name) {
                            bFound=true;
                            break;
                        }
                    }
                    if(!bFound) {
                        if(debug) { console.log(`can't validate existing childId Param - reload`); }
                        return this.validateSettings(true);
                    }
                }
                bFound=false;
                if(childLabelEnabled) {
                    for(const availParam of this.state.paramArr) {
                        console.log(`aP ${availParam} matching ${childLabel.name}`)
                        if(availParam===childLabel.name) {
                            bFound=true;
                            break;
                        }
                    }
                    if(!bFound) {
                        if(debug) { console.log(`can't validate existing childLabel Param - reload`); }
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
            if(debug) {
                console.log(`final state after load}
        ${JSON.stringify(this.state, null, 2) }
        `);
            }
            if(debug) { console.log(this.state); }
            if(debug) { console.log(`successfully completed validate fields`); }
        }
        catch(err) {
            this.clearSettings();
            console.error(err);
        }
    }
    // save settings to workbook
    private setParameters() {
        if(debug) { console.log(`setParameters`); }
        const selectedProps: SelectedProps=extend(true, {}, this.state.selectedProps);
        if(debug) { console.log(`2 - childId.dataType===string`); }
        if (this.state.selectedProps.type === HierType.RECURSIVE){

            if(this.state.paramArr.length>=2) {
                if(debug) { console.log(`3 -- paramStrArr.length >= 2`); }
                selectedProps.parameters.childId=this.state.availableProps.parameters.find(p => p.name===this.state.paramArr[0])||defaultParameter;
                selectedProps.parameters.childLabel=this.state.availableProps.parameters.find(p => p.name===this.state.paramArr[1])||defaultParameter;
            }
            else if(this.state.paramArr.length>=1) {
                if(debug) { console.log(`4`); }
                selectedProps.parameters.childId=this.state.availableProps.parameters.find(p => p.name===this.state.paramArr[0])||defaultParameter;
            }
        }
        else {
            if(this.state.paramArr.length>=1) {

                // TODO: make this filter based off the generated param list.
                if(debug) { console.log(`4.5`); }
                selectedProps.parameters.childLabel=this.state.availableProps.parameters.find(p => p.name===this.state.paramArr[0])||defaultParameter;
            }
        }
        selectedProps.parameters.childIdEnabled=false;
        selectedProps.parameters.childLabelEnabled=false;
        if(debug) { console.log(`selectedProps in SETINITIALPARAMETERS: \n${ JSON.stringify(selectedProps, null, 2) }`); }
        this.setState({ selectedProps }, () => { this.clearMarkSelection(); });
    }
    // clears mark selection checkbox
    private clearMarkSelection() {
        const selectedProps: SelectedProps=extend(true, {}, this.state.selectedProps);
        selectedProps.worksheet.enableMarkSelection=false;
        this.setState({ selectedProps });
    }
    // Handles change in background color input
    private bgChange=(color: any): void => {
        this.setState({ bgColor: color.target.value });
    };
    // handles changing either the childId or parentId field in the hierarchy
    private changeParam=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        const type: string|null=e.target.getAttribute('data-type');
        if(debug) {
            console.log(`all state: ${ JSON.stringify(this.state, null, 2) }`);
        }
        if(typeof type==='string') {

            // check to see if we can even enable (length of current array >= 1)

            const { parameters: availParameters }=this.state.availableProps;
            const newParam=availParameters.find(param => param.name===e.target.value)||defaultParameter;
            const prevChildId: Parameter=extend({}, this.state.selectedProps.parameters.childId);
            if(debug) { console.log(`prevChildId: ${ JSON.stringify(prevChildId, null, 2) }`); }

            const prevChildLabel: Parameter=this.state.selectedProps.parameters.childLabel;
            if(debug) { console.log(`prevChildLabel: ${ JSON.stringify(prevChildLabel, null, 2) }`); }
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

            if(debug) {
                console.log(`childId param set to ${ JSON.stringify(prevChildId) }`);
                console.log(`childLabel param set to ${ JSON.stringify(prevChildLabel) }`);
            }
            const selectedProps=extend(true, {}, this.state.selectedProps, { parameters: { childId, childLabel } });
            if(debug) { console.log(`setting (finally): ${ JSON.stringify(selectedProps, null, 2) }`); }
            this.setState({
                selectedProps
            });
        }
    };

    // Clears setting for which tableau parameter to update
    // Don't update the saved settings until the user clicks Okay (or cancels)
    private clearSettings=(): void => {
        if(debug) { console.log(`clearSettings`); }
        this.setState({
            availableProps: defaultAvailableProps,
            bgColor: '#F3F3F3',  // tableau default background color
            configComplete: false,
            error: [],
            loading: false,
            parameterStatus: Status.notpossible,
            selectedProps: defaultSelectedProps,
            worksheetStatus: Status.notset
        });
        if(debug) { console.log(`calling validateSettings from clearSettings`); }
        this.validateSettings(true);
    };

    // Saves settings and closes configure dialog
    private submit=(): void => {
        // if the user hits Clear the parameter will not be configured so save 'configured' state from that
        if(debug) { console.log(`submitting settings...`); }
        if(debug) { console.log(this.state); }
        if(debug) { console.log(JSON.stringify(this.state,null,2)); }
        window.tableau.extensions.settings.set('configComplete', this.state.configComplete.toString());
        window.tableau.extensions.settings.set('selectedProps', JSON.stringify(this.state.selectedProps));
        window.tableau.extensions.settings.set('bgColor', this.state.bgColor.toString());
        window.tableau.extensions.settings.saveAsync().then(() => {
            window.tableau.extensions.ui.closeDialog(this.state.configComplete.toString());
        })
            .catch((err: any) => {
                if(debug) { console.log(`an error occurred closing the dialogue box: ${ err } ${ err.stack }`); }
            });
    };

    // change tabs to specified index #
    private changeTabs(index: number) {
        if(debug) { console.log(`onChange tab index: ${ index }`); }
        this.setState({ selectedTabIndex: index });
    }
    // change to next tab in UI
    private changeTabNext() {
        if(debug) { console.log(`onChange tab next: ${ this.state.selectedTabIndex }`); }
        if(this.state.selectedTabIndex<3) {
            this.setState((prevState) => ({ selectedTabIndex: prevState.selectedTabIndex+1 }));
        }
    }
    // change to prev tab in UI
    private changeTabPrevious() {
        if(debug) { console.log(`onChange tab previous: ${ this.state.selectedTabIndex }`); }
        if(this.state.selectedTabIndex>0) {
            this.setState((prevState) => ({ selectedTabIndex: prevState.selectedTabIndex-1 }));
        }
    }
    // change Hier Type
    private changeHierType(type: HierType) {
        console.log(`clicked hier type image: ${ type }`);
        console.log(`settings before:`);
        console.log(this.state.selectedProps);
        // this.clearSettings();
        const selectedP=extend(true, {}, this.state.selectedProps, { type });
        console.log(`about to set...`);
        console.log(selectedP);
        this.setState({ selectedProps: selectedP });
    }

}

export default Configure;
ReactDOM.render(<Configure />, document.getElementById('app'));