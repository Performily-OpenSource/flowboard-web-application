import {Pipe, PipeTransform} from '@angular/core';

/**
 * Formats a size in bytes as B, KB or MB.
 *
 * @param bytes - The size in bytes.
 * @returns The formatted size, e.g. '1.5 MB'
 * @author Diego Alonso Diaz Villalba
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Pipe that shows the size of a file, e.g. '240 KB'.
 *
 * @author Diego Alonso Diaz Villalba
 */
@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {
  /**
   * Formats a file size.
   *
   * @param bytes - The size in bytes.
   * @returns The formatted size, or '-' when there is no size
   * @author Diego Alonso Diaz Villalba
   */
  transform(bytes: number | null | undefined): string {
    return bytes ? formatFileSize(bytes) : '-';
  }
}
