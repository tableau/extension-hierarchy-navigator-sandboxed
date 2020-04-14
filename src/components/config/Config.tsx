/* tslint:disable:jsx-no-lambda */
import '../../css/style.css';

import { Extensions } from '@tableau/extensions-api-types';
import { Button, Spinner } from '@tableau/tableau-ui';
import React, { useState } from 'react';
import * as ReactDOM from 'react-dom';
import { Button as RSButton, Col, Container, Row } from 'reactstrap';

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
        setUpdates({type: 'SETPARENTIDFIELD', data: e.target.value})
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
        setUpdates({type: 'SETCHILDIDFIELD', data: e.target.value})
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
        setUpdates({type: 'SETCHILDLABELFIELD', data: e.target.value})
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
       setUpdates({type: 'SETFILTERFIELD', data: e.target.value})

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
                    setUpdates({type: 'TOGGLEIDPARAMETERENABLED', data: target.checked})

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
                    setUpdates({type: 'TOGGLELABELPARAMETERENABLED', data: target.checked})

                    break;
                case 'filter':
                    // selectedWorksheet.filterEnabled=e.target.checked;
                    // dispatchSelectedProps({ type: 'worksheetProps', data: { filterEnabled: e.target.checked } });
                    setUpdates({type: 'TOGGLEFILTERENABLED', data: target.checked})

                    break;
                case 'mark':
                    // dispatchSelectedProps({ type: 'worksheetProps', data: { enableMarkSelection: e.target.checked } });
                    // selectedWorksheet.enableMarkSelection=e.target.checked;
                    setUpdates({type: 'TOGGLEMARKSELECTIONENABLED', data: target.checked})
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
    //         // setBgColor(settings.bgColor);
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
        // setBgColor(color.target.value);
        // setState({ bgColor: color.target.value });
        setUpdates({type: 'SETBGCOLOR', data: color.target.value})

    };
    // handles changing either the childId or parentId field in the hierarchy
    const changeParam=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        const type: string|null=e.target.getAttribute('data-type');
        /*         if(debug) {
                    console.log(`all state: ${ JSON.stringify(state, null, 2) }`);
                } */
        if(typeof type==='string') {

            // check to see if we can even enable (length of current array >= 1)

            // const { parameters: availParameters }=availableProps;
/*             const newParam=availableProps.parameters.find(param => param.name===e.target.value)||defaultParameter;
            const prevChildId: SimpleParameter=extend({}, selectedProps.parameters.childId);
            if(debug) { console.log(`prevChildId: ${ JSON.stringify(prevChildId, null, 2) }`); }

            const prevChildLabel: SimpleParameter=selectedProps.parameters.childLabel;
            if(debug) { console.log(`prevChildLabel: ${ JSON.stringify(prevChildLabel, null, 2) }`); }
            let childId=prevChildId;
            let childLabel=prevChildLabel; */
            // if new value is same as existing other value than switch, but only to the same type (string/int)
            if(type==='id') {
                setUpdates({type: 'SETCHILDIDPARAMETER', data: e.target.value})
                // childId=newParam;
                // if(prevChildLabel.name===e.target.value) {
                //     childLabel=prevChildId; // switch values if they are the same
                // }
            }
            else if(type==='label') {
                setUpdates({type: 'SETCHILDLABELPARAMETER', data: e.target.value})
                // childLabel=newParam;
                // if(prevChildId.name===e.target.value) {
                //     childId=prevChildLabel; // switch values if they are the same
                // }

            }

/*             if(debug) {
                console.log(`childId param set to ${ JSON.stringify(prevChildId) }`);
                console.log(`childLabel param set to ${ JSON.stringify(prevChildLabel) }`);
            } */
            // const selectedProps=extend(true, {}, selectedProps, { parameters: { childId, childLabel } });
            // if(debug) { console.log(`setting (finally): ${ JSON.stringify(selectedProps, null, 2) }`); }
            /*             setState({
                            selectedProps
                        }); */
            // dispatchSelectedProps({ type: 'parameterProps', data: { childId, childLabel } });
            
        }
    };

    // Clears setting for which tableau parameter to update
    // Don't update the saved settings until the user clicks Okay (or cancels)
/*     const clearSettings=(): void => {
        if(debug) { console.log(`clearSettings`); }
        setBgColor('#F3F3F3');
        setError([]);
        setConfigComplete(false);
        setLoading(false);
        setParameterStatus(Status.notpossible);
        dispatchSelectedProps({ type: 'reset' });
        // setSelectedProps(defaultSelectedProps);
        setWorksheetStatus(Status.notset);
        // setAvailableProps(defaultAvailableProps);
        // dispatchAvailableProps({ type: 'reset' });

        // if(debug) { console.log(`calling validateSettings from clearSettings`); }
        // validateSettings();
        setSelectedWorksheet();
        if(debug) { console.log(`end clearSettings`); }
    }; */



    // change tabs to specified index #
    /*     const changeTabs=(index: number) => {
            if(debug) { console.log(`onChange tab index: ${ index }`); }
            setSelectedTabIndex(index);
            // setState({ selectedTabIndex: index });
        }; */
    // change to next tab in UI
    const changeTabNext=() => {
        if(debug) { console.log(`onChange tab next: ${ selectedTabIndex }`); }
        if(selectedTabIndex<3) {

            setSelectedTabIndex((prev:number) => prev+1);
            // setState((prevState) => ({ selectedTabIndex: prevState.selectedTabIndex+1 }));
        }
    };
    // change to prev tab in UI
    const changeTabPrevious=() => {
        if(debug) { console.log(`onChange tab previous: ${ selectedTabIndex }`); }
        if(selectedTabIndex>0) {
            setSelectedTabIndex((prev:number) => prev-1);
            // setState((prevState) => ({ selectedTabIndex: prevState.selectedTabIndex-1 }));
        }
    };
    // change Hier Type
    const changeHierType=(type: HierType) => {
        console.log(`clicked hier type image: ${ type }`);
        // console.log(`settings before:`);
        // console.log(selectedProps);
        // // clearSettings();
        // const selectedP=extend(true, {}, selectedProps, { type });
        // console.log(`about to set...`);
        // console.log(selectedP);
        // setSelectedProps(selectedP);
        // dispatchSelectedProps({ type: 'type', data: type });
        // setState({ selectedProps: selectedP });
        setUpdates({type: 'CHANGE_HIER_TYPE', data: type})

    };



    const getStyle=(style: HierType) => {
        console.log(`calling getStyle`);
        console.log(`style=${ style } andselectedProps.type=${ data.type }`);
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
    return (
        <>
            {!doneLoading? (<div aria-busy='true' className='overlay'><div className='centerOnPage'><div className='spinnerBg centerOnPage'>{}</div><Spinner color='light' /></div></div>):undefined}
            <div className='headerStyle' >
            Hierarchy Navigator 
            </div>
            {typeof isError !== 'undefined' && isError?
                    (<h4 style={{ color: 'red' }} className={'m-3'}>
                        {errorStr}<br />
                    </h4>):undefined
            }

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
            {console.log(`end of render`)}
                {/* {console.log(JSON.stringify(state,null,2))}  */}
        </>
    );
}

export default Configure;
ReactDOM.render(<Configure />, document.getElementById('app'));