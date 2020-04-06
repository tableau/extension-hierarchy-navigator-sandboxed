import * as React from 'react';
import { Col, Container, Row } from 'reactstrap';

/* tslint:disable:no-console */

// Shows if setting has not yet been configured
class Colors extends React.Component<any> {
   

    public render() {

        return (
          
<div style={{display: this.props.enabled?'':'none'}} className='pt-2'>
<div style={{paddingLeft: '10px' }}>
            {/* Choose colors */}
                </div>
<Container>
    <Row>
    <Col className='col-sm'>
    Background Color 
                        
                        </Col>
                        
    
        
                        {/* <Col className='col-sm'>
                            Text Color
                        </Col> */}
                        
    </Row>
    <Row>
        <Col className='col-sm'>
        <input type='color' value={this.props.bg} onChange={this.props.onBGChange} style={{ backgroundColor: this.props.bg }} />
        </Col>

        {/* <Col className='col-sm'>
        <input type='color' value={this.props.txt} onChange={this.props.onTXTChange} style={{ backgroundColor: this.props.txt }} />
        </Col> */}
    </Row>



</Container>
</div>
         
        );
    };
}


export default Colors;