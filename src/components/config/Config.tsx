/* tslint:disable:jsx-no-lambda */
import '../../css/style.css';

import { Extensions } from '@tableau/extensions-api-types';
import { Button, Checkbox, Spinner, TextField } from '@tableau/tableau-ui';
import React, { useState } from 'react';
import * as ReactDOM from 'react-dom';
import { Button as RSButton, Col, Container, Row, Alert } from 'reactstrap';
import flatHier from '../../images/FlatHier.jpeg';
import recursiveHier from '../../images/RecursiveHier.jpeg';
import HierarchyAPI from '../API/HierarchyAPI';
import Colors from './Colors';
import { debug, HierarchyProps, HierType } from '../API/Interfaces';
import { Page2Flat } from './Page2Flat';
import { Page2Recursive } from './Page2Recursive';
import { Page3Flat } from './Page3Flat';
import { Page3Recursive } from './Page3Recursive';


declare global {
    interface Window { tableau: { extensions: Extensions; }; }
}

function Configure(props: any) {
    const [state, setCurrentWorksheetName, setUpdates]=HierarchyAPI();
    const [selectedTabIndex, setSelectedTabIndex]=useState(0);
    const { data, isLoading, isError, errorStr, doneLoading }: { data: HierarchyProps, isLoading: boolean, isError: boolean, errorStr: string, doneLoading: boolean; }=state;

    // event fired when one of the parameters/filter/mark selection is changed
    const changeEnabled=(e: React.MouseEvent<HTMLInputElement>|React.ChangeEvent<HTMLInputElement>) => {
        if(debug) {
            console.log(`event type change param enabled: vvv`);
            console.log(e);
        }
        const target=e.target as HTMLInputElement;
        const type: string|null=(e.target as HTMLButtonElement).getAttribute('data-type');
        if(typeof type==='string') {
            if(debug) { console.log(`changing param enabled for ${ type } -- ${ target.checked }`); }

            switch(type) {
                case 'id':
                    setUpdates({ type: 'TOGGLE_ID_PARAMETER_ENABLED', data: target.checked });
                    break;
                case 'label':
                    setUpdates({ type: 'TOGGLE_LABEL_PARAMETER_ENABLED', data: target.checked });
                    break;
                case 'filter':
                    setUpdates({ type: 'TOGGLE_FILTER_ENABLED', data: target.checked });
                    break;
                case 'mark':
                    setUpdates({ type: 'TOGGLE_MARKSELECTION_ENABLED', data: target.checked });
                    break;
            }
        }
    };

    // Handles change in background color input
    const bgChange=(color: any): void => {
        setUpdates({ type: 'SET_BG_COLOR', data: color.target.value });

    };
    // handles changing either the childId or parentId field in the hierarchy
    const changeParam=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        const type: string|null=e.target.getAttribute('data-type');
        if(typeof type==='string') {
            if(type==='id') {
                setUpdates({ type: 'SET_CHILD_ID_PARAMETER', data: e.target.value });
            }
            else if(type==='label') {
                setUpdates({ type: 'SET_CHILD_LABEL_PARAMETER', data: e.target.value });
            }
        }
    };
    // change to next tab in UI
    const changeTabNext=() => {
        if(debug) { console.log(`onChange tab next: ${ selectedTabIndex }`); }
        if(selectedTabIndex<3) {
            setSelectedTabIndex((prev: number) => prev+1);
        }
    };
    // change to prev tab in UI
    const changeTabPrevious=() => {
        if(debug) { console.log(`onChange tab previous: ${ selectedTabIndex }`); }
        if(selectedTabIndex>0) {
            setSelectedTabIndex((prev: number) => prev-1);
        }
    };
    // change Hier Type
    const changeHierType=(type: HierType) => {
        if(debug) { console.log(`clicked hier type image: ${ type }`); }
        setUpdates({ type: 'CHANGE_HIER_TYPE', data: type });
    };

    const getStyle=(style: HierType) => {
        if((style===HierType.FLAT&&data.type===HierType.FLAT)||
            (style===HierType.RECURSIVE&&data.type===HierType.RECURSIVE)) {
            return { background: 'lightblue' };
        }
        return {};
    };

    const submit=() => {
        setUpdates({ type: 'SUBMIT' });
    };

    const page: Array<{ name: string, content: React.ReactFragment; }>=[{ name: 'Hierarchy Type', content: (<div />) }, { name: 'Sheet/Fields', content: (<div />) }, { name: 'Interactions', content: (<div />) }, { name: 'Options', content: (<div />) }];
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
    //  PAGE 3 CONTENT
    const inputProps={
        disabled: !data.options.titleEnabled,
        errorMessage: undefined,
        kind: 'line' as 'line'|'outline'|'search',
        // label: `Title for Extension`,
        onChange: (e: any) => {
            setUpdates({ type: 'SET_TITLE', data: e.target.value });
        },
        onClear: () => {
            setUpdates({ type: 'SET_TITLE', data: 'Hierarchy Navigator' });
        },
        style: { width: 200, paddingLeft: '9px' },
        value: data.options.title
    };
    const changeTitleEnabled=(e: React.ChangeEvent<HTMLInputElement>): void => {
        console.log(`title en setting: ${ e.target.checked }`);
        setUpdates({ type: 'TOGGLE_TITLE_DISABLED', data: e.target.checked });
    };
    const changeSearch=(e: React.ChangeEvent<HTMLInputElement>): void => {
        setUpdates({ type: 'TOGGLE_SEARCH_DISPLAY', data: e.target.checked });
    };
    page[3].content=(
        <div className='sectionStyle mb-2'>
            <b>Options</b>
            <br />
            <Colors bg={data.options.bgColor}
                onBGChange={bgChange}
                enabled={true}
            />
            <br />
            <div style={{ marginLeft: '9px' }}>
                <Checkbox
                    checked={data.options.hideSearch}
                    onChange={changeSearch}
                >
                    Show search box
                </Checkbox>
                <br />
                <Checkbox
                    checked={data.options.titleEnabled}
                    onChange={changeTitleEnabled}
                >
                    Show Title
                </Checkbox>
                <br />
                <div style={{ marginLeft: '9px' }}>
                <TextField {...inputProps} />
                </div>
            </div>
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
    const onDismiss=() => {
        setUpdates({ type: 'CLEAR_ERROR' });
    };
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