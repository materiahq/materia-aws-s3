import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'endpointsSort'
})
export class EndpointsSortPipe implements PipeTransform {

  transform(values: any[]): any {
    const newValue = [];
    const awsEndpointsMethods = {
        upload: 'post',
        fetch: 'get',
        delete: 'delete'
    };
    const methods = ['get', 'post', 'delete'];
    methods.forEach(method => {
        values.forEach(val => {
            if (awsEndpointsMethods[val.type] === method) {
                newValue.push(val);
            }
        });
    });
    return newValue;
  }

}
