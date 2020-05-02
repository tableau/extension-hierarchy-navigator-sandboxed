import * as React from 'react';
import { Col, Container, Row } from 'reactstrap';

/* tslint:disable:no-console */

// Shows if setting has not yet been configured
class Colors extends React.Component<any> {
    public render() {
        return (
            <div style={{ display: this.props.enabled? '':'none' }} className='pt-2'>
                <div style={{ paddingLeft: '10px' }}>
                    {/* Choose colors */}
                </div>
                <Container>
                    <Row>
                        <Col className='col-sm'>
                            Background Color (color picker pop-up may open behind this window)
                        </Col>
                    </Row>
                    <Row>
                        <Col className='col-sm'>
                            <input type='color' value={this.props.bg} onChange={this.props.onBGChange} style={{ backgroundColor: this.props.bg }} />
                        </Col>
                    </Row>
                </Container>
            </div>

        );
    };
}


export default Colors;