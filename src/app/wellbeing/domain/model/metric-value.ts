import {MetricType} from './metric-type';
export class MetricValue {
  readonly metricType: MetricType; readonly value: number;
  constructor(metricType: MetricType, value: number) {
    if (!Number.isFinite(value)) throw new Error('Metric value must be numeric.');
    const bounds: Record<MetricType,[number,number]>={TEMPERATURE:[-50,100],ILLUMINATION:[0,10000],AIR_QUALITY:[0,5000]};
    const [min,max]=bounds[metricType]; if(value<min||value>max) throw new Error(`Value for ${metricType} is outside its physical range.`);
    this.metricType=metricType; this.value=value;
  }
  unit(): string { return this.metricType==='TEMPERATURE'?'°C':this.metricType==='ILLUMINATION'?'lx':'ppm'; }
}
