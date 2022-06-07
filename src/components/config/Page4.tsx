import { Checkbox, Stepper, TextField, TextArea, TextFieldProps, TextAreaProps, Tabs, DropdownSelect, DropdownSelectProps } from '@tableau/tableau-ui';
import { InputAttrs, TextAreaAttrs } from '@tableau/tableau-ui/lib/src/utils/NativeProps';
import React, { useEffect, useState } from 'react';
import { HierarchyProps, HierType } from '../API/Interfaces';

interface Props {
    data: HierarchyProps;
    setUpdates: (obj: { type: string, data: any; }) => void;
}

export function Page4(props: Props) {
    const setTitleInputProps: TextFieldProps & InputAttrs & React.RefAttributes<HTMLInputElement> = {
        disabled: !props.data.options.titleEnabled,
        message: undefined,
        kind: 'line' as 'line' | 'outline' | 'search',
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_TITLE', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SET_TITLE', data: 'Hierarchy Navigator' });
        },
        style: { paddingLeft: '9px' },
        value: props.data.options.title
    };
    const setFontFamilyInputProps: TextAreaProps & TextAreaAttrs & React.RefAttributes<HTMLTextAreaElement> = {
        label: "Font Family",
        message: undefined,
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_FONT_FAMILY', data: e.target.value });
        },
        style: { paddingLeft: '9px', fontFamily: props.data.options.fontFamily, marginTop: '3px', width: "420px" },
        value: props.data.options.fontFamily,
        rows: 3
    };
    const setFontSizeInputProps: TextFieldProps & InputAttrs & React.RefAttributes<HTMLInputElement> = {
        label: "Font Size",
        message: undefined,
        kind: 'line' as 'line' | 'outline' | 'search',
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_FONT_SIZE', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SET_FONT_SIZE', data: '12px' });
        },
        style: { paddingLeft: '9px' },
        value: props.data.options.fontSize
    };
    const [itemCSS, setItemCSS] = useState(JSON.stringify(props.data.options.itemCSS));
    const [itemCSSValid, setItemCSSValid] = useState(true);
    const [itemCSSMessage, setItemCSSMessage] = useState(<br />)
    const setItemCSSInputProps: TextAreaProps & TextAreaAttrs & React.RefAttributes<HTMLTextAreaElement> = {
        label: "CSS for Items",
        message: itemCSSValid ? <br /> : itemCSSMessage,
        valid: itemCSSValid ? undefined : itemCSSValid,
        onChange: (e: any) => {
            setItemCSS(e.target.value);
            try {
                console.log(`e.target.value: ${e.target.value}`)
                let json = JSON.parse(e.target.value);
                props.setUpdates({ type: 'SET_ITEM_CSS', data: json });

                setItemCSSMessage(<br />);
                setItemCSSValid(true);
            }
            catch (err) {
                console.log(err.message);
                setItemCSSValid(false);
                setItemCSSMessage(<>Invalid JSON: {err.message}</>);
            }
        },

        style: { paddingLeft: '9px', width: "420px" },
        value: itemCSS,
        rows: 3
    };


    const defaultClosedIcon = <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'>
        <path fill={props.data.options.fontColor} fillRule='evenodd' d='M12.7632424,18.2911068 L24.112,6.942 L22.698,5.528 L12.0561356,16.1697864 L1.414,5.528 L8.52651283e-14,6.942 L11.3490288,18.2911068 C11.7395531,18.6816311 12.3727181,18.6816311 12.7632424,18.2911068 Z' transform='matrix(0 1 1 0 0 0)' /> </svg>;

    const defaultOpenedIcon = <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'>
        <path fill={props.data.options.fontColor} fillRule='evenodd' d='M12.7632424,17.6209712 L24.112,6.27186438 L22.698,4.85786438 L12.0561356,15.4996508 L1.414,4.85786438 L4.08562073e-14,6.27186438 L11.3490288,17.6209712 C11.7395531,18.0114954 12.3727181,18.0114954 12.7632424,17.6209712 Z' /></svg>;

    const [openedIconPreview, setOpenedIconPreview] = useState<any>(defaultOpenedIcon)
    const [closedIconPreview, setClosedIconPreview] = useState<any>(defaultClosedIcon)
    const items = [
        { value: 'Default' },
        { value: 'Base64 Image' },
        { value: 'Ascii' }
    ]
    const makeOption = (item: any, index: number) => <option disabled={item.disabled || item.separator} key={index} value={item.value}>{item.value}</option>;
    const [openedIconState, setOpenedIconState] = useState({ value: props.data.options.openedIconType });
    const [closedIconState, setClosedIconState] = useState({ value: props.data.options.closedIconType });
    const setOpenedIconInputProps: TextAreaProps & TextAreaAttrs & React.RefAttributes<HTMLTextAreaElement> = {
        label: props.data.options.openedIconType === 'Default' ? undefined : props.data.options.openedIconType === 'Base64 Image' ? 'Paste a Base64 image string below' : 'Use any ascii character(s)',
        onChange: (e: any) => {
            if (props.data.options.openedIconType === 'Base64 Image') {
                props.setUpdates({ type: 'SET_OPENED_ICON_BASE64IMAGE', data: e.target.value });
            }
            else if (props.data.options.openedIconType === 'Ascii') {
                props.setUpdates({ type: 'SET_OPENED_ICON_ASCII', data: e.target.value });
            }
        },
        style: { paddingLeft: '9px', width: "420px", display: props.data.options.openedIconType === 'Default' ? 'None' : '' },
        value: props.data.options.openedIconType === 'Base64 Image' ? props.data.options.openedIconBase64Image : props.data.options.openedIconAscii,
        rows: props.data.options.openedIconType === 'Base64 Image' ? 3 : 1
    };
    const setClosedIconInputProps: TextAreaProps & TextAreaAttrs & React.RefAttributes<HTMLTextAreaElement> = {
        label: props.data.options.closedIconType === 'Default' ? undefined : props.data.options.closedIconType === 'Base64 Image' ? 'Paste a Base64 image string below' : 'Use any ascii character(s)',
        onChange: (e: any) => {
            if (props.data.options.closedIconType === 'Base64 Image') {
                props.setUpdates({ type: 'SET_CLOSED_ICON_BASE64IMAGE', data: e.target.value });
            }
            else if (props.data.options.closedIconType === 'Ascii') {
                props.setUpdates({ type: 'SET_CLOSED_ICON_ASCII', data: e.target.value });
            }
        },
        style: { paddingLeft: '9px', width: "420px", display: props.data.options.closedIconType === 'Default' ? 'None' : '' },
        value: props.data.options.closedIconType === 'Base64 Image' ? props.data.options.closedIconBase64Image : props.data.options.closedIconAscii,
        rows: props.data.options.closedIconType === 'Base64 Image' ? 3 : 1
    };
    useEffect(() => {
        // set the preview image when the type is changed
        if (props.data.options.openedIconType === 'Default') {
            setOpenedIconPreview(defaultOpenedIcon);
        }
        else if (props.data.options.openedIconType === 'Base64 Image') {
            setOpenedIconPreview(<img src={props.data.options.openedIconBase64Image} width="12px" height="12px" />);
        }
        else if (props.data.options.openedIconType === 'Ascii') {
            setOpenedIconPreview(<span  style={{color: props.data.options.fontColor}}>{props.data.options.openedIconAscii}</span>);
        }
        if (props.data.options.closedIconType === 'Default') {
            setClosedIconPreview(defaultClosedIcon);
        }
        else if (props.data.options.closedIconType === 'Base64 Image') {
            setClosedIconPreview(<img src={props.data.options.closedIconBase64Image}width="12px" height="12px" />);
        }
        else if (props.data.options.closedIconType === 'Ascii') {
            setClosedIconPreview(<span  style={{color: props.data.options.fontColor}}>{props.data.options.closedIconAscii}</span>);
        }

    }, [props.data.options.openedIconType, props.data.options.closedIconType, props.data.options.openedIconBase64Image,props.data.options.closedIconBase64Image, props.data.options.openedIconAscii, props.data.options.closedIconAscii, props.data.options.fontColor]);
    const setOpenedIconInputPropsDropdown: DropdownSelectProps & React.RefAttributes<HTMLSelectElement> = {
        onChange: (e: any) => {
            setOpenedIconState({ value: e.target.value as 'Default' | 'Base64 Image' | 'Ascii' })
            props.setUpdates({ type: 'SET_OPENED_ICON_TYPE', data: e.target.value });
        },
        label: 'Open Icon Type',
        kind: 'line'
    };
    const setClosedIconInputPropsDropdown: DropdownSelectProps & React.RefAttributes<HTMLSelectElement> = {
        onChange: (e: any) => {
            setClosedIconState({ value: e.target.value as 'Default' | 'Base64 Image' | 'Ascii' })
            props.setUpdates({ type: 'SET_CLOSED_ICON_TYPE', data: e.target.value });
        },
        label: 'Closed Icon Type',
        kind: 'line'
    };
    const setBGColorInputProps: TextFieldProps & InputAttrs & React.RefAttributes<HTMLInputElement> = {
        label: "Background Color",
        message: undefined,
        kind: 'line' as 'line' | 'outline' | 'search',
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_BG_COLOR', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SET_BG_COLOR', data: '#F3F3F3' });
        },
        style: { paddingLeft: '9px' },
        value: props.data.options.bgColor
    };
    const setFontColorInputProps: TextFieldProps & InputAttrs & React.RefAttributes<HTMLInputElement> = {
        label: "Font Color",
        message: undefined,
        kind: 'line' as 'line' | 'outline' | 'search',
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_FONT_COLOR', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SET_FONT_COLOR', data: 'rgba(0, 0, 0, 0.8)' });
        },
        style: { paddingLeft: '9px' },
        value: props.data.options.fontColor
    };
    const setHighlightColorInputProps: TextFieldProps & InputAttrs & React.RefAttributes<HTMLInputElement> = {
        label: "Highlight Color",
        message: undefined,
        kind: 'line' as 'line' | 'outline' | 'search',
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_HIGHLIGHT_COLOR', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SET_HIGHLIGHT_COLOR', data: 'rgba(0, 0, 0, 0.8);' });
        },
        style: { paddingLeft: '9px' },
        value: props.data.options.highlightColor
    };
    const changeTitleEnabled = (e: React.ChangeEvent<HTMLInputElement>): void => {
        props.setUpdates({ type: 'TOGGLE_TITLE_DISABLED', data: e.target.checked });
    };
    const changeSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
        props.setUpdates({ type: 'TOGGLE_SEARCH_DISPLAY', data: e.target.checked });
    };
    // Handles change in background color input
    const bgChange = (color: any): void => {
        props.setUpdates({ type: 'SET_BG_COLOR', data: color.target.value });

    };
    const fontColorChange = (color: any): void => {
        props.setUpdates({ type: 'SET_FONT_COLOR', data: color.target.value });
    };
    const highlightColorChange = (color: any): void => {
        props.setUpdates({ type: 'SET_HIGHLIGHT_COLOR', data: color.target.value });
    };
    const changeDebounce = (value: number): void => {
        props.setUpdates({ type: 'SET_DEBOUNCE', data: value });

    };
    const toggleDebug = (e: React.ChangeEvent<HTMLInputElement>): void => {
        props.setUpdates({ type: 'TOGGLE_DEBUG', data: e.target.checked });
    };
    const toggleDashboardListenersEnabled = (e: React.ChangeEvent<HTMLInputElement>): void => {
        props.setUpdates({ type: 'TOGGLE_DASHBOARD_LISTENERS', data: e.target.checked });
    };




    const [tabIndex, setTabIndex] = useState(0)
    let tabs = [{ content: 'General' }, { content: 'Colors/Fonts' }, { content: 'Icons' }];
    let tabContent = [];
    let tab1 = <div>
        <Checkbox
            checked={props.data.options.searchEnabled}
            onChange={changeSearch}
        />     Show Search Box
        <p />

        <br />
        <Checkbox
            checked={props.data.options.titleEnabled}
            onChange={changeTitleEnabled}
        >Show Title

        </Checkbox>
        <TextField {...setTitleInputProps} />
        <Checkbox
            checked={props.data.options.dashboardListenersEnabled}
            onChange={toggleDashboardListenersEnabled}
        >
            Parameters should listen for dashboard changes.  Only needed if the Extension should listen to changes coming from the dashboard for {props.data.type === HierType.RECURSIVE ? 'Child ID and Child Label' : 'Child Label'}.  EG - will the dashboard drive the selection of the hierarchy.
        </Checkbox>
        <div style={{ marginLeft: '18px', display: props.data.options.dashboardListenersEnabled ? '' : 'none' }}>
            <Stepper min={100} max={10000} step={50} pageSteps={5} value={props.data.options.debounce} floatingPoint={false} onValueChange={changeDebounce} disabled={!props.data.options.dashboardListenersEnabled} className='mb-2' /> If the dashboard updates slowly when changing values and the Extension is listening to dashboard changes you may experience a circular loop where the Extension and dashboard are both trying to control the data.  In this case, increase the debounce time (in ms).
        </div>

        <p />
        <Checkbox
            checked={props.data.options.debug}
            onChange={toggleDebug}
        >
            Enable Debug
        </Checkbox>
    </div>
    let tab2 = <div>
        <div style={{ color: "gray" }}> Note:  color picker pop-up may open behind this window.</div>
        <div style={{ display: "flex", padding: "5px 0 5px 0" }}>
            <div style={{ display: "flex", width: "50%" }}>
                <TextField {...setBGColorInputProps} />
                <div>

                    <input type='color' value={props.data.options.bgColor} onChange={bgChange} style={{ backgroundColor: props.data.options.bgColor, "marginTop": "23px" }} className='mb-2' />
                </div>
            </div>
            <div style={{ display: "flex", padding: "5px 0 5px 0" }}>
                <TextField {...setHighlightColorInputProps} />
                <div>

                    <input type='color' value={props.data.options.highlightColor} onChange={highlightColorChange} style={{ backgroundColor: props.data.options.highlightColor, "marginTop": "23px" }} className='mb-2' />
                </div>
            </div>
        </div>
        <div style={{ display: "flex", padding: "5px 0 5px 0" }}>
            <div style={{ display: "flex", width: "50%" }}>
                <TextField {...setFontColorInputProps} />
                <div>
                    <input type='color' value={props.data.options.fontColor} onChange={fontColorChange} style={{ backgroundColor: props.data.options.fontColor, "marginTop": "23px" }} className='mb-2' />
                </div>
            </div>
            <div>
                <TextField {...setFontSizeInputProps} />
            </div>
        </div>
        <div style={{ display: "flex", padding: "5px 0 5px 0" }}>
            <TextArea {...setFontFamilyInputProps} />
        </div>
        <div style={{ display: "flex", padding: "5px 0 5px 0" }}>
            <TextArea {...setItemCSSInputProps} />
        </div>
    </div>
    let tab3 =
        <div>
            <div className="mb-4">

                <DropdownSelect {...openedIconState} {...setOpenedIconInputPropsDropdown}>
                    {items.map(makeOption)}
                </DropdownSelect>
                <TextArea {...setOpenedIconInputProps} />
            </div>
            <div className="mb-4">

                <DropdownSelect {...closedIconState} {...setClosedIconInputPropsDropdown}>
                    {items.map(makeOption)}
                </DropdownSelect>
                <TextArea {...setClosedIconInputProps} />
            </div>

            <div>
                <label>Icon Preview</label>
                <div className="mt-2">{openedIconPreview} Furniture</div>
                <div style={{paddingLeft: "2rem"}}>Bookcases</div>
                <div style={{paddingLeft: "2rem"}}>Chairs</div>
                <div>{closedIconPreview} Office Supplies</div>
                <div>{closedIconPreview} Technology</div>
            </div>
        </div>
    tabContent.push(tab1, tab2, tab3);
    // Options CONTENT
    return (
        <div className='mb-2'>
            <Tabs
                onTabChange={(index) => {
                    console.log(`onChange: ${index}`);
                    setTabIndex(index);
                }}
                selectedTabIndex={tabIndex}
                tabs={tabs}
            >
                <span>{tabContent[tabIndex]}</span>
            </Tabs>

        </div >
    );
}