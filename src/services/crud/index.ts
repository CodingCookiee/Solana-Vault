// Export all CRUD services
export * from "./crud.service";
export * from "./crud.hooks";
export * from "./crud.types";
export * from "./crud.anchor";

// Re-export commonly used functions
export {
  createCrudEntry,
  updateCrudEntry,
  deleteCrudEntry,
  getCrudEntry,
  getUserCrudEntries,
  validateCrudEntry,
  validateTitle,
  isProgramDeployed,
  getProgramInfo,
} from "./crud.service";

export {
  useCrudService,
  useUserCrudEntries,
} from "./crud.hooks";

export {
  PROGRAM_ID,
  CRUDAPP_IDL,
  type CrudEntryState,
  type CrudServiceResult,
  type CreateCrudEntryParams,
  type UpdateCrudEntryParams,
  type DeleteCrudEntryParams,
  type Crudapp,
} from "./crud.types";

export {
  getAnchorProgram,
  deriveCrudEntryPDA,
} from "./crud.anchor";
