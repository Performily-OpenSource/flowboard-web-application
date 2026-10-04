/**
 * Base contract of a wrapped API response.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export interface BaseResponse {}

/**
 * Base contract of a resource (JSON object) returned by the API.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export interface BaseResource {
  /** Unique identifier of the resource. */
  id: number;
}