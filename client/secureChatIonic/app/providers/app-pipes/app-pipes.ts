import { Pipe, Injectable } from '@angular/core';

@Pipe({
  name: 'NgForTextFilter'
})
export class NgForTextFilter {

  // Transform is the new "return function(value, args)" in Angular 1.x
  transform(value, args?) {
    if(!args) return value;

    let [textFilter] = args;
    return value.filter(friend => {
      let foundName = (friend.name && friend.name.includes(textFilter));
      let foundEmail = (friend.email && friend.email.includes(textFilter));
      return (foundName || foundEmail);
    });
  }

}
