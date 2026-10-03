/**
 * Defines the HealthIndicator structure used by the context.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export type HealthIndicator = 'OPTIMAL' | 'ACCEPTABLE' | 'POOR' | 'HAZARDOUS';
