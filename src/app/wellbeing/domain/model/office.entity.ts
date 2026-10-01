import {BaseEntity} from '../../../shared/domain/model/base-entity'; 
import {OfficeLocation} from './office-location'; 
import {Device} from './device.entity';

export class Office implements BaseEntity {
    readonly id:number;
    readonly name:string;
    readonly location:OfficeLocation;
    active:boolean;
    readonly devices:Device[];

    constructor(props:{id:number;name:string;location:OfficeLocation;active:boolean;devices?:Device[]}){
        const name=props.name.trim();
        if(!name)throw new Error('Office name is required.');
        if(name.length>80)throw new Error('Office name cannot exceed 80 characters.');
        this.id=props.id;
        this.name=name;
        this.location=props.location;
        this.active=props.active;
        this.devices=[...(props.devices??[])];
    }

    linkDevice(device:Device):void{
        if(!this.active)throw new Error('An inactive office cannot receive devices.');
        if(device.status==='LINKED'&&device.officeId!==this.id)throw new Error('The device is already linked to another office.');
        if(device.status==='INACTIVE')throw new Error('Inactive devices cannot be linked.');
        device.status='LINKED';
        device.officeId=this.id;
        if(!this.devices.some(current=>current.id===device.id))this.devices.push(device);
    }

    unlinkDevice(device:Device):void{
        if(device.officeId!==this.id)return;
        device.officeId=null;
        device.status='IN_INVENTORY';
        const index=this.devices.findIndex(current=>current.id===device.id);
        if(index>=0)this.devices.splice(index,1);
    }

    deactivate():void{
        this.active=false;
    }
}