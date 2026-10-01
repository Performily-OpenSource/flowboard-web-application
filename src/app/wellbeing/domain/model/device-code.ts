export class DeviceCode {
  readonly value: string;
  constructor(value: string) { const normalized=value.trim().toUpperCase(); if (!/^[A-Z0-9-]{4,30}$/.test(normalized)) throw new Error('Device code must contain 4 to 30 uppercase letters, digits or hyphens.'); this.value=normalized; }
}
