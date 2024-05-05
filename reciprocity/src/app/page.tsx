'use client'

import React from 'react';
import Row from './row';
import { type friendsData } from './types'
import Grid from './grid';
import CustomHeader from './customHeader';
import CustomFooter from './customFooter';

export default function Page(){
  const [friends, setFriends] = React.useState<friendsData[]>([
  {name:"bill", id:"3", hangout:false, date:false, hookup:false, image:"https://i.pinimg.com/564x/a7/5d/62/a75d62adddc8397c7820df76d8d05a30.jpg"},
  {name:"john", id:"4", hangout:true, date:false, hookup:false, image:"https://fakeimg.pl/250x100/"},
  {name:"jane", id:"5", hangout:false, date:true, hookup:false, image:"https://fakeimg.pl/250x100/"},
  {name:"doe", id:"6", hangout:false, date:false, hookup:true, image:"https://fakeimg.pl/250x100/"},
  {name:"jane", id:"7", hangout:false, date:false, hookup:true, image:"https://fakeimg.pl/250x100/"},
  {name:"doe", id:"8", hangout:false, date:false, hookup:true, image:"https://fakeimg.pl/250x100/"},
  {name:"jane", id:"9", hangout:false, date:false, hookup:true, image:"https://fakeimg.pl/250x100/"},
  {name:"doe", id:"10", hangout:false, date:false, hookup:true, image:"https://fakeimg.pl/250x100/"},
  {name:"jane", id:"11", hangout:false, date:false, hookup:true, image:"https://fakeimg.pl/250x100/"},
  {name:"doe", id:"12", hangout:false, date:false, hookup:true, image:"https://fakeimg.pl/250x100/"},
  {name:"jane", id:"13", hangout:false, date:false, hookup:true, image:"https://fakeimg.pl/250x100/"}
]);

  return (
    <div style={{backgroundColor:"pink"}}>
    <CustomHeader/>
        <div style={{margin: '20px'}}>
            <Grid friends={friends} setFriends={setFriends} />
        </div>
    <CustomFooter/>
    </div>

);
}