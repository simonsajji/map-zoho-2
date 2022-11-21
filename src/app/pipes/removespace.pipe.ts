import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removespace'
})
export class RemovespacePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value.replace(/ /g,"-");
  }
}
