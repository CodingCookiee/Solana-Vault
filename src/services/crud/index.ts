// CRUD service exports
export * from "./crud.types";
export * from "./crud.service";
export * from "./crud.hooks";

// Re-export commonly used functions
export {
  createCrudEntry,
  updateCrudEntry,
  deleteCrudEntry,
  getCrudEntry,
  getUserCrudEntries,
  validateCrudEntry,
  validateTitle,
} from "./crud.service";

export { useCrudService, useUserCrudEntries } from "./crud.hooks";

export {
  PROGRAM_ID,
  type CrudEntryState,
  type CrudServiceResult,
  type CreateCrudEntryParams,
  type UpdateCrudEntryParams,
  type DeleteCrudEntryParams,
} from "./crud.types";
