/**
 * Represents and validates a device identifier code.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class DeviceCode {
  readonly value: string;
/**
 * Initializes the instance with the data required for operation.
 * @param value Parameter used by the operation.
 * @author Diana Li
 */
  constructor(value: string) { 
    const normalized=value.trim().toUpperCase(); 
    if (!/^[A-Z0-9-]{4,30}$/.test(normalized)) 
      throw new Error('Device code must contain 4 to 30 uppercase letters, digits or hyphens.'); 
    this.value=normalized; }
}
