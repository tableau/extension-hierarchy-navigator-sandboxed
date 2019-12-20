

    
     const enum Status { 'notpossible', 'notset', 'set', 'hidden' }
     const enum FieldUsedByEnum { 'ParentId', 'ChildId', 'ChildLabel', 'None' }
     const enum ParamUsedByEnum { 'Id', 'Label' }
     const enum DataType {
        FLOAT='float',
        INT='int',
        STRING='string',
        BOOLEAN='boolean',
        DATE='date',
        DATETIME='datetime',
        ALL='all'
    }


export interface IField {
    fieldName: string;
    dataType: 'string'|'int',
    // usedBy?: FieldUsedByEnum;
}
export interface ISelectedProps {
    worksheet: SelectedWorksheet,
    parameters: ISelectedParameters;
}
export interface ISelectedParameters {
    childId: IParameter,
    childIdEnabled: boolean,
    childLabel: IParameter,
    childLabelEnabled: boolean;
}
export interface SelectedWorksheet {
    name: string,
    filter: IFilterType,
    filterEnabled: boolean,
    parentId: IField,
    childId: IField,
    childLabel: IField;
    enableMarkSelection: boolean;
}
export interface IParameter {
    name: string,
    dataType: DataType;
}

export interface IFilterType {
    fieldName: string;
    isAvailable?: boolean;
    filterType?: any;
}
export const defaultParameter: IParameter={ name: '', dataType: DataType.STRING };
export const defaultField: IField={ fieldName: '', dataType: DataType.STRING };
export const defaultFilter: IFilterType={ fieldName: '', isAvailable: false };
export const defaultSelectedProps: ISelectedProps={
    worksheet:
    {
        name: '',
        enableMarkSelection: false,
        filter: defaultFilter,
        filterEnabled: false,
        childId: defaultField,
        childLabel: defaultField,
        parentId: defaultField
    },
    parameters:
    {
        childId: defaultParameter,
        childIdEnabled: false,
        childLabel: defaultParameter,
        childLabelEnabled: false
    },
};
