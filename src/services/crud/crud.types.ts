import { PublicKey } from "@solana/web3.js";
import { Idl } from "@project-serum/anchor";

/**
 * CRUD Program Types with Anchor Support
 */

// Program constants
export const PROGRAM_ID = new PublicKey("3AbGPHrtwVsPZgJsaZp9pJoMCWisyjKLXHn53QejTMSC");

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
      name: "createCrudEntry";
      discriminator: [52, 79, 186, 16, 139, 8, 79, 194];
      accounts: [
        {
          name: "crudEntry";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "arg";
                path: "title";
              },
              {
                kind: "account";
                path: "owner";
              }
            ];
          };
        },
        {
          name: "owner";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
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
      discriminator: [42, 189, 91, 195, 130, 223, 6, 240];
      accounts: [
        {
          name: "crudEntry";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "arg";
                path: "title";
              },
              {
                kind: "account";
                path: "owner";
              }
            ];
          };
        },
        {
          name: "owner";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
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
      discriminator: [170, 8, 190, 38, 255, 222, 33, 201];
      accounts: [
        {
          name: "crudEntry";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "arg";
                path: "title";
              },
              {
                kind: "account";
                path: "owner";
              }
            ];
          };
        },
        {
          name: "owner";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
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
      name: "crudEntryState";
      discriminator: [219, 112, 2, 117, 158, 76, 29, 55];
    }
  ];
  types: [
    {
      name: "crudEntryState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            type: "pubkey";
          },
          {
            name: "title";
            type: "string";
          },
          {
            name: "message";
            type: "string";
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
      name: "createCrudEntry",
      accounts: [
        {
          name: "crudEntry",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "arg",
                type: "string",
                path: "title",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "owner",
              },
            ],
          },
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
          name: "crudEntry",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "arg",
                type: "string",
                path: "title",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "owner",
              },
            ],
          },
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
          name: "crudEntry",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "arg",
                type: "string",
                path: "title",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "owner",
              },
            ],
          },
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
      name: "CrudEntryState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
          },
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
    },
  ],
};

// Account types from IDL
export interface CrudEntryState {
  owner: PublicKey;
  title: string;
  message: string;
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
  data?: CrudEntryState;
  pda?: string;
}

// Hook state types
export interface CrudHookState {
  entries: CrudEntryState[];
  loading: boolean;
  error: string | null;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  error?: string;
}
