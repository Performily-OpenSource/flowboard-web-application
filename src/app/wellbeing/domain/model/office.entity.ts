import {BaseEntity} from '../../../shared/domain/model/base-entity'; 
import {OfficeLocation} from './office-location'; 
import {Device} from './device.entity';

/**
 * Represents a physical workspace within the Wellbeing context.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class Office implements BaseEntity {
    readonly id:number;
    readonly name:string;
    readonly location:OfficeLocation;
    active:boolean;
    readonly devices:Device[];

/**
 * Initializes the instance with the data required for operation.
 * @param props Parameter used by the operation.
 * @author Diana Li
 */
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

/**
 * Links an existing device to a workspace.
 * @param device Parameter used by the operation.
 * @author Diana Li
 */
    linkDevice(device:Device):void{
        if(!this.active)throw new Error('An inactive office cannot receive devices.');
        if(device.status==='LINKED'&&device.officeId!==this.id)throw new Error('The device is already linked to another office.');
        if(device.status==='INACTIVE')throw new Error('Inactive devices cannot be linked.');
        device.status='LINKED';
        device.officeId=this.id;
        if(!this.devices.some(current=>current.id===device.id))this.devices.push(device);
    }

/**
 * Unlinks a device from a workspace.
 * @param device Parameter used by the operation.
 * @author Diana Li
 */
    unlinkDevice(device:Device):void{
        if(device.officeId!==this.id)return;
        device.officeId=null;
        device.status='IN_INVENTORY';
        const index=this.devices.findIndex(current=>current.id===device.id);
        if(index>=0)this.devices.splice(index,1);
    }

/**
 * Deactivates the workspace.
 * @author Diana Li
 */
    deactivate():void{
        this.active=false;
    }
}