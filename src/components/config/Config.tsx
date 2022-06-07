/* tslint:disable:jsx-no-lambda */
import '../../css/bootstrap.css';
import '../../css/style.css';
import '../../resources/tableau.extensions.1.latest.js';
import { Extensions } from '@tableau/extensions-api-types';
import { Button, Pill, Spinner } from '@tableau/tableau-ui';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Alert, Col, Container, Row } from 'reactstrap';
import flatHier from '../../images/FlatHier.jpeg';
import recursiveHier from '../../images/RecursiveHier.jpeg';
import HierarchyAPI from '../API/HierarchyAPI';
import { debugOverride, HierarchyProps, HierType } from '../API/Interfaces';
import { Page2Flat } from './Page2Flat';
import { Page2Recursive } from './Page2Recursive';
import { Page3Flat } from './Page3Flat';
import { Page3Recursive } from './Page3Recursive';
import { Page4 } from './Page4';

declare global {
    interface Window { tableau: { extensions: Extensions; }; }
}

function Configure(props: any) {
    const [state, setCurrentWorksheetName, setUpdates] = HierarchyAPI();
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const { data, isError, errorStr, doneLoading }: { data: HierarchyProps, isLoading: boolean, isError: boolean, errorStr: string, doneLoading: boolean; } = state;
    const [debug, setDebug] = useState(debugOverride);

    useEffect(() => {
        setDebug(state.data.options.debug || debugOverride);
    }, [state.data.options.debug])

    // event fired when one of the parameters/filter/mark selection is changed
    const changeEnabled = (e: React.MouseEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => {
        if (debug) {
            console.log(`event type change param enabled: vvv`);
            console.log(e);
        }
        const target = e.target as HTMLInputElement;
        const type: string | null = (e.target as HTMLButtonElement).getAttribute('data-type');
        if (typeof type === 'string') {
            if (debug) { console.log(`changing param enabled for ${type} -- ${target.checked}`); }

            switch (type) {
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

    // handles changing either the childId or parentId field in the hierarchy
    const changeParam = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const type: string | null = e.target.getAttribute('data-type');
        if (typeof type === 'string') {
            if (type === 'id') {
                setUpdates({ type: 'SET_CHILD_ID_PARAMETER', data: e.target.value });
            }
            else if (type === 'label') {
                setUpdates({ type: 'SET_CHILD_LABEL_PARAMETER', data: e.target.value });
            }
        }
    };
    // change to next tab in UI
    const changeTabNext = () => {
        if (debug) { console.log(`onChange tab next: ${selectedTabIndex}`); }
        if (selectedTabIndex < 3) {
            setSelectedTabIndex((prev: number) => prev + 1);
        }
    };
    // change to prev tab in UI
    const changeTabPrevious = () => {
        if (debug) { console.log(`onChange tab previous: ${selectedTabIndex}`); }
        if (selectedTabIndex > 0) {
            setSelectedTabIndex((prev: number) => prev - 1);
        }
    };
    // change Hier Type
    const changeHierType = (type: HierType) => {
        if (debug) { console.log(`clicked hier type image: ${type}`); }
        setUpdates({ type: 'CHANGE_HIER_TYPE', data: type });
    };


    const submit = () => {
        setUpdates({ type: 'SUBMIT' });
    };

    const page: Array<{ name: string, content: React.ReactFragment; }> = [{ name: 'Hierarchy Type', content: (<div />) }, { name: 'Sheet/Fields', content: (<div />) }, { name: 'Interactions', content: (<div />) }, { name: 'Options', content: (<div />) }];
    // WORKSHEET CONTENT
    page[0].content = (
        <div className='sectionStyle mb-5'>
            <b>Hierarchy Type</b><br />
            Select your data type. The source hierarchy should be on a separate sheet (can be hidden).
            <p />
            <Row>

                <Col onClick={() => changeHierType(HierType.FLAT)} className='centerChildren sectionStyle' style={{background: data.type === HierType.FLAT ? 'lightblue' : ''}}>
                    <b>Dimensional </b><br />
                    <img src={flatHier} /><br />
                    Description: Levels of the hierarchy are in separate columns/dimensions.
                </Col>
                <Col onClick={() => changeHierType(HierType.RECURSIVE)} className='centerChildren sectionStyle' style={{ background: data.type === HierType.RECURSIVE?'lightblue':'' }}>
                    <b>Recursive</b> <br />
                    <img src={recursiveHier} /><br />
                    Description: Relationships are stored in a parent/child relationship.
                </Col>
            </Row>
        </div>
    );

    function returnPage(index: number) {
        switch (index) {
            case 0:
                return (<span>{page[index].content}</span>);
            case 1:
                if (data.type === HierType.FLAT) {
                    return <Page2Flat
                        data={data}
                        setUpdates={setUpdates}
                        setCurrentWorksheetName={setCurrentWorksheetName}
                    />;
                }

                else if (data.type === HierType.RECURSIVE) {
                    return <Page2Recursive
                        data={data}
                        setUpdates={setUpdates}
                        setCurrentWorksheetName={setCurrentWorksheetName}
                    />;
                }
            case 2:
                if (data.type === HierType.FLAT) {
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
            case 3:
                return <Page4
                    data={data}
                    setUpdates={setUpdates}
                />
            default:
                return (<div>Not here yet</div>);
        }
    }
    const onDismiss = () => {
        setUpdates({ type: 'CLEAR_ERROR' });
    };
    const onDismissWarning = () => {
        setUpdates({ type: 'CLEAR_WARNING' });
    };
    return (
        <>
            {!doneLoading ? (<div aria-busy='true' className='overlay'><div className='centerOnPage'><div className='spinnerBg centerOnPage'>{ }</div><Spinner color='light' /></div></div>) : undefined}
            <div className='headerStyle' >
                Hierarchy Navigator
            </div>

            <Container className='navcontainer'>
                <Row>
                    <Col style={{minWidth: "86px"}}>
                        <Row style={{ paddingLeft: "28px" }}>
                            <Pill kind='discrete'
                                style={{ height: "30px", width: "30px", minWidth: "unset", borderColor: "rgb(73,150,178)" }}
                            >1</Pill>
                        </Row>
                        <Row className='noMargin'>
                            {page[0].name}
                        </Row>
                    </Col>
                    <Col className='narrow'>
                        <div className='userhr' />
                    </Col>
                    <Col style={{minWidth: "86px"}}>
                        <Row style={{ paddingLeft: "28px" }}>
                            <Pill
                                kind={selectedTabIndex >= 1 ? 'discrete' : 'other'}
                                style={{ height: "30px", width: "30px", minWidth: "unset", borderColor: selectedTabIndex >=2 ? "rgb(73,150,178)" : "#d4d4d4" }}
                            >2</Pill>
                        </Row>
                        <Row className='noMargin'>
                            {page[1].name}
                        </Row>
                    </Col>
                    <Col className='narrow'>
                        <div className='userhr' />
                    </Col>
                    <Col style={{minWidth: "86px"}}>
                        <Row style={{ paddingLeft: "28px" }}>
                            <Pill
                                kind={selectedTabIndex >= 2 ? 'discrete' : 'other'}
                                style={{ height: "30px", width: "30px", minWidth: "unset", borderColor: selectedTabIndex >=2 ? "rgb(73,150,178)" : "#d4d4d4" }}
                            >3</Pill>
                        </Row>
                        <Row className='noMargin'>
                            {page[2].name}
                        </Row>
                    </Col>
                    <Col className='narrow'>
                        <div className='userhr' />
                    </Col>
                    <Col style={{minWidth: "86px"}}>
                        <Row style={{ paddingLeft: "28px" }}>

                            <Pill
                                kind={selectedTabIndex >= 3 ? 'discrete' : 'other'}
                                style={{ height: "30px", width: "30px", minWidth: "unset", borderColor: selectedTabIndex >=3 ? "rgb(73,150,178)" : "#d4d4d4"}}
                            >4</Pill>
                        </Row>
                        <Row className='noMargin'>
                            {page[3].name}
                        </Row>
                    </Col>


                </Row>
            </Container>
            <Alert isOpen={data.options.warningEnabled} color='primary' toggle={onDismissWarning}>
                This app requires specific setup instructions.  Please read the documentation (https://github.com/tableau/extension-hierarchy-navigator-sandboxed) before use.
            </Alert>
            <Alert color='warning' isOpen={isError} toggle={onDismiss}>
                {errorStr}
            </Alert>
            {returnPage(selectedTabIndex)}
            <div className='d-flex flex-row-reverse' style={{ position: 'absolute', bottom: '10px', width: '100%' }}>
                <div className='p-2'>
                    {[1, 2, 3].includes(selectedTabIndex) &&
                        <Button
                            kind='outline'
                            onClick={changeTabPrevious}>
                            Previous
                        </Button>
                    }
                    {[0, 1, 2].includes(selectedTabIndex) &&
                        <Button
                            kind='outline'
                            onClick={changeTabNext}>
                            Next
                        </Button>
                    }

                    {selectedTabIndex === 3 &&
                        <Button kind={data.configComplete ? 'filledGreen' : 'outline'} onClick={submit}>{data.configComplete ? 'Submit' : 'Cancel'} </Button>
                    }
                </div>
            </div>
        </>
    );
}

export default Configure;
const container = document.getElementById('app') as HTMLElement;
const root = createRoot(container);
root.render(<Configure tab="configure" />);
