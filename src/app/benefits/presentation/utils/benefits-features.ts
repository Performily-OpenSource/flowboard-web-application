/**
 * Whether the views show the periodicity of a benefit type (catalog column, form and detail of
 * "My benefits").
 *
 * @remarks The web service does not store the periodicity yet, so it is hidden. The domain model and
 * the assembler keep it (null when the web service does not send it); set this flag to true when the
 * web service adds the field.
 * @author Salym
 */
export const BENEFIT_PERIODICITY_VISIBLE = false;

/**
 * Whether the catalog offers the edit action of a benefit type.
 *
 * @remarks The web service has no PUT /benefit-types/{id} yet, so the edit button is hidden and the
 * form dialog is only used to create. The edit code of the dialog, the store and the API is kept;
 * set this flag to true when the web service publishes that endpoint.
 * @author Salym
 */
export const BENEFIT_TYPE_EDIT_ENABLED = false;
