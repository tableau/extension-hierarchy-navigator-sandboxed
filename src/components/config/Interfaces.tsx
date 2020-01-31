
const enum DataType {
    FLOAT='float',
    INT='int',
    STRING='string',
    BOOLEAN='boolean',
    DATE='date',
    DATETIME='datetime',
    ALL='all'
}
    

export interface Field {
    fieldName: string;
    dataType: 'string'|'int',
    // usedBy?: FieldUsedByEnum;
}
export interface SelectedProps {
    worksheet: SelectedWorksheet,
    parameters: SelectedParameters;
}
export interface SelectedParameters {
    childId: Parameter,
    childIdEnabled: boolean,
    childLabel: Parameter,
    childLabelEnabled: boolean;
}
export interface SelectedWorksheet {
    name: string,
    filter: FilterType,
    filterEnabled: boolean,
    parentId: Field,
    childId: Field,
    childLabel: Field;
    enableMarkSelection: boolean;
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
    worksheet:
    {
        childId: defaultField,
        childLabel: defaultField,
        enableMarkSelection: false,
        filter: defaultFilter,
        filterEnabled: false,
        name: '',
        parentId: defaultField
    },
    
};
