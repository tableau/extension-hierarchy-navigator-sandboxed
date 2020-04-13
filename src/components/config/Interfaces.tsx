/*  tslint:disable:max-classes-per-file */
export {debug} from '../../../config';
// import { DataType } from '@tableau/extensions-api-types/ExternalContract/Namespaces/Tableau';
// import { Extensions } from '@tableau/extensions-api-types';
// declare global {
//     interface Window { tableau: { extensions: Extensions; }; }
// }
export enum HierType {
    FLAT='flat',
    RECURSIVE='recursive'
} 
export enum Status { 'notpossible', 'notset', 'set', 'hidden' }
export interface SimpleField {
    fieldName: string;
    dataType: any, // should be DataType
}
export interface HierarchyProps {
    isConfigure: boolean;
    bgColor: string;
    configComplete: boolean;
    seperator: string;
    type: HierType;
    paramSuffix: string;
    worksheet: SelectedWorksheet,
    parameters: SelectedParameters;
    dashboardItems: AvailableProps;
}
export interface SelectedParameters {
    childId: string,
    childIdEnabled: boolean,
    childLabel: string,
    childLabelEnabled: boolean;
}
export interface AvailableProps {
    parameters: string[], // list of paramaters to be shown to user for selection
    worksheets: string[]; // list of available worksheets 
    allCurrentWorksheetItems: AvailableWorksheet;
}
export interface AvailableWorksheet {
    // worksheetObject: any;
    filters: string[],
    fields: string[]; // store all worksheet names and fields for selecting hierarchy
}
export interface SelectedWorksheet {
    name: string,
    filter: string,
    filterEnabled: boolean,
    parentId: string,
    childId: string,
    childLabel: string;
    enableMarkSelection: boolean;
    fields: string[]; // used for flat hierarchy
    status: Status;
}
export interface SimpleParameter {
    name: string,
    dataType: any;  // should be DataType
}

export interface FilterType {
    fieldName: string;
    isAvailable?: boolean;
    filterType?: any;
}

export const defaultParameter: SimpleParameter={ name: '', dataType: tableau.DataType.String };
export const defaultField: SimpleField={ fieldName: '', dataType: tableau.DataType.String };
export const defaultFilter: FilterType={ fieldName: '', isAvailable: false };
export const defaultSelectedProps: HierarchyProps={
    bgColor: '#F3F3F3',
    configComplete: false,
    dashboardItems: {
        allCurrentWorksheetItems: {
            fields: [],
            filters: []
        },
        parameters: [],
        worksheets: [],
    },
    
    isConfigure: false,
    paramSuffix: ' Param',
    parameters:
    {
        childId: '',
        childIdEnabled: false,
        childLabel: '',
        childLabelEnabled: false
    },
    seperator: '|',
    type: HierType.FLAT,
    worksheet:
    {
        childId: '',
        childLabel: '',
        enableMarkSelection: false,
        fields: [],
        filter: '',
        filterEnabled: false,
        name: '',
        parentId: '',
        status: Status.notpossible
    }
    
    
};



// export const defaultAvailableProps: AvailableProps={
//     parameters: [],
//     worksheets: []
// };
// export const defaultWorksheet: AvailableWorksheet={ name: '', fields: [], filters: [] };


// export interface HierarchyConfig {
//     selectedProps: HierarchyProps;
//     avaliableProps: AvailableProps;
//     enumeratedProps: 
// }

