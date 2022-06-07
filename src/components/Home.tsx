import * as React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/style.css';
import hierimage from "../images/TableauHierarchyNavigator.png";
 
class AHome extends React.Component<any, any> {
	public render() {	
        return (
			<React.Fragment>
				<div className='icontainer'>
					<div className='box'>
						<div className='left'>
							<div><img src={hierimage} width='45%'/></div>
							<h1 className='iheader'>Hierarchy Navigator Extension</h1>
							<span className='tagline'>Recursive Data Visualized</span>
						</div>
						<div className='right'>
							<h4 className='big'>What is it?</h4>
							<p>This extension allows you to take flat/dimensional or recursive data and visualize it and enable interactions with other dashboard components.  </p>
							<p>Why? Because users have been <a href='https://community.tableau.com/ideas/1083'>asking</a> for this for a long time.</p>
							<h4 className='big'>Using the Extension</h4>
							<ol>
                                <li>Download/find the sandboxed <a href='https://tableau.github.io/extension-hierarchy-navigator-sandboxed/hierarchynavigator-1.0.sandboxed.trex'> manifest file</a>.</li>
								<li>View the <a href='https://github.com/tableau/extension-hierarchy-navigator-sandboxed'>README</a> in the GitHub repository and <a href='https://tableau.github.io/extension-hierarchy-navigator-sandboxed/Hierarchy%20Navigator%20Extension%20v2.twbx'>download (v2 2018.3+ with Set Actions)</a> the sample workbook with directions and examples.  This <a href='https://tableau.github.io/extension-hierarchy-navigator-sandboxed/Dimensional-Flat%20example%20Hierarchy%20Navigator_v2018.2.twbx'>workbook</a> is an example of a dimensional/flat hierarchy in 2018.2 (pre-parameter and set actions)</li>
							</ol>
							<p><b>Note:</b> You can add as many instances of this extension as you like!</p>
							<div className='gh' style={{paddingTop: '10px'}}>
								Get this extension and more in the <a href='https://extensiongallery.tableau.com/'>Extension Gallery</a>.
								<br />
								<a href='https://tableau.github.io/extension-hierarchy-navigator-sandboxed'>View on GitHub</a>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
        );
    }
}

export default AHome;
const container = document.getElementById('app') as HTMLElement;
const root = createRoot(container);

root.render(<AHome tab="home" />);