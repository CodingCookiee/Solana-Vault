import { PublicKey } from "@solana/web3.js";
import { Idl } from "@project-serum/anchor";

/**
 * CRUD Program Types with Single PDA Architecture
 */

// Program constants
export const PROGRAM_ID = new PublicKey("3AbGPHrtwVsPZgJsaZp9pJoMCWisyjKLXHn53QejTMSC");

// Individual CRUD entry (stored within the user's account)
export interface CrudEntry {
  title: string;
  message: string;
  created_at: number;
  updated_at: number;
}

// User's complete CRUD entries account (single PDA)
export interface UserCrudEntries {
  owner: PublicKey;
  entries: CrudEntry[];
  total_entries: number;
}

// For backward compatibility and UI display
export interface CrudEntryState extends CrudEntry {
  owner: PublicKey;
}

// Transaction result types
export interface CrudTransactionResult {
  signature: string;
  success: boolean;
  error?: string;
  explorerUrl?: string;
}

// CRUD operation types
export interface CreateCrudEntryParams {
  title: string;
  message: string;
}

export interface UpdateCrudEntryParams {
  title: string;
  message: string;
}

export interface DeleteCrudEntryParams {
  title: string;
}

// Service result type
export interface CrudServiceResult extends CrudTransactionResult {
  data?: UserCrudEntries;
}

// Hook state types
export interface CrudHookState {
  entries: CrudEntryState[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Anchor IDL Type Definition
export type Crudapp = {
  address: "3AbGPHrtwVsPZgJsaZp9pJoMCWisyjKLXHn53QejTMSC";
  metadata: {
    name: "crudapp";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "initializeUserEntries";
      accounts: [
        {
          name: "userEntries";
          writable: true;
        },
        {
          name: "owner";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
        }
      ];
      args: [];
    },
    {
      name: "createCrudEntry";
      accounts: [
        {
          name: "userEntries";
          writable: true;
        },
        {
          name: "owner";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
        }
      ];
      args: [
        {
          name: "title";
          type: "string";
        },
        {
          name: "message";
          type: "string";
        }
      ];
    },
    {
      name: "updateCrudEntry";
      accounts: [
        {
          name: "userEntries";
          writable: true;
        },
        {
          name: "owner";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
        }
      ];
      args: [
        {
          name: "title";
          type: "string";
        },
        {
          name: "message";
          type: "string";
        }
      ];
    },
    {
      name: "deleteCrudEntry";
      accounts: [
        {
          name: "userEntries";
          writable: true;
        },
        {
          name: "owner";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
        }
      ];
      args: [
        {
          name: "title";
          type: "string";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "userCrudEntries";
    }
  ];
  types: [
    {
      name: "crudEntry";
      type: {
        kind: "struct";
        fields: [
          {
            name: "title";
            type: "string";
          },
          {
            name: "message";
            type: "string";
          },
          {
            name: "created_at";
            type: "i64";
          },
          {
            name: "updated_at";
            type: "i64";
          }
        ];
      };
    },
    {
      name: "userCrudEntries";
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            type: "pubkey";
          },
          {
            name: "entries";
            type: {
              vec: "CrudEntry";
            };
          },
          {
            name: "total_entries";
            type: "u32";
          }
        ];
      };
    }
  ];
};

// IDL for Anchor Program
export const CRUDAPP_IDL: Idl = {
  version: "0.1.0",
  name: "crudapp",
  instructions: [
    {
      name: "initializeUserEntries",
      accounts: [
        {
          name: "userEntries",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "createCrudEntry",
      accounts: [
        {
          name: "userEntries",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "title",
          type: "string",
        },
        {
          name: "message",
          type: "string",
        },
      ],
    },
    {
      name: "updateCrudEntry",
      accounts: [
        {
          name: "userEntries",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "title",
          type: "string",
        },
        {
          name: "message",
          type: "string",
        },
      ],
    },
    {
      name: "deleteCrudEntry",
      accounts: [
        {
          name: "userEntries",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "title",
          type: "string",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "userCrudEntries",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "entries",
            type: {
              vec: {
                defined: "CrudEntry",
              },
            },
          },
          {
            name: "totalEntries",
            type: "u32",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "CrudEntry",
      type: {
        kind: "struct",
        fields: [
          {
            name: "title",
            type: "string",
          },
          {
            name: "message",
            type: "string",
          },
          {
            name: "createdAt",
            type: "i64",
          },
          {
            name: "updatedAt",
            type: "i64",
          },
        ],
      },
    },
  ],
};
