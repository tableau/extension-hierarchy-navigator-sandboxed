import { TextField, TextFieldProps } from '@tableau/tableau-ui';
import { InputAttrs } from '@tableau/tableau-ui/lib/src/utils/NativeProps';
import {arrayMoveImmutable} from 'array-move';
import React, { useEffect, useState } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { Button as RSButton, Col, Container, Row } from 'reactstrap';
import dragHandle from '../../images/Drag-handle-01.png';  //'. /src/images/Drag-handle-01.png';
import { HierarchyProps, Status } from '../API/Interfaces';
import { withHTMLSpaces } from '../API/Utils';
import { Selector } from '../shared/Selector';
const extend=require('extend');

interface Props {
    data: HierarchyProps;
    setUpdates: (obj: { type: string, data: any; }) => void;
    onClear?: () => void;
    setCurrentWorksheetName: (s: string) => void;
}

export function Page2Flat(props: Props) {
    // availFields are fields on worksheet that are not added to hierarchy (aka worksheet.fields); used for childID selector
    const [availFields, setAvailFields]=useState<string[]>([]);
    // sans child is all available fields except child id field; used for left ul
    const [availFieldsSansChildId, setAvailFieldsSansChildId]=useState<string[]>([]);
    const { fields: allFields }=props.data.dashboardItems.allCurrentWorksheetItems;

    useEffect(() => {
        const avail: string[]=[];
        const sansChildId: string[]=[];
        // tslint:disable prefer-for-of
        for(let i=0;i<allFields.length;i++) {
            if(!props.data.worksheet.fields.includes(allFields[i])) {
                avail.push(allFields[i]);
                if(allFields[i]!==props.data.worksheet.childId) {
                    sansChildId.push(allFields[i]);
                }
            }
        }
        // tslint:enable prefer-for-of
        setAvailFields(avail);
        setAvailFieldsSansChildId(sansChildId);
    }, [props.data.worksheet.fields, props.data.worksheet.childId]);

    // Handles selection in worksheet selection dropdown
    const worksheetChange=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        props.setCurrentWorksheetName(e.target.value);
    };

    const setChild=(e: React.ChangeEvent<HTMLSelectElement>): void => {
        props.setUpdates({ type: 'SET_CHILD_ID_FIELD', data: e.target.value });
    };


    const worksheetTitle=() => {
        switch(props.data.worksheet.status) {
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
    const SortableItem=SortableElement(({ value }: any) => <li value={value}><DragHandle />{withHTMLSpaces(value)}
        <RSButton value={value} onClick={removeFromList} color='white' size='xs' style={{ color: 'red' }}>X</RSButton>
    </li>);

    const SortableList=SortableContainer(({ items }: any) => {
        if(!items) { return (<li>No items</li>); }
        return (
            <ul className={'sortableList'}>
                {items.map((value: any, index: any) => (
                    <SortableItem key={`item-${ value }`} index={index} value={value} />
                ))}
            </ul>
        );
    });

    const StaticFieldsItem=SortableElement(({ value }: any) => <li value={value}>{withHTMLSpaces(value)}
        <RSButton value={value} onClick={addToList} color='white' size='xs' style={{ color: 'blue' }}>Add</RSButton>
    </li>);

    const StaticFieldsList=SortableContainer(({ items }: any) => {
        if(!items) { return (<li>No items</li>); }
        return (
            <ul className={'sortableList'}>
                {items.map((value: any, index: any) => (
                    <StaticFieldsItem key={`item-${ value }`} index={index} value={value} disabled={true}/>
                ))}
            </ul>
        );
    });

    // sort lists
    const onSortEnd=({ oldIndex, newIndex }: any) => {
        const newOrder=arrayMoveImmutable(props.data.worksheet.fields, oldIndex, newIndex);
        props.setUpdates({ type: 'SET_FIELDS', data: newOrder });
    };

    // remove from list
    const removeFromList=(evt: any) => {
        const filteredItems=props.data.worksheet.fields.filter((item: string) => {
            return item!==evt.target.value;
        }
        );
        props.setUpdates({ type: 'SET_FIELDS', data: filteredItems });
    };

    // add to list
    const addToList=(evt?: any) => {
        const fields: string[]=extend(true, [], props.data.worksheet.fields);
        if(evt.target&&evt.target.value) {
            fields.push(evt.target.value);
        }
        else {
            allFields.forEach(el => {
                if(fields.indexOf(el)===-1&&el!==props.data.worksheet.childId) {
                    fields.push(el);
                }
            });
        }
        props.setUpdates({ type: 'SET_FIELDS', data: fields });
    };
    const inputProps: TextFieldProps & InputAttrs & React.RefAttributes<HTMLInputElement>={
        message: undefined,
        kind: 'line' as 'line'|'outline'|'search',
        label: `Separator for ${ props.data.worksheet.childId } field formula.`,
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_SEPARATOR', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SET_SEPARATOR', data: '|' });
        },
        style: { width: 200, paddingLeft: '9px' },
        value: props.data.separator,
    };

    const formula=() => {
        let f='';
        for(let i=0;i<props.data.worksheet.fields.length;i++) {
            f+=`[${ withHTMLSpaces(props.data.worksheet.fields[i]) }]`;
            if(i<props.data.worksheet.fields.length-1) {
                f+=`+'${ props.data.separator }'+`;
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
                status={props.data.worksheet.status}
                selected={props.data.worksheet.name}
                list={props.data.dashboardItems.worksheets}
                onChange={worksheetChange}
            />
            <Selector
                title='ID Column'
                status={availFields.length>0? Status.set:Status.hidden}
                list={availFields}
                onChange={setChild}
                selected={props.data.worksheet.childId}
            />
            <TextField {...inputProps} />
            <br />
            <div style={{ marginLeft: '9px' }}>
                The source sheet for the hierarchy should have the {props.data.worksheet.childId} field with the below formula.  If it does not, please add/edit it and re-configure the extension:
                <br />
                <span style={{ fontStyle: 'italic', marginLeft: '5px' }}>{`   ${ formula() }`}</span>
            </div>
            <br />
            <Container style={{ border: '1px solid #e6e6e6', padding: '1px', marginLeft: '9px' }}>
                <Row>

                    <Col>
                        {props.data.worksheet.fields&&props.data.worksheet.fields.length?
                            <div>Hierarchy fields (in order)
                <SortableList
                                    items={props.data.worksheet.fields}
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
                                    lockAxis='y'
                                />

                            </>
                            :allFields.length? 'All fields are used':'No fields available'}
                        <p />

                    </Col>
                </Row>
            </Container>
        </div>);
}