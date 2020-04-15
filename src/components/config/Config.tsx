/* tslint:disable:jsx-no-lambda */
import '../../css/style.css';

import { Extensions } from '@tableau/extensions-api-types';
import { Button, Spinner } from '@tableau/tableau-ui';
import React, { useState } from 'react';
import * as ReactDOM from 'react-dom';
import { Button as RSButton, Col, Container, Row, Alert } from 'reactstrap';
import flatHier from '../../images/FlatHier.jpeg';
import recursiveHier from '../../images/RecursiveHier.jpeg';
import HierarchyAPI from '../API/HierarchyAPI';
import Colors from './Colors';
import { debug, HierarchyProps, HierType } from './Interfaces';
import { Page2Flat } from './Page2Flat';
import { Page2Recursive } from './Page2Recursive';
import { Page3Flat } from './Page3Flat';
import { Page3Recursive } from './Page3Recursive';


declare global {
    interface Window { tableau: { extensions: Extensions; }; }
}

function Configure(props: any) {
    // TODO: not sure why TS definitions aren't coming through.  
    // explicitly defining them here for type completion
    const [state, setCurrentWorksheetName, setUpdates]=HierarchyAPI();
    const [selectedTabIndex, setSelectedTabIndex]=useState(0);
    const {data, isLoading, isError, errorStr, doneLoading}: {data:HierarchyProps, isLoading:boolean, isError: boolean, errorStr: string, doneLoading:boolean} = state;
    const loadingStr: string=' -- Loading...';


    // Handles selection in worksheet selection dropdown
    const worksheetChange=(e: React.ChangeEvent<HTMLSelectElement>): void => {
/*         const worksheet: AvailableWorksheet=availableProps.worksheets.find(_ws => _ws.name===e.target.value)||defaultWorksheet;
        if(worksheet.name==='') { return; }
        setSelectedWorksheet(e.target.value); */
        setCurrentWorksheetName(e.target.value);
    };

    // Handles selection of the parentid field
    const setParent=(e: React.ChangeEvent<HTMLSelectElement>): void => {
/*         const prevParentId=data.worksheet.parentId;
        if(debug) {
            console.log(`availProps: vvv`);
            console.log(JSON.stringify(availableProps, null, 2));
            console.log(`selectedProps: vvv`);
            console.log(JSON.stringify(selectedProps, null, 2));
        }
        const ws=availableProps.worksheets.find(_ws => _ws.name===data.worksheet.name);
        const parentId=ws!.fields.find(field => field.fieldName===e.target.value)||defaultField;
        if(debug) { console.log(`setParent: e.target.val: ${ e.target.value }, availField: ${ JSON.stringify(parentId) }`); }
        if(parentId.fieldName==='') { return; }

        const _selectedWorksheet: SelectedWorksheet=extend(true, {}, selectedProps.worksheet);
        _selectedWorksheet.parentId=parentId;
        // switch names if they are now the same.
        let bSwitch=false;
        if(parentId.fieldName===selectedProps.worksheet.childId.fieldName) {
            _selectedWorksheet.childId=prevParentId;
            setSelectedFilterBasedOnAllowedFilters();
            bSwitch=true;
        }
        dispatchSelectedProps({ type: 'worksheetProps', data: _selectedWorksheet });
        if(bSwitch) { setSelectedFilterBasedOnAllowedFilters(); }
        /*         setState(
                    { selectedProps: _selectedWorksheet },
                    () => { if(bSwitch) { setSelectedFilterBasedOnAllowedFilters(_selectedWorksheet.name); } }
                );
        ; */
        setUpdates({type: 'SET_PARENT_ID_FIELD', data: e.target.value})
    };

    // Handles selection of the childId field
    const setChild=(e: React.ChangeEvent<HTMLSelectElement>): void => {
/*         const prevChildId=selectedProps.worksheet.childId;
        const ws=availableProps.worksheets.find(_ws => _ws.name===selectedProps.worksheet.name);
        const childField=ws!.fields.find(field => field.fieldName===e.target.value)||defaultField;
        if(debug) { console.log(`setParent: e.target.val: ${ e.target.value }, availField: ${ JSON.stringify(childField) }`); }

        if(childField.fieldName==='') { return; }

        const selectedWorksheet: SelectedWorksheet=extend(true, {}, selectedProps.worksheet);
        selectedWorksheet.childId=childField;
        // switch names if they are now the same.
        if(childField.fieldName===selectedWorksheet.parentId.fieldName) {
            selectedWorksheet.parentId=prevChildId;
        }
        dispatchSelectedProps({ type: 'worksheetProps', data: selectedWorksheet });
        setSelectedFilterBasedOnAllowedFilters(); */
        /*         setState({
                    selectedProps: selectedWorksheet
                },
                    () => { setSelectedFilterBasedOnAllowedFilters(selectedWorksheet.name); }); */
        setUpdates({type: 'SET_CHILD_ID_FIELD', data: e.target.value})
    };
    // Handles selection of the label field
    const setChildLabel=(e: React.ChangeEvent<HTMLSelectElement>): void => {
/*         if(debug) { console.log(`child label field set to ${ e.target.value }`); }
        const ws=availableProps.worksheets.find(_ws => _ws.name===selectedProps.worksheet.name);
        const childLabel=ws!.fields.find(field => field.fieldName===e.target.value)||defaultField;

        if(childLabel.fieldName==='') { return; }

        // set appropriate parameters if field type is changed
        // const parameters=selectedProps.parameters;
        // parameters.childLabelEnabled=false;
        // const _selectedProps: SelectedProps=extend(true, {}, selectedProps);
        // _selectedProps.worksheet.childLabel=childLabel;
        // _selectedProps.parameters=parameters;
        if(debug) { console.log(`setting from setChildLabel`); }
        dispatchSelectedProps({ type: 'parameterProps', data: { childLabelEnabled: false } });
        dispatchSelectedProps({ type: 'worksheetProps', data: { childLabel } }); */
        // if(debug) { console.log(_selectedProps); }
        /*         setState(
        
                    { selectedProps: _selectedProps },
                    () => { setFilterArrayBasedOnSelectedWorksheet(selectedProps.worksheet.name); }
                ); */
        setUpdates({type: 'SET_CHILD_LABEL_FIELD', data: e.target.value})
    };

    // Handles selection of the filter field
    const changeFilter=(e: React.ChangeEvent<HTMLSelectElement>): void => {

        /* if(debug) { console.log(`filter field set to ${ e.target.value }`); }

        const ws=availableProps.worksheets.find(_ws => _ws.name===selectedProps.worksheet.name);
        const filter=ws!.filters.find(field => field.fieldName===e.target.value)||defaultField;

        if(filter.fieldName==='') { return; }
        const selectedWorksheet: SelectedWorksheet=extend(true, {}, selectedProps.worksheet);
        selectedWorksheet.filter={ fieldName: filter.fieldName };
        dispatchSelectedProps({ type: 'worksheetProps', data: { filter: { fieldName: filter.fieldName } } }); */
        /*         setState({
                    selectedProps: selectedWorksheet
                }); */
       setUpdates({type: 'SET_FILTER_FIELD', data: e.target.value})

    };

    // event fired when one of the parameters/filter/mark selection is changed
    const changeEnabled=(e: React.MouseEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => {
        if(debug) {
            console.log(`event type change param enabled: vvv`);
            console.log(e);
        }
        const target=e.target as HTMLInputElement;
        const type: string|null=(e.target as HTMLButtonElement).getAttribute('data-type');
        if(typeof type==='string') {
            if(debug) { console.log(`changing param enabled for ${ type } -- ${target.checked}`); }
/*             // const _selectedProps: SelectedProps=extend(true, {}, selectedProps);
            const lengthOfCurrentArr=paramArr.length;
            const selectedParameters: SelectedParameters=extend(true, {}, selectedProps.parameters);
            // const selectedWorksheet: SelectedWorksheet=extend(true, {}, selectedProps.worksheet);
            const _sP: any = {}; */
            switch(type) {
                case 'id':
/*                     if(!lengthOfCurrentArr) { return; }
                    _sP.childIdEnabled=target.checked;
                    if(selectedParameters.childId.name===selectedParameters.childLabel.name&&target.checked&&selectedParameters.childLabelEnabled||(lengthOfCurrentArr===1&&target.checked)) {
                        _sP.childLabelEnabled=false;
                    }
                    dispatchSelectedProps({ type: 'parameterProps', data: _sP }); */
                    setUpdates({type: 'TOGGLE_ID_PARAMETER_ENABLED', data: target.checked})

                    break;
                case 'label':
/*                     if(!lengthOfCurrentArr) { return; }
                    _sP.childLabelEnabled=e.target.checked;
                    // here we check if there is only 1 param
                    if(selectedParameters.childId.name===selectedParameters.childLabel.name&&e.target.checked&&selectedParameters.childIdEnabled||(lengthOfCurrentArr===1&&e.target.checked)) {
                        _sP.childIdEnabled=false;
                    } */
                    // dispatchSelectedProps({ type: 'parameterProps', data: selectedParameters });
                    /* dispatchSelectedProps({type: 'parameterProps', data: _sP}) */
                    setUpdates({type: 'TOGGLE_LABEL_PARAMETER_ENABLED', data: target.checked})

                    break;
                case 'filter':
                    // selectedWorksheet.filterEnabled=e.target.checked;
                    // dispatchSelectedProps({ type: 'worksheetProps', data: { filterEnabled: e.target.checked } });
                    setUpdates({type: 'TOGGLE_FILTER_ENABLED', data: target.checked})

                    break;
                case 'mark':
                    // dispatchSelectedProps({ type: 'worksheetProps', data: { enableMarkSelection: e.target.checked } });
                    // selectedWorksheet.enableMarkSelection=e.target.checked;
                    setUpdates({type: 'TOGGLE_MARKSELECTION_ENABLED', data: target.checked})
                    break;
            }
            // setState({ selectedProps: _selectedProps });
        }
    };

    // // load settings upon opening configuration dialogue
    // const loadExtensionSettings=async () => {
    //     if(debug) { console.log(`loadExtensionSettings`); }
    //     // setState({ loading: true });
    //     // setLoading(true);
    //     const settings: any=window.tableau.extensions.settings.getAll();

    //     settings.configComplete==='true'? settings.configComplete=true:settings.configComplete=false;
    //     if(typeof settings.selectedProps==='undefined') {
    //         settings.selectedProps=defaultSelectedProps;
    //     }
    //     else {
    //         settings.selectedProps=JSON.parse(settings.selectedProps);
    //     }
    //     // const _selectedProps=typeof settings.selectedProps==='undefined'? defaultSelectedProps:JSON.parse(settings.selectedProps);
    //     if(debug) {
    //         console.log(`loading settings: vvv`);
    //         console.log(settings);
    //     }

    //     if(settings.configComplete) {
    //         // SET_BG_COLOR(settings.bgColor);
    //         // dispatchSelectedProps({ type: 'replaceAndValidate', data: settings.configComplete});
    //         // setConfigComplete(true);
    //         /* setState({ 
    //             bgColor: settings.bgColor,
    //             configComplete: settings.configComplete,
    //             selectedProps: settings.selectedProps,
    //         }); */
    //         //setRunValidate(true);
            
    //         console.log(`WHEN DOES THIS RUN?`)
    //         //        if (runValidate){validateSettings();}
    //         // validateSettings();
    //     }
    //     else {
    //         clearSettings();
    //     }
    //     // setState({ loading: false });
    //     // setLoading(false);
    //     // setExtensionsLoaded(true);
    //     if(debug) { console.log(`finished loadExtensionSettings`); }
    // };

   
    // save settings to workbook
/*     const setParameters=() => {
        if(debug) { console.log(`setParameters`); }
        // const _selectedProps: SelectedProps=extend(true, {}, selectedProps);
        const _parameters: SelectedParameters=extend(true, {}, selectedProps.parameters);
        if(debug) { console.log(`sP - do we have paramArr?  ${paramArr}`); }
        if(selectedProps.type===HierType.RECURSIVE) {

            if(paramArr.length>=2) {
                if(debug) { console.log(`3 -- paramStrArr.length >= 2`); }
                _parameters.childId=availableProps.parameters.find(p => p.name===paramArr[0])||defaultParameter;
                _parameters.childLabel=availableProps.parameters.find(p => p.name===paramArr[1])||defaultParameter;
                setParameterStatus(Status.set);
            }
            else if(paramArr.length>=1) {
                if(debug) { console.log(`4`); }
                _parameters.childId=availableProps.parameters.find(p => p.name===paramArr[0])||defaultParameter;
                setParameterStatus(Status.set);
            }
        }
        else {
            // FLAT hierarchy
            if(paramArr.length>=1) {

                // TODO: make this filter based off the generated param list.
                if(debug) { console.log(`4.5`); }
                _parameters.childLabel=availableProps.parameters.find(p => p.name===paramArr[0])||defaultParameter;
                setParameterStatus(Status.set);
            }
        }
        _parameters.childIdEnabled=false;
        _parameters.childLabelEnabled=false;
        if(debug) { console.log(`selectedProps in SETINITIALPARAMETERS: \n${ JSON.stringify(_parameters, null, 2) }`); }

        dispatchSelectedProps({ type: 'parameterProps', data: _parameters });

  
    }; */
    // clears mark selection checkbox
    // const clearMarkSelection=() => {
    //     /*         const selectedProps: SelectedProps=extend(true, {}, selectedProps);
    //             selectedProps.worksheet.enableMarkSelection=false;
    //             setState({ selectedProps }); */
    //     dispatchSelectedProps({ type: 'worksheetProps', data: { enableMarkSelection: false } });
    // };
    // Handles change in background color input
    const bgChange=(color: any): void => {
        // SET_BG_COLOR(color.target.value);
        // setState({ bgColor: color.target.value });
        setUpdates({type: 'SET_BG_COLOR', data: color.target.value})

    };
    // handles changing either the childId or parentId field in the hierarchy
    const changeParam=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        const type: string|null=e.target.getAttribute('data-type');
        if(typeof type==='string') {
            if(type==='id') {
                setUpdates({type: 'SET_CHILD_ID_PARAMETER', data: e.target.value})
            }
            else if(type==='label') {
                setUpdates({type: 'SET_CHILD_LABEL_PARAMETER', data: e.target.value})
            } 
        }
    };
    // change to next tab in UI
    const changeTabNext=() => {
        if(debug) { console.log(`onChange tab next: ${ selectedTabIndex }`); }
        if(selectedTabIndex<3) {
            setSelectedTabIndex((prev:number) => prev+1);
        }
    };
    // change to prev tab in UI
    const changeTabPrevious=() => {
        if(debug) { console.log(`onChange tab previous: ${ selectedTabIndex }`); }
        if(selectedTabIndex>0) {
            setSelectedTabIndex((prev:number) => prev-1);
        }
    };
    // change Hier Type
    const changeHierType=(type: HierType) => {
        if (debug) {console.log(`clicked hier type image: ${ type }`);}
        setUpdates({type: 'CHANGE_HIER_TYPE', data: type})
    };

    const getStyle=(style: HierType) => {
        if((style===HierType.FLAT&&data.type===HierType.FLAT)||
            (style===HierType.RECURSIVE&&data.type===HierType.RECURSIVE)) {
            return { background: 'lightblue' };
        }
        return {};
    };

    const submit = () => {
        setUpdates({type:'SUBMIT'})
    }

    const page: Array<{ name: string, content: React.ReactFragment; }>=[{ name: 'Hierarchy Type', content: (<div />) }, { name: 'Sheet/Fields', content: (<div />) }, { name: 'Interactions', content: (<div />) }, { name: 'Display', content: (<div />) }];
    // WORKSHEET CONTENT
    page[0].content=(
        <div className='sectionStyle mb-5'>
            <b>Hierarchy Type</b><br />
            Select your data type. The source hierarchy should be on a separate sheet (can be hidden).
            <p />
            <Row>

                <Col onClick={() => changeHierType(HierType.FLAT)} className='centerChildren sectionStyle' style={getStyle(HierType.FLAT)}>
                    <b>Dimensional </b><br />
                    <img src={flatHier} /><br />
                    Description: Levels of the hierarchy are in separate columns/dimensions.
            </Col>
                <Col onClick={() => changeHierType(HierType.RECURSIVE)} className='centerChildren sectionStyle' style={data.type===HierType.RECURSIVE? { background: 'lightblue' }:{}}>
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
            <Colors bg={data.bgColor}
                onBGChange={bgChange}
                enabled={true}
            />
        </div>
    );

    function returnPage(index: number) {
        switch(index) {
            case 0:
            case 3:
                return (<span>{page[index].content}</span>);
            case 1:
                if(data.type===HierType.FLAT) {
                    return <Page2Flat
                        data={data}
                        setUpdates={setUpdates}
                        setCurrentWorksheetName={setCurrentWorksheetName}
                    />;
                }

                else if(data.type===HierType.RECURSIVE) {
                    return <Page2Recursive
                        data={data}
                        setUpdates={setUpdates}
                        setCurrentWorksheetName={setCurrentWorksheetName}
                    />;
                }

            case 2:
                if(data.type===HierType.FLAT) {
                return <Page3Flat
                    data={data}
                    setUpdates={setUpdates}
                    changeEnabled={changeEnabled}
                    changeParam={changeParam}
                />;
                }
                else {
                    return <Page3Recursive
                    data={data}
                    setUpdates={setUpdates}
                    changeEnabled={changeEnabled}
                    changeParam={changeParam}
                    
                />;
                }


            default:
                return (<div>Not here yet</div>);
        }
    }

    const onDismiss = () => {
        setUpdates({type: 'CLEAR_ERROR'})
    }

    return (
        <>
            {!doneLoading? (<div aria-busy='true' className='overlay'><div className='centerOnPage'><div className='spinnerBg centerOnPage'>{}</div><Spinner color='light' /></div></div>):undefined}
            <div className='headerStyle' >
            Hierarchy Navigator 
            </div>


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

                            <RSButton type='button' className='btn btn-default btn-circle' color={selectedTabIndex>=1? 'primary':'secondary'}>2
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

                            <RSButton type='button' className='btn btn-default btn-circle' color={selectedTabIndex>=2? 'primary':'secondary'} active={false}>3
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

                            <RSButton type='button' className='btn btn-default btn-circle' color={selectedTabIndex>=3? 'primary':'secondary'} active={false}>4
                            </RSButton>
                        </Row>
                        <Row className='noMargin'>
                            {page[3].name}
                        </Row>
                    </Col>


                </Row>

            </Container>
            <Alert color='warning' isOpen={isError} toggle={onDismiss}>
                {errorStr}
            </Alert>

            {returnPage(selectedTabIndex)}

            <div className='d-flex flex-row-reverse'>
                <div className='p-2'>
                    {[1, 2, 3].includes(selectedTabIndex)&&
                        <Button
                            kind='outline'
                            onClick={changeTabPrevious}>
                            Previous
                        </Button>
                    }
                    {[0, 1, 2].includes(selectedTabIndex)&&
                        <Button
                            kind='outline'
                            onClick={changeTabNext}>
                            Next
                        </Button>
                    }

                    {selectedTabIndex===3&&
                        <Button kind={data.configComplete? 'filledGreen':'outline'} onClick={submit}>{data.configComplete? 'Submit':'Cancel'} </Button>
                    }
                </div>
            </div>
        </>
    );
}

export default Configure;
ReactDOM.render(<Configure />, document.getElementById('app'));