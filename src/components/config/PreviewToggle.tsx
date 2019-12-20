import * as React from 'react';
import Switch from 'react-switch';

interface SelectorProps {
    allowableValues: any;
    enabled: boolean;
    which_label: number;
    txt: string;
    parameter: string;
    show_name: boolean;
    bg: string;
}
interface State {
    checked: boolean
}
// Shows if setting has not yet been configured
class PreviewToggle extends React.Component<SelectorProps, State> {
    public state: State = {
        checked: false
    }
    public constructor(props: any) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }
    public render() {
        const { allowableValues, bg, which_label, enabled, txt, show_name, parameter } = this.props;
        let label = ''
        if (enabled) {
            label = allowableValues.allowableValues[which_label].formattedValue
        }
        const height=18
        return (
            <div style={{ display: enabled ? '' : 'none' }} className='pt-2'>
                <div style={{paddingLeft: '10px' }}>
                    Preview the toggle switch
                </div>
                <div className='col-sm p-3 d-flex flex-wrap' style={{ backgroundColor: bg, borderStyle: 'solid', borderColor: 'lightgray' }}>
                    <div className='pr-2' style={{ fontWeight: 'bold', color: txt }}>
                        {show_name ? parameter : ''}
                    </div>
                    <div>
                        <label>
                            <Switch
                                checked={this.state.checked}
                                onChange={this.onChange} 
                                height={height}
                                width={height*2}
                                className='react-switch'
                                />
                            <span style={{ color: txt, marginLeft: '4px' }}>{label}</span>
                        </label>
                    </div>
                </div>
            </div>
        );
    };
    private onChange() {
        this.setState((prevState) => ({ checked: !prevState.checked }))
    }
}

export default PreviewToggle;