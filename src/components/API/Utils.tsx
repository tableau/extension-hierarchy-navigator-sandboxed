export const paramWithCorrectSpaces = (param:string|undefined):string =>{
    if (param === '' || typeof param === 'undefined') {return '';}
    return param.replace(/[ ]{2,}/mg, match => match.replace(/ /g, '&nbsp;'))
}