
import { TextField } from '@tableau/tableau-ui';
import React, { useEffect, useState } from 'react';
import { Selector } from '../shared/Selector';
import { AvailableProps, SelectedProps, Status } from './Interfaces';
const extend=require('extend');
import arrayMove from 'array-move';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { Button as RSButton, Col, Container, Row } from 'reactstrap';
import dragHandle from '../../images/Drag-handle-01.png';

interface Props {
    selectedProps: SelectedProps;
    fieldArr: string[];
    availableProps: AvailableProps;
    debug: boolean;
    paramArr: string[];
    filterArr: string[];
    worksheetStatus: Status;
    setStatePassThru: (arg0: any) => void;
    worksheetChange: (arg0: any) => void;
    setChild: (arg0: any) => void;
}

export function Page2Flat(props: Props) {
    // const { state }: { state: State; }=props;
    const [availFields, setAvailFields]=useState<string[]>([]);
    const [availFieldsSansChildId, setAvailFieldsSansChildId]=useState<string[]>([]);

    useEffect(() => {
        const _selectedProps=extend(true, {}, props.selectedProps);
        const avail: string[]=[];
        if(!_selectedProps.worksheet.hasOwnProperty('fields')) { _selectedProps.worksheet.fields=[]; }
        // tslint:disable prefer-for-of
        console.log(`props.selectedProps in useEffect`);
        console.log(props.selectedProps);
        for(let i=0;i<props.fieldArr.length;i++) {
            if(_selectedProps.worksheet.fields.indexOf(props.fieldArr[i])===-1) {
                avail.push(props.fieldArr[i]);
            }
        }
        // tslint:enable prefer-for-of

        setAvailFields(avail);
        setAvailFieldsSansChildId(avail.filter(el => el!==props.selectedProps.worksheet?.childId?.fieldName));
    }, [props]);

    const availableWorksheetArr: string[]=[];
    for(const sheet of props.availableProps.worksheets) {
        availableWorksheetArr.push(sheet.name);
    }
    const worksheetTitle=() => {
        switch(props.worksheetStatus) {
            case Status.notpossible:
                return 'No valid sheets on the dashboard';
            case Status.set:
            case Status.notset:
                return 'Select the sheet with the hierarchy data';
            default:
                return '';
        }
    };
    const DragHandle=(() => <img src={dragHandle} width='25px' height='25px' />);
    const SortableItem=SortableElement(({ value }: any) => <li><DragHandle />{value}
        <RSButton value={value} onClick={removeFromList} color='white' size='xs' style={{ color: 'red' }}>X</RSButton>
    </li>);

    const SortableList=SortableContainer(({ items }: any) => {
        console.log(`sortable list recevied ${ JSON.stringify(items) }`);
        if(!items) { return (<li>No items</li>); }
        return (
            <ul className={'sortableList'}>
                {items.map((value: any, index: any) => (
                    <SortableItem key={`item-${ value }`} index={index} value={value} />
                ))}
            </ul>
        );
    });

    const StaticFieldsItem=SortableElement(({ value }: any) => <li>{value}
        <RSButton value={value} onClick={addToList} color='white' size='xs' style={{ color: 'blue' }}>Add</RSButton>
        {/* <RSButton value={value} onClick={props.setChild} color='white' size='xs' style={{ color: 'blue' }}>Key</RSButton> */}
    </li>);

    const StaticFieldsList=SortableContainer(({ items }: any) => {
        console.log(`static list recevied ${ JSON.stringify(items) }`);
        if(!items) { return (<li>No items</li>); }
        return (
            <ul className={'sortableList'}>
                {items.map((value: any, index: any) => (
                    <StaticFieldsItem key={`item-${ value }`} index={index} value={value} />
                ))}
            </ul>
        );
    });

    // sort lists
    const onSortEnd=({ oldIndex, newIndex }: any) => {
        console.log(`onSortEnd: ${ JSON.stringify(props.selectedProps.worksheet.fields) } - ${ oldIndex }->${ newIndex }`);
        const newOrder=arrayMove(props.selectedProps.worksheet.fields, oldIndex, newIndex);
        console.log(`newOrder: ${ JSON.stringify(newOrder) }`);
        const _st=extend(true, {}, props.selectedProps);
        _st.worksheet.fields=newOrder;
        props.setStatePassThru({ selectedProps: _st });
    };

    // remove from list
    const removeFromList=(evt: any) => {
        console.log(`trying to remove ${ evt.target.value }`);
        const filteredItems=props.selectedProps.worksheet.fields.filter((item: string) => {
            return item!==evt.target.value;
        }
        );
        console.log(`items now: ${ filteredItems }`);
        const _selectedProps=extend(true, {}, props.selectedProps);
        _selectedProps.worksheet.fields=filteredItems;

        props.setStatePassThru({ selectedProps: _selectedProps });
    };

    // add to list
    const addToList=(evt?: any) => {
        const _selectedProps=extend(true, {}, props.selectedProps);
        // if(!_selectedProps.worksheet.hasOwnProperty('fields')) { _selectedProps.worksheet.fields=[]; }
        console.log(`evt?  target.value ${ evt.target.value }`);
        console.log(evt);
        if(evt.target&&evt.target.value) {
            _selectedProps.worksheet.fields.push(evt.target.value);
        }
        else {
            props.fieldArr.forEach(el => {
                if(_selectedProps.worksheet.fields.indexOf(el)===-1&&el!==props.selectedProps.worksheet?.childId?.fieldName) {
                    _selectedProps.worksheet.fields.push(el);
                }
            });
        }
        props.setStatePassThru({ selectedProps: _selectedProps });
    };
    /*     const addAsKey = (evt:any)=> {
            console.log(`add key -> ${evt.target.value}`)
    
        } */

    const removeId=() => {
        const _st=extend(true, {}, props.selectedProps);
        const lastField=props.selectedProps.worksheet.fields[props.selectedProps.worksheet.fields.length-1];
        _st.worksheet.childId=lastField;
        // selectedProps.worksheet.childId.fieldName
        props.setStatePassThru({ selectedProps: _st });
    };

    const inputProps={
        errorMessage: undefined,
        kind: 'line' as 'line'|'outline'|'search',
        label: `Separator for ${ props.selectedProps.worksheet.childId.fieldName } field formula.`,
        onChange: (e: any) => {
            const _selectedProps: SelectedProps=extend(true, {}, props.selectedProps);
            _selectedProps.seperator=e.target.value;
            props.setStatePassThru({ selectedProps: _selectedProps });
        },
        onClear: () => {
            const _selectedProps: SelectedProps=extend(true, {}, props.selectedProps);
            _selectedProps.seperator='|';
            props.setStatePassThru({ selectedProps: _selectedProps });
        },
        style: { width: 200, paddingLeft: '9px' },
        value: props.selectedProps.seperator,
    };

    const formula=() => {
        let f='';
        for(let i=0;i<props.selectedProps.worksheet.fields.length;i++) {
            f+=`[${ props.selectedProps.worksheet.fields[i] }]`;
            if(i<props.selectedProps.worksheet.fields.length-1) {
                f+=`+'${ props.selectedProps.seperator }'+`;
            }
        }
        return f;
    };

    return (
        <div className='sectionStyle mb-5'>
            <b>Worksheet and Fields</b>
            <p />
            <Selector
                title={worksheetTitle()}
                status={props.worksheetStatus}
                selected={props.selectedProps.worksheet.name}
                list={availableWorksheetArr}
                onChange={props.worksheetChange}
            />
            <Selector
                title='ID Column'
                status={availFields.length>0? Status.set:Status.hidden}
                list={availFields}
                onChange={props.setChild}
                selected={props.selectedProps.worksheet.childId.fieldName}
            />
            <TextField {...inputProps} />
            <br />
            <div style={{ marginLeft: '9px' }}>
                The source sheet for the hierarchy should have the {props.selectedProps.worksheet.childId.fieldName} field with the below formula.  If it does not, please add/edit it and re-configure the extension:
                <br />
            <span style={{ fontStyle: 'italic', marginLeft: '5px' }}>{`   ${ formula() }`}</span>
            </div>
            <br />
            <Container style={{ border: '1px solid #e6e6e6', padding: '1px', marginLeft: '9px' }}>
                <Row>

                    <Col>
                        {props.selectedProps.worksheet.fields&&props.selectedProps.worksheet.fields.length?
                            <div>Hierarchy fields (in order)
                <SortableList
                                    items={props.selectedProps.worksheet.fields}
                                    onSortEnd={onSortEnd}
                                    lockAxis='y'
                                    helperClass={'draggingSort'}
                                />
                            </div>
                            :<span style={{ border: '1px solid #e6e6e6', padding: '1px' }}>No fields in hierarchy.</span>}
                    </Col>
                    <Col xs='auto'>
                        <RSButton onClick={addToList} color='primary' size='xs' disabled={!availFieldsSansChildId.length}>{`<<`}</RSButton>
                    </Col>
                    <Col>
                        {availFieldsSansChildId.length>0?
                            <>
                                <StaticFieldsList
                                    items={availFieldsSansChildId}
                                    onSortEnd={onSortEnd}
                                    lockAxis='y'
                                    helperClass={'draggingSort'}
                                />

                            </>
                            :'All fields are used'}
                        <p />

                    </Col>
                </Row>
            </Container>


            {/*             {props.selectedProps.worksheet.childId.fieldName? <>Selected Key = props.selectedProps.worksheet.childId.fieldName}
                <RSButton onClick={removeId} color='white' size='xs' disabled={!props.selectedProps.worksheet?.childId?.fieldName} style={{ color: 'red' }} >X</RSButton></>:`No id selected for lowest level of hierarchy.`} */}


            {/* <Selector
                title='Parent ID'
                status={state.worksheetStatus!==Status.set? Status.hidden:state.worksheetStatus}
                list={props.fieldArr}
                onChange={props.setParent}
                selected={props.selectedProps.worksheet?.parentId?.fieldName}
            />*/}
            {/*             <Selector
                title='Child ID'
                status={state.worksheetStatus!==Status.set? Status.hidden:state.worksheetStatus}
                list={props.fieldArr}
                onChange={props.setChild}
                selected={props.selectedProps.worksheet?.childId?.fieldName}
            />  */}


            {/* <Selector
                title='Child label'
                status={state.worksheetStatus!==Status.set? Status.hidden:state.worksheetStatus}
                list={props.fieldArr}
                onChange={props.setChildLabel}
                selected={props.selectedProps.worksheet?.childLabel?.fieldName}
            /> */}
        </div>);



}