import React, { useEffect, useRef, useState, ReactFragment } from 'react';
import TreeMenu from 'react-simple-tree-menu';
import { SelectedWorksheet } from '../config/Interfaces';

interface Tree {
    key: string,
    label: string,
    parent: string,
    path?: string,
    nodes: Tree[];
}
interface PathMap {
    key: string,
    label: string,
    path: string;
}
interface Props {
    currentId: string,
    currentLabel: string;
    dashboard: any;
    lastUpdated: Date;
    worksheet: SelectedWorksheet;
    configComplete: boolean;
    setDataFromExtension: (data: { currentId: string, currentLabel: string, childrenById?: string[], childrenByLabel?: string[]; }) => void;
}
const debug=false;

function Hierarchy(props: Props) {
    const childRef=useRef<any>(null);
    const [currentLabel, setCurrentLabel]=useState(props.currentLabel);
    const [currentId, setCurrentId]=useState(props.currentId);
    const [pathMap, setPathMap]=useState();
    const [childOf, setChildOf]=useState();
    const [tree, setTree]=useState();
    let _pathMap: PathMap[]=[];

    // if user sets ID parameter in dashboard, this will be triggered
    useEffect(() => {
        console.log(`useEffect for props.currentId`);
        if(props.currentId!==currentId&&props.configComplete) {
            // if we set state locally we don't want to re-run state when props is updated in paramhandler
            setcurrentIdFromDashboard();
        }
    }, [props.currentId]);

    // if user sets Label parameter in dashboard, this will be triggered
    useEffect(() => {
        if(props.currentLabel!==currentLabel&&props.configComplete) {
            // if we set state locally we don't want to re-run state when props is updated in paramhandler
            setcurrentLabelFromDashboard();
        }
    }, [props.currentLabel]);

    // when we get a new lastUpdated date/time we know a config change (or first load)
    // happened and will (re)build the hierarchy.
    useEffect(() => {
        clearHierarchy();
        if(props.configComplete) { loadHierarchyFromDataSource(); }
    }, [props.lastUpdated]);

    async function asyncForEach(array: any[], callback: any) {
        for(let index=0;index<array.length;index++) {
            await callback(array[index], index, array);
        }
    };

    // this function handles loading and of stored values and live params 
    async function loadHierarchyFromDataSource() {
        const map: any[]=[];
        if(props.dashboard) {
            await asyncForEach(props.dashboard.worksheets, async (worksheet: any) => {
                if(worksheet.name===props.worksheet.name) {
                    if(debug) { console.log(`found worksheet: ${ worksheet.name }`); }
                    await worksheet.getSummaryDataAsync().then(async (dataTable: any) => {
                        let parentIDCol=0;
                        let childLabelCol=1;
                        let childIDCol=2;
                        await asyncForEach(dataTable.columns, (column: any) => {
                            if(column.fieldName===props.worksheet.parentId.fieldName) {
                                parentIDCol=column.index;
                            }
                            else if(column.fieldName===props.worksheet.childLabel.fieldName) {
                                childLabelCol=column.index;
                            }
                            if(column.fieldName===props.worksheet.childId.fieldName) {
                                childIDCol=column.index;
                            }
                        });
                        if(debug) { console.log(`parentCol: ${ parentIDCol }  childCol: ${ childLabelCol } keyCol: ${ childIDCol }`); }
                        let isSet: boolean=false;
                        dataTable.data.forEach((row: any, index: number) => {
                            map.push({ parent: row[parentIDCol].formattedValue, label: row[childLabelCol].formattedValue, key: row[childIDCol].formattedValue, nodes: [] });
                            if(!isSet) {
                                isSet=true;
                                setCurrentLabel(row[childLabelCol].formattedValue);
                                setCurrentId(row[childIDCol].formattedValue);
                            }
                        });
                    });
                    if(debug) { console.log('done getting data...'); }
                }
            });
        }
        if(debug) { console.log(`map: vvv`); }
        if(debug) { console.log(map); }
        buildHierarchy(map);
    };

    // upon reload or config changes, reset the hierarchy values
    function clearHierarchy() {
        _pathMap=[];
        setTree([]);
        setPathMap([]);
        setChildOf([]);
    }
    // credit to https://stackoverflow.com/a/58136016/7386278
    function buildHierarchy(data: Tree[]): void {
        if(debug) {
            console.log(`buildHierarchy: incoming data? vvv`);
            console.log(data);
        }
        clearHierarchy();
        let _tree: Tree[]=[]; // object we will return to set state
        const _childOf: any=[]; // object we will return to set state
        data.forEach((item) => {
            const { key, parent }=item;
            _childOf[key]=_childOf[key]||[];
            item.nodes=_childOf[key];
            const _hasParent=!(parent==='Null'||parseInt(parent, 10)===0||parent==='');
            _hasParent? (_childOf[parent]=_childOf[parent]||[]).push(item):_tree.push(item);
        });

        // logic if parent/child are not recursive
        // props to Santiago Sanchez, SC Extraodinaire 12/19/19
        if(!_tree.length&&Object.keys(_childOf).length) {
            if(debug) { console.log(`found non-recursive hierarchy`); }
            const alreadyFound: string[]=[];
            for(const el in _childOf) {
                if(_childOf.hasOwnProperty(el)) {
                    if(debug) { console.log(_childOf[el].length); }
                    if(_childOf[el].length) {
                        // tslint:disable-next-line prefer-for-of
                        for(let i=0;i<_childOf[el].length;i++) {
                            const { parent }=_childOf[el][i];
                            if(!alreadyFound.includes(parent)) {
                                alreadyFound.push(parent);
                                _tree.push({ parent: '', key: parent, label: parent, nodes: _childOf[parent] });
                            }
                        }
                    }
                }
            }
            if(debug) {
                console.log(`_tree was not recursive... morphing into 2 level hierarchy!`);
                console.log(JSON.stringify(_tree));
            }
        }

        _tree=sortTree(_tree); // sort the tree
        buildPathMap(_tree); // build a map of paths to children
        setPathMap(_pathMap); // set the path var
        setChildOf(_childOf); // set children var
        if(debug) {
            console.log('_tree: vvv');
            console.log(_tree);
        }
        setTree(_tree); // set the tree

        // set parameters in dashboard
        props.setDataFromExtension({ currentLabel: _tree[0].label, currentId: _tree[0].key });
    }

    // sort tree alphabetically within each node/parent
    function sortTree(_tree: Tree[]): Tree[] {
        if(_tree.length<=1) { return _tree; }
        if(debug) {
            console.log(`tree.length ${ _tree.length }`);
            console.log(`first node: ${ _tree[0].label }`);
        }
        function compare(a: Tree, b: Tree) {
            if(a.label>b.label) { return 1; }
            else if(b.label>a.label) { return -1; }
            else { return 0; }
        }
        _tree=_tree.sort(compare);
        // tslint:disable-next-line prefer-for-of
        for(let i=0;i<_tree.length;i++) {
            if(_tree[i].nodes&&_tree[i].nodes.length>=2) {
                _tree[i].nodes=sortTree(_tree[i].nodes);
            }
        }
        return _tree;
    }

    // pathMap is a shortcut/map of all nodes + their children
    // used in building hierarchy in a single pass
    function buildPathMap(_data: Tree[], _path=''): void {
        for(const el of _data) {
            _pathMap.push({ key: el.key, path: _path===''? el.key:`${ _path }/${ el.key }`, label: el.label });
            if(el.nodes&&el.nodes.length) {
                buildPathMap(el.nodes, _path===''? el.key:`${ _path }/${ el.key }`);
            }
        }
    }

    // set values if user selects a value in the extension
    async function setSelectedFromExtension(label: string, key: string) {
        if(debug) {
            console.log(`setSelectedFromExtension`);
            console.log(`about to set label:${ label } and key: ${ key }`);
        }
        setCurrentId(key);
        setCurrentLabel(label);
        props.setDataFromExtension({ currentLabel: label, currentId: key, childrenById: getChildren('id', key), childrenByLabel: getChildren('label', key) });
    }
    // make a path from the parent to the selected child node that TreeMenu can ingest
    function makePath(_path: string) {
        const keys=_path.split('/');
        const len=keys.length;
        const out: string[]=[];
        // len-1 so we don't open the target child mode
        for(let i=0;i<len-1;i++) {
            i===0? out.push(keys[i]):out.push(`${ out[i-1] }/${ keys[i] }`);
        }
        return out;
    }
    // when the id is changed on the dashboard, update extension values
    function setcurrentIdFromDashboard() {
        if(debug) {
            console.log(`in setcurrentIdfromDash`);
            console.log(`props.currentId: ${ props.currentId }`);
        }
        let node;
        for(const el of pathMap) {
            if(el.key===props.currentId) {
                node=el;
                if(debug) { console.log(`found node ${ JSON.stringify(el) }`); }
                break;
            }
        }
        if(typeof node!=='undefined') {
            const _openNodes=makePath(node.path);
            if(debug) { console.log(`setting open nodes: ${ _openNodes } and key ${ node.path }`); }
            childRef.current.resetOpenNodes(_openNodes, node.path);
            setCurrentId(node.key);
            setCurrentLabel(node.label);
            // send values back to parameters; this will sync both id/label
            props.setDataFromExtension({ currentLabel: node.label, currentId: node.key });
        }

    }
    // when the label is changed on the dashboard, update extension values
    function setcurrentLabelFromDashboard() {
        if(debug) { console.log(`in setcurrentLabelFromDash`); }
        let node;
        for(const el of pathMap) {
            if(el.label.toString()===props.currentLabel.toString()) {
                node=el;
                break;
            }
        }
        if(typeof node!=='undefined') {
            const _openNodes=makePath(node.path);
            if(debug) { console.log(`setting open nodes: ${ _openNodes } and key ${ node.path }`); }
            childRef.current.resetOpenNodes(_openNodes, node.path);
            setCurrentId(node.key);
            setCurrentLabel(node.label);
            // send values back to parameters; this will sync both id/label
            props.setDataFromExtension({ currentLabel: node.label, currentId: node.key });
        }
    }

    // pass an array of all children to parameters so they can be used in
    // filter & mark selection
    function getChildren(type: string, _currentId: string=currentId) {
        if(debug) { console.log(`getting children for currentId: ${ _currentId } and type ${ type }`); }
        if(!childOf[_currentId].length) { return [type==='id'? _currentId:currentLabel]; }
        const reducer=(accumulator: any[], currentValue: any) => {
            if(currentValue.nodes.length) { accumulator=currentValue.nodes.reduce(reducer, accumulator); }
            if(type==='id') { return [currentValue.key, ...accumulator]; }
            else { return [currentValue.label, ...accumulator]; }
        };
        const arr=childOf[_currentId];
        if(type==='id') {
            return arr.reduce(reducer, [arr[0].parent]);
        }
        else {
            return arr.reduce(reducer, [currentLabel]);
        }
    }

    // display state info?
    const debugState: ReactFragment=(<div>State: {`id:${ currentId } label:${ currentLabel }`}<p />
        Last updated: {`${ typeof (props.lastUpdated)==='undefined'? 'none':props.lastUpdated }`} <p /></div>);
    const showDebugState=debug? debugState:(<div />);
    return (
        <div>
            {showDebugState}
            <TreeMenu
                data={tree}
                // tslint:disable-next-line jsx-no-lambda
                onClickItem={({ label, key }) => {
                    if(debug) { console.log(`selected... ${ label }, ${ key }`); }
                    setSelectedFromExtension(label, key.split('/').pop()||'');
                }}
                resetOpenNodesOnDataUpdate={true}
                ref={childRef}
            />
        </div>
    );

}

export default Hierarchy;