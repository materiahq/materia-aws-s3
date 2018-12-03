import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'endpointsFilter'
})
export class EndpointsFilterPipe implements PipeTransform {

  transform(values: any[], args: {[key: string]: string}): any {
    const newValue = values.filter(value => value[Object.keys(args)[0]] === args[Object.keys(args)[0]]);
    return newValue;
  }

}
