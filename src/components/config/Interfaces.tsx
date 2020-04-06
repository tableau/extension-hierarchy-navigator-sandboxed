export {debug} from '../../../config';

const enum DataType {
    FLOAT='float',
    INT='int',
    STRING='string',
    BOOLEAN='boolean',
    DATE='date',
    DATETIME='datetime',
    ALL='all'
}
export enum HierType {
    FLAT='flat',
    RECURSIVE='recursive'
} 
export enum Status { 'notpossible', 'notset', 'set', 'hidden' }
export interface Field {
    fieldName: string;
    dataType: 'string'|'int',
}
export interface SelectedProps {
    seperator: string;
    type: HierType;
    worksheet: SelectedWorksheet,
    parameters: SelectedParameters;
}
export interface SelectedParameters {
    childId: Parameter,
    childIdEnabled: boolean,
    childLabel: Parameter,
    childLabelEnabled: boolean;
}
export interface AvailableProps {
    parameters: Parameter[], // list of paramaters to be shown to user for selection
    worksheets: AvailableWorksheet[]; // list of available worksheets with their names, fields and filters 
}
export interface AvailableWorksheet {
    name: string,
    filters: FilterType[],
    fields: Field[]; // store all worksheet names and fields for selecting hierarchy
}
export interface SelectedWorksheet {
    name: string,
    filter: FilterType,
    filterEnabled: boolean,
    parentId: Field,
    childId: Field,
    childLabel: Field;
    enableMarkSelection: boolean;
    fields: string[]; // used for flat hierarchy
}
export interface Parameter {
    name: string,
    dataType: DataType;
}

export interface FilterType {
    fieldName: string;
    isAvailable?: boolean;
    filterType?: any;
}

export const defaultParameter: Parameter={ name: '', dataType: DataType.STRING };
export const defaultField: Field={ fieldName: '', dataType: DataType.STRING };
export const defaultFilter: FilterType={ fieldName: '', isAvailable: false };
export const defaultSelectedProps: SelectedProps={
    parameters:
    {
        childId: defaultParameter,
        childIdEnabled: false,
        childLabel: defaultParameter,
        childLabelEnabled: false
    },
    seperator: '|',
    type: HierType.FLAT,
    worksheet:
    {
        childId: defaultField,
        childLabel: defaultField,
        enableMarkSelection: false,
        fields: [],
        filter: defaultFilter,
        filterEnabled: false,
        name: '',
        parentId: defaultField,
    },
    
};
