// import { SelectedParameters } from './Interfaces';

export const withHTMLSpaces = (param:string|undefined):string =>{
    if (param === '' || typeof param === 'undefined') {return '';}
    return param.replace(/[ ]{2,}/mg, match => match.replace(/ /g, '\xA0'))
}