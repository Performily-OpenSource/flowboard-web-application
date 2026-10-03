import {MetricType} from './metric-type';
/**
 * Represents the value of an environmental metric together with its unit.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class MetricValue {
  readonly metricType: MetricType; readonly value: number;
/**
 * Initializes the instance with the data required for operation.
 * @param metricType Parameter used by the operation.
 * @param value Parameter used by the operation.
 * @author Diana Li
 */
  constructor(metricType: MetricType, value: number) {
    if (!Number.isFinite(value)) throw new Error('Metric value must be numeric.');
    const bounds: Record<MetricType,[number,number]>={TEMPERATURE:[-50,100],ILLUMINATION:[0,10000],AIR_QUALITY:[0,5000]};
    const [min,max]=bounds[metricType]; if(value<min||value>max) throw new Error(`Value for ${metricType} is outside its physical range.`);
    this.metricType=metricType; this.value=value;
  }
/**
 * Returns the unit of measurement associated with the value.
 * @author Diana Li
 */
  unit(): string { return this.metricType==='TEMPERATURE'?'°C':this.metricType==='ILLUMINATION'?'lx':'ppm'; }
}
