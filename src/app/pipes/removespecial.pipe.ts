import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removespecial'
})
export class RemovespecialPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let val =  value.replace(/[^a-zA-Z0-9 ]/g, '');
    let val2 = val.replace(/ /g,"-").toLowerCase();
    return val2;
  }

}
