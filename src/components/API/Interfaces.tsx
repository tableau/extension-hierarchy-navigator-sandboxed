/*  tslint:disable:max-classes-per-file */
export {debugOverride} from './DebugOverride';
export enum HierType {
    FLAT='flat',
    RECURSIVE='recursive'
} 
export enum Status { 'notpossible', 'notset', 'set', 'hidden' }

export interface Options {
    bgColor: string;
    dashboardListenersEnabled: boolean;
    debug: boolean;
    debounce: number;
    fontFamily: string;
    fontColor: string;
    fontSize: string;
    highlightColor: string;
    itemCSS: object;
    searchEnabled: boolean;
    title: string;
    titleEnabled: boolean;
    warningEnabled: boolean;
    openedIconType: 'Default'|'Base64 Image'|'Ascii',
    openedIconBase64Image: any;
    openedIconAscii: string;
    closedIconType: 'Default'|'Base64 Image'|'Ascii',
    closedIconBase64Image: any;
    closedIconAscii: string;
}
export interface HierarchyProps {
    configComplete: boolean;
    options: Options;
    separator: string;
    type: HierType;
    paramSuffix: string;
    worksheet: SelectedWorksheet,
    parameters: SelectedParameters;
    dashboardItems: AvailableProps;
}
export interface SelectedParameters {
    childId: string;
    childIdEnabled: boolean;
    childLabel: string;
    childLabelEnabled: boolean;
    fields: string[];
    level: string;
}
export interface AvailableProps {
    parameters: string[], // all available dashboard parameters
    flatParameters: string[], // parameters available for flat hierarchy child label (excludes level, id, field+suffix array)
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

export const defaultSelectedProps: HierarchyProps={
    configComplete: false,
    dashboardItems: {
        allCurrentWorksheetItems: {
            fields: [],
            filters: []
        },
        flatParameters: [],
        parameters: [],
        worksheets: [],
    },
    options: {
        bgColor: '#F3F3F3',
        dashboardListenersEnabled: false,
        debounce: 250,
        debug: false,
        fontColor: 'rgba(0, 0, 0, 0.8)',
        fontFamily: '"Benton Sans", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important',
        fontSize: '12px',
        highlightColor: '#d1d1d1',
        itemCSS: {"overflow": "hidden", "textOverflow": "ellipsis"},
        searchEnabled: true,
        title: 'Hierarchy Navigator',
        titleEnabled: true,
        warningEnabled: true,
        openedIconType: 'Default',
        openedIconBase64Image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAADKADAAQAAAABAAAADAAAAAATDPpdAAAA4VBMVEUVqkUWq0gXq0gXrEgXrEkYqkkYq0gYrEgZq0kZrEkZrEoaq0oaq0sarEoarEsbq0sbrEscrEwdrUwdrU0erkwfrk4frk8grk8lr1IqsVcrslcvslsztV84tmE4tmI6tmNGvG5LvnNRwHVRwHdTwXdXwXpZwnxfxIFixoNjxoVryYt2zJN3zpN5z5Z9z5iI1KGJ06KK1KOM1aWO1aWU2Kui3bWj3bWl3rin4Luq37y/583H69PK7NTU8N3V793d8uXf8+Xj9enl9evr+O/u+fDw+fPx+fPz+/X2/Pj5/fr///+ZT53UAAAAfElEQVQIHS3BbQoCIRAA0JlxdEIMl+3rXxfoJt3/DkEtlNlC6mrB4nt4hSXE3IxzFhi+9+eSQYftwXN7TC/FkFKurI63aBQicq5Cn8Cw0nOglKCTQkTQZSTL0JUN2X2EVRpHdVF1Ivy16E47Rk8yv8twHgfDoL0pqRoRgT8pXS3ORVTkLQAAAABJRU5ErkJggg==",
        openedIconAscii: '+',
        closedIconType: 'Default',
        closedIconBase64Image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAMAAABFNRROAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAADaADAAQAAAABAAAADQAAAACpyhiuAAAAbFBMVEWYtoegmGuimW2lqH2lu5LBsZLB48nCs5XIiGjV69nbj3jjva3l9evw1s3w+fPx+fPyYlDzt6zz+/X29/P2/Pj3uLD4ZFT5/fr8Zlj9Zln929f/WEr/WUr/WUv/Z1r/nJT/yMT/ycX/+vr///+WHPpoAAAAWElEQVQIHQXBBQLCQBAEsMXdnWsoZf7/R5JKDosjPIeksl0C9KnrBICh5h0AnypoNKgRANQYAGoKjQa16gD41GMGwFDZrwH6VHLe3OH1TSpJLrvT7f1L8gdOIRH4K7Pd+AAAAABJRU5ErkJggg==",
        closedIconAscii: '-'
    },
    paramSuffix: ' Param',
    parameters:
    {
        childId: '',
        childIdEnabled: false,
        childLabel: '',
        childLabelEnabled: false,
        fields: [], // for flat hier, auto-generated field+suffix parameters
        level: 'Level Param',
    },
    separator: '|',
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